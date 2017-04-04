import * as Express from "express";

/**
 * Sets up the response header with the OK response.
 *
 * @param res The response header that will be sent.
 * @param msg Optional: The success message. A generic message will be sent if not provided.
 *
 * @return The same response header.
 */
export function Okay(res: Express.Response, msg: string = "Success"): Express.Response {
    res.statusCode = 200;
    res.statusMessage = msg;
    return res;
}

/**
 * Sets up the response header for a failure response.
 *
 * @param res The response header that will be sent.
 * @param code Optional: The error code that will be associated with the response. 400 by default.
 * @param msg Optional: The error message associated with the error. A default message is presented if not available.
 */
export function NotOkay(res: Express.Response, code: number = 400, msg: string | Error = "There was an error processing the request."): Express.Response {
    const message = (msg instanceof Error) ? msg.message : msg;
    res.statusCode = code;
    res.statusMessage = message;
    return res;
}