import * as Chai from "chai";
import * as Express from "express";

import * as Returns from "../../../main/services/v1/Returns";

const expect = Chai.expect;

describe("Returns", function () {
    it("Tests the OK method.", function () {
        const res: Express.Response = { statusCode: 0, statusMessage: "" } as Express.Response;
        Returns.Okay(res);
        expect(res.statusCode).to.equal(200);
        expect(res.statusMessage).to.equal("Success");
    });

    it("Tests the OK method with custom message.", function () {
        const res: Express.Response = { statusCode: 0, statusMessage: "" } as Express.Response;
        Returns.Okay(res, "New Message!");
        expect(res.statusCode).to.equal(200);
        expect(res.statusMessage).to.equal("New Message!");
    });

    it("Tests the Not OK Method.", function () {
        const res: Express.Response = { statusCode: 0, statusMessage: "" } as Express.Response;
        Returns.NotOkay(res);
        expect(res.statusCode).to.equal(400);
        expect(res.statusMessage).to.equal("There was an error processing the request.");
    });

    it("Tests the Not OK Method with custom parameters.", function () {
        const res: Express.Response = { statusCode: 0, statusMessage: "" } as Express.Response;
        Returns.NotOkay(res, 450, "Custom error");
        expect(res.statusCode).to.equal(450);
        expect(res.statusMessage).to.equal("Custom error");
    });

    it("Tests the Not OK Method with an Error object.", function() {
        const res: Express.Response = { statusCode: 0, statusMessage: "" } as Express.Response;
        Returns.NotOkay(res, 450, new Error("Custom error"));
        expect(res.statusCode).to.equal(450);
        expect(res.statusMessage).to.equal("Custom error");
    });
});