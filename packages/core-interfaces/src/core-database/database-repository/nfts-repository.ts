import { SearchParameters } from "../search";
import { IRepository } from "./repository";

export interface INftsRepository extends IRepository {
    /**
     * Find a nft by its ID.
     */
    findById(id: string): Promise<any>;
    search(params: SearchParameters): Promise<any>;
    delete(id: string): Promise<any>;
    updateOwnerId(id: string, newOwnerId: string): Promise<any>;
    insertProperty(nftid: string, key: string, value: string): Promise<any>;
    findPropertyByKey(nftid: string, key: string): Promise<any>;
    deletePropertyByKey(nftid: string, key: string): Promise<any>;
    updateProperty(nftid: string, key: string, value: string): Promise<any>;
    findProperties(nftid: string): Promise<any>;
}