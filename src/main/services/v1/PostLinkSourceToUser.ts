import * as Admin from "firebase-admin";
import * as Express from "express";

import { UserObj as User } from "../../models/User";
import { SourceObj as Source, FirebaseSourceObj as FBSource } from "../../models/Source";
import { FirebaseDatabase, FirebaseUser, FirebaseSource, Role } from "../../firebase/FirebaseController";
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
                Returns.Okay(res).send(returnObj);
                return res;
            }).catch(function (err: Error) {
                console.log(err);
                Returns.NotOkay(res, 403, err).send();
                return res;
            });
    }
}

function linkSourceToUser(value: [FirebaseUser, FirebaseSource]): Promise<ReturnObj> {
    // Not going to do this is a "promise.all" because the first one must succeed before the next one.
    const user = value[0];
    const source = value[1];
    const returnValues: [FirebaseUser, FirebaseSource] = [value[0], value[1]];

    const newRoles: Role[] = [];
    newRoles.push({ user: { userId: "bespoken_admin" }, role: undefined });
    newRoles.push({ user: user, role: "owner" });

    return source
        .changeMemberRoles(newRoles)
        .then(function(newSource: FirebaseSource) {
            returnValues[1] = newSource;
            return user.addSource(newSource);
        }).then(function(newUser: FirebaseUser) {
            returnValues[0] = newUser;
            return returnValues;
        })
        .then(function (newValues: [FirebaseUser, FirebaseSource]) {
            return { user: { userId: newValues[0].userId }, source: newValues[1].toObject() }
        });
}

function verifyRequest(req: Express.Request, db: FirebaseDatabase): Promise<(FirebaseUser | FirebaseSource)[]> {
    return Promise.all([verifyUser(req), verifySource(req)])
        .then(function (value: [User, Source]) {
            return Promise.all([verifyFirebaseUser(value[0], db), verifyAllowedToUseSource(value[1], db)])
        }).then(function(value: [FirebaseUser, FirebaseSource]) {
            return value as any; // Getting around a dumb compiler bug.
        });
}

function verifyAllowedToUseSource(sourceObj: Source, db: FirebaseDatabase): Promise<FirebaseSource> {
    return db.getSource(sourceObj)
        .then(function (realSource: FirebaseSource): FirebaseSource | Promise<FirebaseSource> {
            if (realSource.id !== sourceObj.id || realSource.secretKey !== sourceObj.secretKey) {
                return Promise.reject(new Error("Could not find source."));
            } else if (!realSource.isOwner({ userId: "bespoken_admin" })) {
                return Promise.reject(new Error("Source already has an owner."));
            } else {
                return realSource;
            }
        });
}

function verifyUser(req: Express.Request): Promise<User> {
    const user = req.body.user as User;
    return (user !== undefined && user.userId !== undefined) ? Promise.resolve(user) : Promise.reject(new Error("User is not present."));
}

function verifySource(req: Express.Request): Promise<Source> {
    const source = req.body.source as Source;
    return (source !== undefined && source.id !== undefined && source.secretKey !== undefined) ? Promise.resolve(source) : Promise.reject(new Error("Source is not present."));
}

function verifyFirebaseUser(user: User, db: FirebaseDatabase): Promise<FirebaseUser> {
    return db.getUser(user);
}

export default postLinkSourceToUser;