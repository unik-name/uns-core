import deepmerge = require("deepmerge");
import { TransactionTypes } from "../../constants";

export const extend = (parent, properties): TransactionSchema => {
    return deepmerge(parent, properties);
};

export type TransactionSchema = typeof transactionBaseSchema;

export const signedSchema = (schema: TransactionSchema): TransactionSchema => {
    const signed = extend(schema, signedTransaction);
    signed.$id = `${schema.$id}Signed`;
    return signed;
};

export const strictSchema = (schema: TransactionSchema): TransactionSchema => {
    const signed = signedSchema(schema);
    const strict = extend(signed, strictTransaction);
    strict.$id = `${schema.$id}Strict`;
    return strict;
};

export const transactionBaseSchema = {
    $id: null,
    type: "object",
    required: ["type", "senderPublicKey", "fee", "timestamp"],
    properties: {
        id: { anyOf: [{ $ref: "transactionId" }, { type: "null" }] },
        version: { enum: [1, 2] },
        network: { $ref: "networkByte" },
        expiration: { type: "integer" },
        timestamp: { type: "integer", minimum: 0 },
        amount: { bignumber: { minimum: 1, bypassGenesis: true } },
        fee: { bignumber: { minimum: 1, bypassGenesis: true } },
        senderPublicKey: { $ref: "publicKey" },
        signature: { $ref: "alphanumeric" },
        secondSignature: { $ref: "alphanumeric" },
        signSignature: { $ref: "alphanumeric" },
    },
};

const signedTransaction = {
    required: ["id", "signature"],
};

const strictTransaction = {
    additionalProperties: false,
};

export const transfer = extend(transactionBaseSchema, {
    $id: "transfer",
    required: ["recipientId", "amount"],
    properties: {
        type: { transactionType: TransactionTypes.Transfer },
        vendorField: { anyOf: [{ type: "null" }, { type: "string", format: "vendorField" }] },
        vendorFieldHex: { anyOf: [{ type: "null" }, { type: "string", format: "vendorFieldHex" }] },
        recipientId: { $ref: "address" },
    },
});

export const secondSignature = extend(transactionBaseSchema, {
    $id: "secondSignature",
    required: ["asset"],
    properties: {
        type: { transactionType: TransactionTypes.SecondSignature },
        amount: { bignumber: { minimum: 0, maximum: 0 } },
        secondSignature: { type: "null" },
        asset: {
            type: "object",
            required: ["signature"],
            properties: {
                signature: {
                    type: "object",
                    required: ["publicKey"],
                    properties: {
                        publicKey: {
                            $ref: "publicKey",
                        },
                    },
                },
            },
        },
    },
});

export const delegateRegistration = extend(transactionBaseSchema, {
    $id: "delegateRegistration",
    required: ["asset"],
    properties: {
        type: { transactionType: TransactionTypes.DelegateRegistration },
        amount: { bignumber: { minimum: 0, maximum: 0 } },
        asset: {
            type: "object",
            required: ["delegate"],
            properties: {
                delegate: {
                    type: "object",
                    required: ["username"],
                    properties: {
                        username: { $ref: "delegateUsername" },
                    },
                },
            },
        },
    },
});

export const vote = extend(transactionBaseSchema, {
    $id: "vote",
    required: ["asset"],
    properties: {
        type: { transactionType: TransactionTypes.Vote },
        amount: { bignumber: { minimum: 0, maximum: 0 } },
        recipientId: { $ref: "address" },
        asset: {
            type: "object",
            required: ["votes"],
            properties: {
                votes: {
                    type: "array",
                    minItems: 1,
                    maxItems: 1,
                    additionalItems: false,
                    items: { $ref: "walletVote" },
                },
            },
        },
    },
});

const nft = {
    amount: { bignumber: { minimum: 0, maximum: 0 } },
    asset: {
        type: "object",
        required: ["nft"],
        properties: {
            nft: {
                type: "object",
                required: ["tokenId"],
                properties: {
                    tokenId: {
                        allOf: [{ $ref: "hex" }, { minLength: 64, maxLength: 64 }],
                    },
                },
            },
        },
    },
};

const nftProperties = {
    asset: {
        properties: {
            nft: {
                properties: {
                    properties: {
                        type: "object",
                        minProperties: 1,
                        maxProperties: 255,
                        patternProperties: {
                            "^.*$": { maxLength: 255 },
                        },
                        propertyNames: { maxLength: 255 },
                    },
                },
            },
        },
    },
};

export const nftTransfer = extend(transactionBaseSchema, {
    $id: "nftTransfer",
    required: ["asset", "recipientId"],
    properties: {
        type: { transactionType: TransactionTypes.NftTransfer },
        recipientId: { $ref: "address" },
        ...nft,
    },
});

export const nftUpdate = extend(transactionBaseSchema, {
    $id: "nftUpdate",
    required: ["asset"],
    properties: {
        type: { transactionType: TransactionTypes.NftUpdate },
        ...extend(nft, extend(nftProperties, { asset: { properties: { nft: { required: ["properties"] } } } })), // nft.properties is required
    },
});

export const nftMint = extend(transactionBaseSchema, {
    $id: "nftMint",
    required: ["asset"],
    properties: {
        type: { transactionType: TransactionTypes.NftMint },
        ...extend(nft, nftProperties),
    },
});

export const multiSignature = extend(transactionBaseSchema, {
    $id: "multiSignature",
    properties: {
        type: { transactionType: TransactionTypes.MultiSignature },
        amount: { bignumber: { minimum: 0, maximum: 0 } },
    },
});

export const ipfs = extend(transactionBaseSchema, {
    $id: "ipfs",
    properties: {
        type: { transactionType: TransactionTypes.Ipfs },
        amount: { bignumber: { minimum: 0, maximum: 0 } },
    },
});

export const timelockTransfer = extend(transactionBaseSchema, {
    $id: "timelockTransfer",
    properties: {
        type: { transactionType: TransactionTypes.TimelockTransfer },
        amount: { bignumber: { minimum: 0, maximum: 0 } },
    },
});

export const multiPayment = extend(transactionBaseSchema, {
    $id: "multiPayment",
    properties: {
        type: { transactionType: TransactionTypes.MultiPayment },
        amount: { bignumber: { minimum: 0, maximum: 0 } },
    },
});

export const delegateResignation = extend(transactionBaseSchema, {
    $id: "delegateResignation",
    properties: {
        type: { transactionType: TransactionTypes.DelegateResignation },
        amount: { bignumber: { minimum: 0, maximum: 0 } },
    },
});
