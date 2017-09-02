import * as Admin from "firebase-admin";
import * as Express from "express";

import * as Returns from "./Returns";
import { FirebaseDatabase } from "../../firebase/FirebaseController";
import { auth } from "../auth";

export function linkAVS(db: Admin.database.Database): (req: Express.Request, res: Express.Response) => Promise<Express.Response> {
    return auth(async function (req: Express.Request, res: Express.Response) {
        const {user_id, token} = req.body;
        const fbDB = new FirebaseDatabase(db); 
        try {
            await fbDB.linkAVS(user_id, token);
        } catch (err) {
            Returns.NotOkay(res, 400, err).send();
            return res;
        }
        Returns.Okay(res).send();
        return res;
    });
}

export default linkAVS;
