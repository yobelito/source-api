import * as Admin from "firebase-admin";
import * as Express from "express";

import GenerateSourceNameApi from "../../controllers/GenerateNameApi";
import * as Source from "../../models/Source";
import * as Returns from "./Returns";

/**
 * A service entrypoint which will generate a unique secret key and ID for a given source ID.
 *
 * @param db The logged in firebase database which contains all the sources currently created.
 *
 * @return A working function that will accept a request and response. It will generate the name and send the response itself.
 *          The promise returned from this function is the response.
 */
export function getSourceId(db: Admin.database.Database): (req: Express.Request, res: Express.Response) => Promise<Express.Response> {
    return function (req: Express.Request, res: Express.Response): Promise<Express.Response> {
        const name = req.query.id;
        const generator: GenerateSourceNameApi = new GenerateSourceNameApi(db);

        return Promise.resolve(name)
            .then(function (name: string) {
                if (name) {
                    return Source.validateName(name).then(Source.morph);
                } else {
                    return name;
                }
            })
            .then(generator.generateUniqueSourceName)
            .then(function(source: Source.SourceObj) {
                Returns.Okay(res).send(source);
                return res;
            }).catch(function(err: Error) {
                Returns.NotOkay(res, 400, err).send();
                return res;
            });
    }
}

export default getSourceId;