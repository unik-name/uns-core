import { Database, State, TransactionPool } from "@arkecosystem/core-interfaces";
import { Handlers, TransactionReader } from "@arkecosystem/core-transactions";
import { Interfaces, Transactions } from "@arkecosystem/crypto";
import { getCurrentNftAsset, Transactions as NftTransactions } from "@uns/core-nft-crypto";
import { NftOwnedError } from "../../errors";
import { INftWalletAttributes } from "../../interfaces";
import { addNftToWallet, applyNftTransferDb, removeNftFromWallet } from "./helpers";
import { NftMintTransactionHandler } from "./nft-mint";

export class NftTransferTransactionHandler extends Handlers.TransactionHandler {
    public async isActivated(): Promise<boolean> {
        return true;
    }

    public getConstructor(): Transactions.TransactionConstructor {
        return NftTransactions.NftTransferTransaction;
    }

    public dependencies(): ReadonlyArray<Handlers.TransactionHandlerConstructor> {
        return [NftMintTransactionHandler];
    }

    public walletAttributes(): ReadonlyArray<string> {
        return ["tokens"];
    }

    public async bootstrap(connection: Database.IConnection, walletManager: State.IWalletManager): Promise<void> {
        const reader: TransactionReader = await TransactionReader.create(connection, this.getConstructor());

        while (reader.hasNext()) {
            const transactions = await reader.read();

            for (const transaction of transactions) {
                const { asset, senderPublicKey, recipientId } = transaction;
                await removeNftFromWallet(senderPublicKey, asset, walletManager);
                await addNftToWallet(recipientId, asset, walletManager);
            }
        }
    }

    public async throwIfCannotBeApplied(
        transaction: Interfaces.ITransaction,
        wallet: State.IWallet,
        walletManager: State.IWalletManager,
    ): Promise<void> {
        const { tokenId } = getCurrentNftAsset(transaction.data.asset);

        // check if sender owns token
        if (
            !wallet.hasAttribute("tokens") ||
            !wallet.getAttribute<INftWalletAttributes>("tokens").tokens.includes(tokenId)
        ) {
            throw new NftOwnedError(tokenId);
        }

        return super.throwIfCannotBeApplied(transaction, wallet, walletManager);
    }

    public async canEnterTransactionPool(
        data: Interfaces.ITransactionData,
        pool: TransactionPool.IConnection,
        processor: TransactionPool.IProcessor,
    ): Promise<boolean> {
        if (await this.typeFromSenderAlreadyInPool(data, pool, processor)) {
            return false;
        }
        return true;
    }

    public async applyToSender(
        transaction: Interfaces.ITransaction,
        walletManager: State.IWalletManager,
        updateDb = false,
    ): Promise<void> {
        await super.applyToSender(transaction, walletManager);
        const { senderPublicKey, asset, recipientId } = transaction.data;
        await removeNftFromWallet(senderPublicKey, asset, walletManager);
        if (updateDb) {
            return applyNftTransferDb(recipientId, asset);
        }
    }

    public async revertForSender(
        transaction: Interfaces.ITransaction,
        walletManager: State.IWalletManager,
        updateDb = false,
    ): Promise<void> {
        await super.revertForSender(transaction, walletManager);
        const { senderPublicKey, asset } = transaction.data;
        await addNftToWallet(senderPublicKey, asset, walletManager);
        if (updateDb) {
            return applyNftTransferDb(senderPublicKey, asset);
        }
    }

    public async applyToRecipient(
        transaction: Interfaces.ITransaction,
        walletManager: State.IWalletManager,
        // tslint:disable-next-line: no-empty
    ): Promise<void> {
        const { asset, recipientId } = transaction.data;
        await addNftToWallet(recipientId, asset, walletManager);
        // db update is done in applyToSender method
    }

    public async revertForRecipient(
        transaction: Interfaces.ITransaction,
        walletManager: State.IWalletManager,
        // tslint:disable-next-line:no-empty
    ): Promise<void> {
        const { asset, recipientId } = transaction.data;
        await removeNftFromWallet(recipientId, asset, walletManager);
    }
}
