import * as Admin from "firebase-admin";
import * as Express from "express";

import GenerateSourceNameApi from "../controllers/GenerateNameApi";
import * as Source from "../models/Source";
import * as Returns from "./Returns";

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