import * as Express from "express";

import * as Returns from "../v1/Returns";

export function auth(next: ((req: Express.Request, res: Express.Response) => Promise<Express.Response>)) {
    return function(req: Express.Request, res: Express.Response): Promise<Express.Response> {
        const token = req.headers["x-access-token"];
        if (!token || token !== process.env.API_TOKEN) {
            return Promise.reject(new Error("No x-access-token header provided or invalid"))
                .catch((err: Error) => {
                    Returns.NotOkay(res, 401, err).send();
                    return res;
                });
        } else {
            return next(req, res);
        }
    }
}
