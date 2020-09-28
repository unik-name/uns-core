import { StateBuilder } from "@arkecosystem/core-database-postgres/src";
import { Delegate } from "@arkecosystem/core-forger/src/delegate";
import { Container, Database } from "@arkecosystem/core-interfaces";
import { Wallets } from "@arkecosystem/core-state";
import { WalletManager } from "@arkecosystem/core-state/src/wallets";
import { Identities, Managers, Networks, Utils } from "@arkecosystem/crypto";
import { nftRepository } from "@uns/core-nft";
import { UNSCertifiedNftMintBuilder } from "@uns/crypto";
import * as NftSupport from "../../functional/transaction-forging/__support__/nft";
import { TransactionFactory } from "../../helpers";
import * as Fixtures from "../../unit/uns-crypto/__fixtures__/index";
import { buildCertifiedDemand } from "../../unit/uns-crypto/helpers";
import genesisBlock from "../../utils/config/dalinet/genesisBlock.json";
import { tearDown } from "../core-transactions/__support__/setup";

let container: Container.IContainer;
let walletManager: WalletManager;
let database: Database.IDatabaseService;
let stateBuilder: StateBuilder;
const tokenId = "a99ee098dd4fd00ba513e1ca09abb8522a8ba94fa2a7a81dd674eac27ce66b94";

beforeAll(async () => {
    container = await NftSupport.setUp();

    // force v2 token Eco
    Managers.configManager.getMilestone().unsTokenEcoV2 = true;

    walletManager = new WalletManager();
    database = container.resolvePlugin<Database.IDatabaseService>("database");
    stateBuilder = new StateBuilder(database.connection, walletManager);
});

afterAll(async () => {
    await database.reset();
    await tearDown();
});

describe("certifiedNftMint handler tests", () => {
    const optionsDefault = {
        timestamp: 12345689,
        previousBlock: {
            id: genesisBlock.id,
            height: 1,
        },
        reward: Utils.BigNumber.ZERO,
    };
    const passphrase = "thisIsAPassphrase";
    let forgeFactoryWallet;
    let senderWallet;

    beforeEach(async () => {
        await database.reset();
        jest.spyOn(nftRepository(), "findById").mockResolvedValue({
            tokenId: Fixtures.issUnikId,
            ownerId: Fixtures.issuerAddress,
        });

        forgeFactoryWallet = new Wallets.Wallet(Fixtures.issuerAddress);
        forgeFactoryWallet.publicKey = Fixtures.issKeys.publicKey;
        walletManager.reindex(forgeFactoryWallet);

        senderWallet = new Wallets.Wallet(Identities.Address.fromPassphrase(passphrase));
        senderWallet.publicKey = Identities.PublicKey.fromPassphrase(passphrase);
        walletManager.reindex(senderWallet);
    });

    it("wallet bootstrap for mint transaction", async () => {
        const properties = {
            type: "1",
            "LifeCycle/Status": "2",
        };

        const demand = buildCertifiedDemand(tokenId, properties, passphrase);

        const transaction = new TransactionFactory(
            new UNSCertifiedNftMintBuilder("unik", tokenId)
                .properties(properties)
                .demand(demand.demand)
                .certification(demand.certification, Fixtures.issuerAddress),
        )
            .withFee(0)
            .withNetwork(NftSupport.network)
            .withPassphrase(passphrase)
            .createOne();

        const delegate = new Delegate("delegate passphrase", Networks.dalinet.network);

        const block = delegate.forge([transaction], optionsDefault);

        await database.connection.saveBlock(block);

        await stateBuilder.run();

        // check sender balance
        expect(senderWallet.balance).toEqual(Utils.BigNumber.ZERO);

        // check forgeFactory balance
        expect(forgeFactoryWallet.balance).toEqual(Utils.BigNumber.ZERO);

        expect(senderWallet.getAttribute("tokens").tokens.includes(tokenId)).toBeTrue();
    });

    it("wallet bootstrap for mint transaction with voucher", async () => {
        const voucherId = "6trg50ZxgEPl9Av8V67c0";

        const properties = {
            type: "1",
            UnikVoucherId: voucherId,
            "LifeCycle/Status": "2",
        };

        const demand = buildCertifiedDemand(tokenId, properties, passphrase);

        const transaction = new TransactionFactory(
            new UNSCertifiedNftMintBuilder("unik", tokenId)
                .properties(properties)
                .demand(demand.demand)
                .certification(demand.certification, Fixtures.issuerAddress),
        )
            .withFee(0)
            .withNetwork(NftSupport.network)
            .withPassphrase(passphrase)
            .createOne();

        const delegate = new Delegate("delegate passphrase", Networks.dalinet.network);

        const block = delegate.forge([transaction], optionsDefault);

        await database.connection.saveBlock(block);

        await stateBuilder.run();

        // check sender balance
        expect(senderWallet.balance).toEqual(Utils.BigNumber.ZERO);

        // check foundation balance
        const foundationPublicKey = Managers.configManager.get("network.foundation.publicKey");
        const foundationWallet = walletManager.findByAddress(Identities.Address.fromPublicKey(foundationPublicKey));
        expect(foundationWallet.balance).toStrictEqual(Utils.BigNumber.ZERO);

        expect(senderWallet.getAttribute("tokens").tokens.includes(tokenId)).toBeTrue();
    });
});
