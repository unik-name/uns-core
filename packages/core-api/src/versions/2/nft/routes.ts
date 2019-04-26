import Hapi from "hapi";
import { NftController } from "./controller";
import * as Schema from "./schema";

export function registerRoutes(server: Hapi.Server): void {
    const controller = new NftController();
    server.bind(controller);

    server.route({
        method: "GET",
        path: "/nfts",
        handler: controller.index,
    });

    server.route({
        method: "GET",
        path: "/nfts/{id}",
        handler: controller.show,
        options: {
            validate: Schema.show,
        },
    });
}