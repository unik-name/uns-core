import BigNumber from "bignumber.js";
import { SATOSHI } from "./constants";
import { configManager } from "./managers";
import { IBlockData } from "./models";
import { INftAsset, ITransactionData } from "./transactions/interfaces";

class Bignum extends BigNumber {
    public static readonly ZERO = new BigNumber(0);
    public static readonly ONE = new BigNumber(1);
}

Bignum.config({ DECIMAL_PLACES: 0 });

/**
 * Get human readable string from satoshis
 */
export function formatSatoshi(amount: Bignum | number | string): string {
    const localeString = (+amount / SATOSHI).toLocaleString("en", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 8,
    });

    return `${localeString} ${configManager.config.client.symbol}`;
}

/**
 * Check if the given block or transaction id is an exception.
 */
export function isException(blockOrTransaction: IBlockData | ITransactionData): boolean {
    return ["blocks", "transactions"].some(key => {
        const exceptions = configManager.get(`exceptions.${key}`);
        return Array.isArray(exceptions) && exceptions.includes(blockOrTransaction.id);
    });
}

/**
 * Sort transactions by type, then id.
 */
export function sortTransactions(transactions: ITransactionData[]): ITransactionData[] {
    return transactions.sort((a, b) => {
        if (a.type < b.type) {
            return -1;
        }

        if (a.type > b.type) {
            return 1;
        }

        if (a.id < b.id) {
            return -1;
        }

        if (a.id > b.id) {
            return 1;
        }

        return 0;
    });
}

let genesisTransactions: { [key: string]: boolean };
let currentNetwork: number;

export const isGenesisTransaction = (id: string): boolean => {
    const network = configManager.get("pubKeyHash");
    if (!genesisTransactions || currentNetwork !== network) {
        currentNetwork = network;
        genesisTransactions = configManager
            .get("genesisBlock.transactions")
            .reduce((acc, curr) => Object.assign(acc, { [curr.id]: true }), {});
    }

    return genesisTransactions[id];
};

export const maxVendorFieldLength = (height?: number): number => configManager.getMilestone(height).vendorFieldLength;

export function sum(a: number, b: number) {
    return a + b;
}

export const getCurrentNftAsset = (transactionData: ITransactionData): INftAsset => {
    if (
        transactionData &&
        transactionData.asset &&
        transactionData.asset.nft &&
        Object.keys(transactionData.asset.nft).length > 0
    ) {
        const nftName = Object.keys(transactionData.asset.nft)[0];
        return transactionData.asset.nft[nftName];
    }
    throw new Error(`Nft asset should be defined in transaction data. Transaction ID: ${transactionData.id}`);
};

export { Bignum };
