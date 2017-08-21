import * as Admin from "firebase-admin";
import * as Express from "express";

import * as Returns from "./Returns";
import * as sdk from "silent-echo-sdk";

export function postValidateSource(db: Admin.database.Database): (req: Express.Request, res: Express.Response) => Promise<Express.Response> {
    return async function (req: Express.Request, res: Express.Response) {
        const {script, token} = req.body;
        const silentEchoScript = new sdk.SilentEchoScript(token, "https://silentecho-dev.bespoken.io/process");
        let validationResult: sdk.ISilentEchoValidatorResult;
        try {
            validationResult = await silentEchoScript.execute(script);
        } catch (err) {
            Returns.NotOkay(res, 400, err).send();
            return res;
        }
        Returns.Okay(res).send(silentEchoScript.prettifyAsHTML(validationResult));
        return res;
    }
}

export default postValidateSource;
