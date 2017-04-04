import * as Chai from "chai";
import * as Express from "express";
import * as Sinon from "sinon";
import * as SinonChai from "sinon-chai";

import GenerateSourceNameApi from "../../../main/controllers/GenerateNameApi";
import * as Source from "../../../main/models/Source";
import GetSourceId from "../../../main/services/v1/GetSourceId";

Chai.use(SinonChai);
const expect = Chai.expect;

describe("GetSourceId Service", function () {

    describe("Success", function () {
        let generateStub: Sinon.SinonStub;
        let returnObj: Source.SourceObj;

        before(function() {
            returnObj = { id: "New Name", secretKey: "New key" };
            generateStub = Sinon.stub(GenerateSourceNameApi.prototype, "generateUniqueSourceName").returns(Promise.resolve(returnObj));
        });

        afterEach(function() {
            generateStub.reset();
        });

        after(function() {
            generateStub.restore();
        });

        it("Tests a the response is returned.", function() {
            const mockRequest = new MockRequest({ query: { id: "TestID" } }) as Express.Request;
            const mockResponse = new MockResponse();
            return GetSourceId(undefined)(mockRequest, mockResponse as any)
                .then(function (res: Express.Response) {
                    expect(res).to.exist;
                    expect(res.send).to.be.calledOnce;
                    expect(res.statusCode).to.equal(200);
                    expect(res.statusMessage).to.equal("Success");
                    expect(res.send).to.be.calledWith(returnObj);
                });
        });
    });

    describe("Failure", function() {
        let generateStub: Sinon.SinonStub;

        before(function() {
            generateStub = Sinon.stub(GenerateSourceNameApi.prototype, "generateUniqueSourceName").returns(Promise.reject(new Error("Error per requirements of the test.")));
        });

        afterEach(function() {
            generateStub.reset();
        });

        after(function() {
            generateStub.restore();
        });

        it("Tests a successful send.", function () {
            const mockRequest = new MockRequest({ query: { id: "TestID" } }) as Express.Request;
            const mockResponse = new MockResponse();
            return GetSourceId(undefined)(mockRequest, mockResponse as any)
                .then(function (res: Express.Response) {
                    expect(res).to.exist;

                    expect(mockResponse.send).to.be.calledOnce;
                    expect(mockResponse.statusCode).to.equal(400);
                    expect(mockResponse.statusMessage).to.equal("Error per requirements of the test.");
                });
        });
    });
});

/**
 * It needs to mock the methods and properties that are used so there are a little bit of white-box testing going on.
 */
class MockRequest {

    readonly query: any;

    constructor(query: any) {
        this.query = query || {};
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