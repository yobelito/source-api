import * as Chai from "chai";
import * as Express from "express";
import * as Sinon from "sinon";
import * as SinonChai from "sinon-chai";

import * as Source from "../../../main/models/Source";
import PostNewSource from "../../../main/services/v1/PostNewSource";
import * as MockFirebase from "../../firebase/MockFirebase";

Chai.use(SinonChai);
const expect = Chai.expect;

describe("PostNewSource Service", function () {

    let mockDB: MockFirebase.DBMock;
    let sendSource: Source.SourceObj;

    before(function () {
        mockDB = new MockFirebase.DBMock();
        sendSource = {
            id: "ABC123",
            secretKey: "Secret456"
        };
    });

    afterEach(function () {
        mockDB.reset();
    });

    after(function () {
        mockDB.restore();
    })

    describe("Success", function () {
        it("Tests that a create method returns a successful source.", function () {
            const mockReq: MockRequest = new MockRequest({ source: sendSource });
            const mockRes: MockResponse = new MockResponse();
            return PostNewSource(mockDB as any)(mockReq as any, mockRes as any)
                .then(function (res: Express.Response) {
                    expect(res).to.exist;
                    expect(res.statusCode).to.equal(200);
                    expect(res.statusMessage).to.equal("Success");
                });
        });

        it("Tests that the full expect source object was sent.", function () {
            const mockReq: MockRequest = new MockRequest({ source: sendSource });
            const mockRes: MockResponse = new MockResponse();
            return PostNewSource(mockDB as any)(mockReq as any, mockRes as any)
                .then(function (res: Express.Response) {
                    const sendObj = mockRes.send.args[0][0] as Source.FirebaseSourceObj;
                    expect(sendObj).to.exist;

                    expect(sendObj.id).to.equal(sendSource.id);
                    expect(sendObj.members).to.deep.equal({ bespoken_admin: "owner" });
                    expect(sendObj.name).to.equal(sendSource.id);
                    expect(sendObj.secretKey).to.equal(sendSource.secretKey);
                    expect(new Date(sendObj.created).toDateString()).to.equal(new Date().toDateString());
                });
        });
    });

    describe("Failure", function () {

        it("Tests that it throws an error when body is missing an ID", function () {
            const mockReq: MockRequest = new MockRequest();
            const mockRes: MockResponse = new MockResponse();
            return PostNewSource(mockDB as any)(mockReq as any, mockRes as any)
                .then(verifyFailure);
        });

        it("Tests that it throws an error when source is missing.", function () {
            const mockReq: MockRequest = new MockRequest({ source: undefined });
            const mockRes: MockResponse = new MockResponse();
            return PostNewSource(mockDB as any)(mockReq as any, mockRes as any)
                .then(verifyFailure);
        });

        it("Tests that it throws an error when source is missing an ID", function () {
            const copySource = Object.assign({}, sendSource, { id: undefined });
            const mockReq: MockRequest = new MockRequest({ source: copySource });
            const mockRes: MockResponse = new MockResponse();
            return PostNewSource(mockDB as any)(mockReq as any, mockRes as any)
                .then(verifyFailure);
        });

        it("Tests that it throws an error when source is missing a secretKey", function () {
            const copySource = Object.assign({}, sendSource, { secretKey: undefined });
            const mockReq: MockRequest = new MockRequest({ source: copySource });
            const mockRes: MockResponse = new MockResponse();
            return PostNewSource(mockDB as any)(mockReq as any, mockRes as any)
                .then(verifyFailure);
        });

        it("Tests that a bad creation throws an error", function () {
            const mockDB = new MockFirebase.DBMock();
            mockDB.reference.set = Sinon.stub().returns(Promise.reject(new Error("Error per requirements of the test.")));
            const mockReq: MockRequest = new MockRequest({ source: sendSource });
            const mockRes: MockResponse = new MockResponse();
            return PostNewSource(mockDB as any)(mockReq as any, mockRes as any)
                .then(verifyFailure);

        });

        function verifyFailure(res: Express.Response) {
            expect(res.statusCode).to.equal(403);
            expect(res.statusMessage).to.exist;
        }
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