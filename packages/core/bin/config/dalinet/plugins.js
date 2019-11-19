module.exports = {
    "@arkecosystem/core-event-emitter": {},
    "@arkecosystem/core-logger-signale": {
        config: {
            displayDate: true,
            displayTimestamp: true,
            displayBadge: false,
        },
        types: {
            info: {
                color: "green",
            },
            debug: {
                color: "cyan",
            },
        }
    },
    "@arkecosystem/core-p2p": {
        server: {
            port: process.env.CORE_P2P_PORT || 4002,
        },
        minimumNetworkReach: 5,
    },
    "@arkecosystem/core-state": {},
    "@arkecosystem/core-magistrate-transactions": {},
    "@arkecosystem/core-database-postgres": {
        connection: {
            host: process.env.CORE_DB_HOST || "localhost",
            port: process.env.CORE_DB_PORT || 5432,
            database: process.env.CORE_DB_DATABASE || `${process.env.CORE_TOKEN}_${process.env.CORE_NETWORK_NAME}`,
            user: process.env.CORE_DB_USERNAME || process.env.CORE_TOKEN,
            password: process.env.CORE_DB_PASSWORD || "password",
        },
        estimateTotalCount: false // TODO: uns : otherwise total count of nfts was incorrect
    },
    "@uns/core-nft":{},
    "@arkecosystem/core-transaction-pool": {
        enabled: !process.env.CORE_TRANSACTION_POOL_DISABLED,
        maxTransactionsPerSender: process.env.CORE_TRANSACTION_POOL_MAX_PER_SENDER || 300,
        allowedSenders: [],
        dynamicFees: {
            enabled: true,
            minFeePool: 1000,
            minFeeBroadcast: 1000,
            addonBytes: {
                transfer: 100,
                secondSignature: 250,
                delegateRegistration: 400000,
                vote: 100,
                multiSignature: 500,
                ipfs: 250,
                multiPayment: 500,
                delegateResignation: 100,
                htlcLock: 100,
                htlcClaim: 0,
                htlcRefund: 0,
            },
        },
    },
    "@arkecosystem/core-blockchain": {},
    "@arkecosystem/core-api": {
        enabled: !process.env.CORE_API_DISABLED,
        host: process.env.CORE_API_HOST || "0.0.0.0",
        port: process.env.CORE_API_PORT || 4003,
    },
    "@uns/chainmeta-plugin": {},
    "@arkecosystem/core-wallet-api": {},
    "@arkecosystem/core-webhooks": {
        enabled: process.env.CORE_WEBHOOKS_ENABLED,
        server: {
            host: process.env.CORE_WEBHOOKS_HOST || "0.0.0.0",
            port: process.env.CORE_WEBHOOKS_PORT || 4004,
            whitelist: ["127.0.0.1", "::ffff:127.0.0.1"],
        },
    },
    "@arkecosystem/core-forger": {},
    "@arkecosystem/core-exchange-json-rpc": {
        enabled: process.env.CORE_EXCHANGE_JSON_RPC_ENABLED,
        host: process.env.CORE_EXCHANGE_JSON_RPC_HOST || "0.0.0.0",
        port: process.env.CORE_EXCHANGE_JSON_RPC_PORT || 8080,
        allowRemote: false,
        whitelist: ["127.0.0.1", "::ffff:127.0.0.1"],
    },
    "@arkecosystem/core-snapshots": {},
};