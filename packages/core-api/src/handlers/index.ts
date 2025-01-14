import { app } from "@arkecosystem/core-container";
import Hapi from "@hapi/hapi";
import * as Blockchain from "./blockchain";
import * as Blocks from "./blocks";
import * as Delegates from "./delegates";
import * as Entities from "./entities";
import * as Locks from "./locks";
import * as Node from "./node";
import * as Peers from "./peers";
import * as Rounds from "./rounds";
import * as Transactions from "./transactions";
import * as Votes from "./votes";
import * as Wallets from "./wallets";

import * as Nfts from "../core-nft/handlers";

export = {
    async register(server: Hapi.Server): Promise<void> {
        const modules = [Blockchain, Blocks, Delegates, Locks, Node, Peers, Rounds, Transactions, Votes, Wallets];

        for (const module of modules) {
            module.register(server);
        }

        // TODO: hook into core-api instead in V3
        if (app.has("core-magistrate-transactions")) {
            Entities.register(server);
        }

        // TODO: uns : same than above i suppose
        if (app.has("core-nft")) {
            Nfts.register(server);
        }
    },
    name: "Public API",
    version: "2.0.0",
};
