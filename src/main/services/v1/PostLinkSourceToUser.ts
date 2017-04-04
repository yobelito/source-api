import * as Admin from "firebase-admin";
import * as Express from "express";

// import * as Source from "../models/Source";

/**
 * A function that will check if a given source ID and secret key both exist and are unlinked.
 *
 * If so, the function will link the account to the source.
 * If not, it will return an error.
 */
export function postLinkSourceToUser(db: Admin.database.Database):  (req: Express.Request, res: Express.Response) => Promise<Express.Response> {
    return function (req: Express.Request, res: Express.Response): Promise<Express.Response> {
        return Promise.reject(new Error("Not implemented yet."));
    }
}

export default postLinkSourceToUser;