import { app } from "@arkecosystem/core-container";
import { Database, State } from "@arkecosystem/core-interfaces";
import { Identities, Interfaces } from "@arkecosystem/crypto";
import { Enums, getCurrentNftAsset, getNftName, Interfaces as NftInterfaces } from "@uns/core-nft-crypto";
import { DIDTypes, UnsTransactionGroup, UnsTransactionType } from "@uns/crypto";
import { NftPropertyTooLongError } from "../../errors";
import { INftWalletAttributes } from "../../interfaces";
import { nftRepository, NftsManager } from "../../manager";

export const applyNftMintDb = async (senderPublicKey: string, assets: Interfaces.ITransactionAsset): Promise<void> => {
    const { tokenId } = getCurrentNftAsset(assets);
    const senderAddr = Identities.Address.fromPublicKey(senderPublicKey);
    const nftManager = app.resolvePlugin<NftsManager>("core-nft");
    await nftManager.insert(tokenId, senderAddr);
};

export const applyProperties = async (asset: Interfaces.ITransactionAsset): Promise<void> => {
    const { tokenId, properties } = getCurrentNftAsset(asset);
    const nftManager = app.resolvePlugin<NftsManager>("core-nft");
    if (properties && Object.keys(properties).length) {
        await nftManager.manageProperties(properties, tokenId);
    }
};

export const removeNftFromWallet = async (
    wallet: State.IWallet,
    assets: Interfaces.ITransactionAsset,
    walletManager: State.IWalletManager,
) => {
    const { tokenId } = getCurrentNftAsset(assets);
    const walletTokens: INftWalletAttributes = wallet.getAttribute<INftWalletAttributes>("tokens");
    delete walletTokens[tokenId];
    Object.keys(walletTokens).length > 0
        ? wallet.setAttribute("tokens", walletTokens)
        : wallet.forgetAttribute("tokens");
    walletManager.reindex(wallet);
};

export const addNftToWallet = async (
    wallet: State.IWallet,
    walletManager: State.IWalletManager,
    tokenId: string,
    type: DIDTypes,
) => {
    let walletTokens: INftWalletAttributes = wallet.hasAttribute("tokens")
        ? wallet.getAttribute<INftWalletAttributes>("tokens")
        : {};

    walletTokens = { ...walletTokens, [tokenId]: { type } };

    wallet.setAttribute("tokens", walletTokens);

    walletManager.reindex(wallet);
};

export const applyNftTransferDb = async (
    recipientAddress: string,
    assets: Interfaces.ITransactionAsset,
): Promise<void> => {
    const { tokenId } = getCurrentNftAsset(assets);
    const nftManager = app.resolvePlugin<NftsManager>("core-nft");
    await nftManager.updateOwner(tokenId, recipientAddress);
};

export const applyNftTransferInWallets = async (
    transaction: Database.IBootstrapTransaction,
    walletManager: State.IWalletManager,
): Promise<void> => {
    const { asset, senderPublicKey, recipientId } = transaction;
    const { tokenId } = getCurrentNftAsset(asset);
    const senderWallet: State.IWallet = walletManager.findById(senderPublicKey);
    const didType = senderWallet.getAttribute<INftWalletAttributes>("tokens")[tokenId].type;
    await removeNftFromWallet(senderWallet, asset, walletManager);
    const recipientWallet: State.IWallet = walletManager.findByAddress(recipientId);
    await addNftToWallet(recipientWallet, walletManager, tokenId, didType);
};

export const checkAssetPropertiesSize = (properties: NftInterfaces.INftProperties) => {
    for (const [key, value] of Object.entries(properties || {})) {
        if (value && Buffer.from(value, "utf8").length > 255) {
            throw new NftPropertyTooLongError(key);
        }
    }
};

export const revertProperties = async (transaction: Interfaces.ITransactionData): Promise<void> => {
    const { tokenId, properties } = getCurrentNftAsset(transaction.asset);
    if (properties && Object.keys(properties).length) {
        const nftName: string = getNftName(transaction.asset);

        const asset = { nft: { [nftName]: { tokenId } } };
        const transactions = await nftRepository().findTransactionsByAsset(
            asset,
            [
                Enums.NftTransactionType.NftMint,
                Enums.NftTransactionType.NftUpdate,
                UnsTransactionType.UnsCertifiedNftMint,
                UnsTransactionType.UnsCertifiedNftUpdate,
            ],
            [transaction.typeGroup, UnsTransactionGroup],
            "desc",
        );

        const retrievedProperties = {};
        let modifiedPropertyKeys = Object.keys(properties);
        // parse transactions from the last to first to get last value of modified keys
        for (const tx of transactions) {
            if (tx.id === transaction.id) {
                continue;
            }
            for (const key of modifiedPropertyKeys) {
                const txProperties = getCurrentNftAsset(tx.asset).properties;
                if (txProperties.hasOwnProperty(key)) {
                    retrievedProperties[key] = txProperties[key];
                    modifiedPropertyKeys = modifiedPropertyKeys.filter(elt => elt !== key);
                }
            }
            if (!modifiedPropertyKeys.length) {
                break;
            }
        }

        const manager = app.resolvePlugin<NftsManager>("core-nft");
        // delete the new created properties (no last known value)
        for (const key of modifiedPropertyKeys) {
            await manager.deleteProperty(key, tokenId);
        }
        // revert updated properties with last known value
        await manager.manageProperties(retrievedProperties, tokenId);
    }
};
