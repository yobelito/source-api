import * as Chai from "chai";
import * as Express from "express";
import * as Sinon from "sinon";
import * as SinonChai from "sinon-chai";
import * as sdk from "silent-echo-sdk";

import PostValidateSource from "../../../main/services/v1/PostValidateSource";
import * as MockFirebase from "../../firebase/MockFirebase";

Chai.use(SinonChai);
const expect = Chai.expect;

describe("PostValidateSource Service", function () {

    let mockDB: MockFirebase.DBMock;
    let seScriptExecuteStub: any;
    let seScriptprettifyAsHTMLStub: any;

    before(function () {
        mockDB = new MockFirebase.DBMock();
    });

    afterEach(function () {
        mockDB.reset();
        seScriptExecuteStub.restore();
        seScriptprettifyAsHTMLStub.restore();
    });

    after(function () {
        mockDB.restore();
    });

    describe("Success", function () {
        it("Tests that returns success response", function () {
            seScriptExecuteStub = Sinon.stub(sdk.SilentEchoScript.prototype, "execute").returns([]);
            seScriptprettifyAsHTMLStub = Sinon.stub(sdk.SilentEchoScript.prototype, "prettifyAsHTML").returns("");
            const mockReq: MockRequest = new MockRequest({});
            const mockRes: MockResponse = new MockResponse();
            return PostValidateSource(mockDB as any)(mockReq as any, mockRes as any)
                .then(function (res: Express.Response) {
                    expect(res).to.exist;
                    expect(res.statusCode).to.equal(200);
                    expect(res.statusMessage).to.equal("Success");
                });
        });
    });
    describe("Failure", function () {
        it("Tests that it returns response", function () {
            seScriptExecuteStub = Sinon.stub(sdk.SilentEchoScript.prototype, "execute").throws(sdk.SilentEchoScriptSyntaxError);
            const mockReq: MockRequest = new MockRequest();
            const mockRes: MockResponse = new MockResponse();
            return PostValidateSource(mockDB as any)(mockReq as any, mockRes as any)
                .then(function (res: Express.Response) {
                    expect(res).to.exist;
                    expect(res.statusCode).to.equal(400);
                    expect(res.statusMessage).to.equal(sdk.SilentEchoScriptSyntaxError.message);
                });
        });
    });
});


/**
 * It needs to mock the methods and properties that are used so there are a little bit of white-box testing going on.
 */
class MockRequest {

    readonly body: any;

    constructor(body?: any) {
        this.body = body || {};
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
