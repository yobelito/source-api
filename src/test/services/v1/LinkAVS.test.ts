import * as Chai from "chai";
import * as Express from "express";
import * as Sinon from "sinon";
import * as SinonChai from "sinon-chai";

import { linkAVS } from "../../../main/services/v1/LinkAVS";
import { FirebaseDatabase } from "../../../main/firebase/FirebaseController";

Chai.use(SinonChai);
const expect = Chai.expect;

describe("LinkAVS Service", function () {
    let apiTokenEnv: string = "secure-token";
    let originalAPITokenEnv: string;

    beforeEach(function() {
        originalAPITokenEnv = process.env.API_TOKEN;
        process.env.API_TOKEN = apiTokenEnv;
    });

    afterEach(function () {
        process.env.API_TOKEN = originalAPITokenEnv;
    });

    describe("Success", function () {
        let firebaseDBlinkAVS: Sinon.SinonStub;

        before(function () {
            firebaseDBlinkAVS = Sinon.stub(FirebaseDatabase.prototype, "linkAVS")
                .returns(Promise.resolve({}));
        });

        afterEach(function () {
            firebaseDBlinkAVS.reset();
        });

        after(function () {
            firebaseDBlinkAVS.restore();
            process.env.API_TOKEN = originalAPITokenEnv;
        });

        it("Tests that a successful response is returned.", function () {
            const mockRequest = new MockRequest({user_id: "user_id", token: "token"},
                {"x-access-token": apiTokenEnv}) as Express.Request;
            const mockResponse = new MockResponse();
            return linkAVS(undefined)(mockRequest, mockResponse as any)
                .then(function (res: Express.Response) {
                    expect(res).to.exist;
                    expect(res.send).to.be.calledOnce;
                    expect(res.statusCode).to.equal(200);
                });
        });
    });

    describe("Failure", function () {
        let firebaseDBlinkAVS: Sinon.SinonStub;

        before(function () {
            firebaseDBlinkAVS = Sinon.stub(FirebaseDatabase.prototype, "linkAVS")
                .returns(Promise.reject(new Error()));
        });

        afterEach(function () {
            firebaseDBlinkAVS.reset();
        });

        after(function () {
            firebaseDBlinkAVS.restore();
        });

        it("Tests that a 400 response is returned when error.", function () {
            const mockRequest = new MockRequest(undefined, {"x-access-token": apiTokenEnv}) as Express.Request;
            const mockResponse = new MockResponse();
            return linkAVS(undefined)(mockRequest, mockResponse as any)
                .then((res: Express.Response) => {
                    expect(res).to.exist;
                    expect(res.send).to.be.calledOnce;
                    expect(res.statusCode).to.equal(400);
                });
        });
    });
});

/**
 * It needs to mock the methods and properties that are used so there are a little bit of white-box testing going on.
 */

type headers = {[key:string]: any};

class MockRequest {

    readonly body: any;
    readonly headers: headers;

    constructor(body?: any, headers?: headers) {
        this.body = body || {};
        this.headers = headers || {};
    }
}

class MockResponse {
    statusCode: number;
    statusMessage: string;
    send: Sinon.SinonStub;

    constructor() {
        this.send = Sinon.stub();
    }

    reset() {
        this.send.reset();
    }
}
