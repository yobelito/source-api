import * as Admin from "firebase-admin";
import * as Express from "express";

import { SourceObj as Source } from "../../models/Source";
import { FirebaseDatabase, FirebaseSource } from "../../firebase/FirebaseController";
import * as Returns from "./Returns";

export function postNewSource(db: Admin.database.Database): (req: Express.Request, res: Express.Response) => Promise<Express.Response> {
    return function (req: Express.Request, res: Express.Response) {
        const fbDb = new FirebaseDatabase(db);
        return Promise.all([verifySource(req)])
            .then(function(source: [Source]) {
                return fbDb.createSource(source[0]);
            }).then(function(fbSource: FirebaseSource) {
                Returns.Okay(res).send(fbSource.toObject());
                return res;
            }).catch(function(err: Error) {
                console.error(err);
                Returns.NotOkay(res, 403, err).send();
                return res;
            });
    }
}

export default postNewSource;

function verifySource(res: Express.Request): Source | Promise<Source> {
    const source = res.body.source as Source;
    if (source !== undefined && source.id !== undefined && source.secretKey !== undefined) {
        return source;
    } else {
        return Promise.reject(new Error("A full source must contain an id and secretKey."));
    }
}