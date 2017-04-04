import * as Admin from "firebase-admin";
import * as Express from "express";

import { UserObj as User } from "../../models/User";
import { SourceObj as Source, FirebaseSourceObj as FBSource }from "../../models/Source";
import { FirebaseDatabase, FirebaseSource } from "../../firebase/FirebaseController";
import * as Returns from "./Returns";

interface ReturnObj {
    user: User;
    source: FBSource;
}

/**
 * A function that will check if a given source ID and secret key both exist and are unlinked.
 *
 * If so, the function will link the account to the source.
 * If not, it will return an error.
 */
export function postLinkSourceToUser(db: Admin.database.Database): (req: Express.Request, res: Express.Response) => Promise<Express.Response> {
    return function (req: Express.Request, res: Express.Response): Promise<Express.Response> {
        const firebaseDb = new FirebaseDatabase(db);
        return verifyRequest(req, firebaseDb)
            .then(linkSourceToUser)
            .then(function (returnObj: ReturnObj): Express.Response {
                console.log(returnObj);
                Returns.Okay(res).send(returnObj);
                return res;
            }).catch(function (err: Error) {
                console.log(err);
                Returns.NotOkay(res, 403, err).send();
                return res;
            });
    }
}

function linkSourceToUser(value: [User, Source, FirebaseSource]): Promise<ReturnObj> {
    return value[2]
        .setOwner(value[0])
        .then(function(newSource: FirebaseSource) {
            return { user: value[0], source: newSource.toObject() }
        });
}

function verifyRequest(req: Express.Request, db: FirebaseDatabase): Promise<(User | Source | FirebaseSource)[]> {
    return Promise.all([verifyUser(req), verifySource(req)])
        .then(function (value: [User, Source]) {
            return verifyAllowedToUseSource(db)(value[1])
                .then(function (realSource: FirebaseSource) {
                    value.push(realSource);
                    return value;
                });
        });
}

function verifyAllowedToUseSource(db: FirebaseDatabase): (sourceObj: Source) => Promise<FirebaseSource> {
    return function (sourceObj: Source): Promise<FirebaseSource> {
        return db.getSource(sourceObj)
            .then(function (realSource: FirebaseSource): FirebaseSource | Promise<FirebaseSource> {
                if (realSource.hasOwner()) {
                    return Promise.reject(new Error("Source already has an owner."));
                } else {
                    return realSource;
                }
            });
    }
}

function verifyUser(req: Express.Request): Promise<User> {
    const user = req.query.user as User;
    console.log(req.query);
    console.log(user);
    return (user !== undefined && user.userId !== undefined) ? Promise.resolve(user) : Promise.reject(new Error("User is not present."));
}

function verifySource(req: Express.Request): Promise<Source> {
    const source = req.query.source as Source;
    return (source !== undefined && source.id !== undefined && source.secretKey !== undefined) ? Promise.resolve(source) : Promise.reject(new Error("Source is not present."));
}

export default postLinkSourceToUser;