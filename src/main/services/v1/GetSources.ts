import * as Admin from "firebase-admin";
import * as Express from "express";

import * as Returns from "./Returns";
import { FirebaseDatabase, FirebaseSource } from "../../firebase/FirebaseController";
import { FirebaseSourceObj } from "../../models/Source";
import { auth } from "../auth";

/**
 * A service entrypoint which returns all the sources from the given `db`.
 *
 * @param db The logged in firebase database which contains all the sources currently created.
 *
 * @return A working function that will accept a request and response.
 *          The promise returned from this function is the response.
 */
export function getSources(db: Admin.database.Database): (req: Express.Request, res: Express.Response) => Promise<Express.Response> {
    return auth(function(req: Express.Request, res: Express.Response): Promise<Express.Response> {
        const fbDb = new FirebaseDatabase(db);
        return Promise.resolve(fbDb.getSources())
            .then((firebaseSources: FirebaseSource[]) => {
                if (req.query.monitor === 'true') {
                    let sources: FirebaseSourceObj[] = [];
                    for (var firebaseSource of firebaseSources) {
                        if (firebaseSource.url && firebaseSource.monitoring_enabled) {
                            sources.push(firebaseSource.toObject());
                        }
                    }
                    Returns.Okay(res).send(sources);
                    return res;
                } else {
                    let sources: FirebaseSourceObj[] = [];
                    for (var firebaseSource of firebaseSources) {
                        sources.push(firebaseSource.toObject());
                    }
                    Returns.Okay(res).send(sources);
                    return res;
                }
            })
            .catch((err: Error) => {
                console.log(err);
                Returns.NotOkay(res, 400, err).send();
                return res;
            });
  });
}

export default getSources;
