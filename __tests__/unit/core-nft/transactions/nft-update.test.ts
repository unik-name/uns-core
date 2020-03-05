import { Managers, Transactions } from "@arkecosystem/crypto";
import { Builders, Transactions as NftTransactions } from "../../../../packages/core-nft-crypto/src";
import * as Fixtures from "../__fixtures__";
import { checkCommonFields } from "../helpers";
import { testNftAssetSchema } from "./schemas-utils";

let builder: Builders.NftUpdateBuilder;

describe("Nft update transaction", () => {
    Managers.configManager.setFromPreset(Fixtures.network);
    Managers.configManager.setHeight(2);
    Transactions.TransactionRegistry.registerTransactionType(NftTransactions.NftUpdateTransaction);

    describe("Ser/deser", () => {
        beforeEach(() => {
            builder = new Builders.NftUpdateBuilder(Fixtures.nftName, Fixtures.nftId);
        });

        for (let i = 0; i++; Fixtures.propertiesAssets.length) {
            const propertiesAsset = Fixtures.propertiesAssets[i];
            it(`should ser/deserialize with properties (${i})`, () => {
                const transaction = builder
                    .properties(propertiesAsset)
                    .sign("passphrase")
                    .getStruct();

                const serialized = Transactions.TransactionFactory.fromData(transaction).serialized.toString("hex");
                const deserialized = Transactions.Deserializer.deserialize(serialized);

                checkCommonFields(deserialized, transaction);
                const expectedAsset = {
                    nft: {
                        [Fixtures.nftName]: {
                            tokenId: Fixtures.nftId,
                            properties: propertiesAsset,
                        },
                    },
                };
                expect(deserialized.data.asset).toStrictEqual(expectedAsset);
            });
        }
    });

    testNftAssetSchema(
        NftTransactions.NftUpdateTransaction,
        new Builders.NftUpdateBuilder(Fixtures.nftName, Fixtures.nftId),
    );
});
