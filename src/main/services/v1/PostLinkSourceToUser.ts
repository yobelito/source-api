import * as Admin from "firebase-admin";
import * as Express from "express";

import * as User from "../../models/User";
import * as Source from "../../models/Source";
import * as FirebaseController from "../../firebase/FirebaseController";
import * as Returns from "./Returns";

interface ReturnObj {
    user: User.UserObj;
    source: FirebaseController.FirebaseSource;
}

/**
 * A function that will check if a given source ID and secret key both exist and are unlinked.
 *
 * If so, the function will link the account to the source.
 * If not, it will return an error.
 */
export function postLinkSourceToUser(db: Admin.database.Database): (req: Express.Request, res: Express.Response) => Promise<Express.Response> {
    return function (req: Express.Request, res: Express.Response): Promise<Express.Response> {
        const firebaseDb = new FirebaseController.FirebaseDatabase(db);
        return verifyRequest(req)
            .then(verifyAllowedToUseSource(firebaseDb))
            .then(linkSourceToUser)
            .then(function (returnObj: ReturnObj): Express.Response {
                Returns.Okay(res).send(returnObj);
                return res;
            }).catch(function (err: Error) {
                Returns.NotOkay(res, 403, err).send();
                return res;
            });
    }
}

function verifyAllowedToUseSource(db: FirebaseController.FirebaseDatabase): (returnObj: ReturnObj) => Promise<ReturnObj> {
    return function (returnObj: ReturnObj): Promise<ReturnObj> {
        return db.getSource(returnObj.source)
            .then(function (realSource: FirebaseController.FirebaseSource): ReturnObj | Promise<ReturnObj> {
                if (realSource.hasOwner()) {
                    return Promise.reject(new Error("Source already has an owner."));
                } else {
                    return returnObj;
                }
            });
    }
}

function linkSourceToUser(ReturnObj: ReturnObj): Promise< ReturnObj> {
    return Promise.resolve(ReturnObj);
}

function verifyRequest(req: Express.Request): Promise<ReturnObj> {
    return verifyUser(req)
        .then(function (user: User.UserObj) {
            return verifySource(req)
                .then(function (source: Source.SourceObj) {
                    return { user: user, source: source };
                });
        });
}

function verifyUser(req: Express.Request): Promise<User.UserObj> {
    const user = req.query.user as User.UserObj;
    return (user && user.userId) ? Promise.resolve(user) : Promise.reject(new Error("User is not presented."));
}

function verifySource(req: Express.Request): Promise<Source.SourceObj> {
    const source = req.query.source as Source.SourceObj;
    return (source && source.id && source.secretKey) ? Promise.resolve(source) : Promise.reject(new Error("Source is not presented."));
}

export default postLinkSourceToUser;