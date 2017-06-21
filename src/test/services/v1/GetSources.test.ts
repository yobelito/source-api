import * as Chai from "chai";
import * as Express from "express";
import * as Sinon from "sinon";
import * as SinonChai from "sinon-chai";

import { getSources } from "../../../main/services/v1/GetSources";
import * as MockFirebase from "../../firebase/MockFirebase";
import { FirebaseDatabase, FirebaseSource } from "../../../main/firebase/FirebaseController";
import { Members, FirebaseSourceObj} from "../../../main/models/Source";

Chai.use(SinonChai);
const expect = Chai.expect;

describe("GetSources Service", function () {
    let mockDB: MockFirebase.DBMock;
    let mockAuth: MockFirebase.AuthMock;
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
        let allReturnObj: FirebaseSource[];
        let sourceObjWithUrl: FirebaseSourceObj;
        let sourceObjWithoutUrl: FirebaseSourceObj;
        let firebaseDBgetSources: Sinon.SinonStub;

        before(function () {
            mockDB = new MockFirebase.DBMock();
            let members: Members = {"knhoyhjHE1RuS5vtqbEjZPdFWVS2": "owner"};
            sourceObjWithUrl = {
                id: "desperate-bradley-AUI5GY",
                created: "2017-04-06T14:59:15.816Z",
                secretKey: "abc",
                members: members,
                membersInfo: [],
                name: "chris-skill",
                monitoring_enabled: false,
                proxy_enabled: false,
                debug_enabled: false
                url: "https://romantic-shelley-8zIRae.bespoken.link"
            };
            sourceObjWithoutUrl = {
                id: "desperate-bradley-AUI5GY",
                created: "2017-04-06T14:59:15.816Z",
                secretKey: "abc",
                members: members,
                membersInfo: [],
                name: "chris-skill",
                monitoring_enabled: false,
                proxy_enabled: false,
                debug_enabled: false
            };
            allReturnObj = [
                new FirebaseSource(mockDB as any, sourceObjWithUrl),
                new FirebaseSource(mockDB as any, sourceObjWithoutUrl)
            ];
            firebaseDBgetSources = Sinon.stub(FirebaseDatabase.prototype, "getSources").returns(Promise.resolve(allReturnObj));
        });

        afterEach(function () {
            mockDB.reset();
            firebaseDBgetSources.reset();
        });

        after(function () {
            mockDB.restore();
            firebaseDBgetSources.restore();
            process.env.API_TOKEN = originalAPITokenEnv;
        });

        it("Tests that a response is returned with all sources.", function () {
            const mockRequest = new MockRequest(undefined, {"x-access-token": apiTokenEnv}) as Express.Request;
            const mockResponse = new MockResponse();
            return getSources(mockAuth as any, mockDB as any)(mockRequest, mockResponse as any)
                .then(function (res: Express.Response) {
                    expect(res).to.exist;
                    expect(res.send).to.be.calledOnce;
                    expect(res.statusCode).to.equal(200);
                    expect(res.statusMessage).to.equal("Success");
                    expect(res.send).to.be.calledWith([sourceObjWithUrl, sourceObjWithoutUrl]);
                });
        });

        it("Tests that a response is returned with sources filtered by monitor queryparam.", function () {
            const mockRequest = new MockRequest({ monitor: "true" }, {"x-access-token": apiTokenEnv}) as Express.Request;
            const mockResponse = new MockResponse();
            return getSources(mockAuth as any, mockDB as any)(mockRequest, mockResponse as any)
                .then(function (res: Express.Response) {
                    expect(res).to.exist;
                    expect(res.send).to.be.calledOnce;
                    expect(res.statusCode).to.equal(200);
                    expect(res.statusMessage).to.equal("Success");
                    expect(res.send).to.be.calledWith([sourceObjWithUrl]);
                });
        });
    });

    describe("Failure", function () {
        let firebaseDBgetSources: Sinon.SinonStub;

        before(function () {
            firebaseDBgetSources = Sinon.stub(FirebaseDatabase.prototype, "getSources").returns(Promise.reject(new Error()));
        });

        afterEach(function () {
            firebaseDBgetSources.reset();
        });

        after(function () {
            firebaseDBgetSources.restore();
        });

        it("Tests that a 400 response is returned when error.", function () {
            const mockRequest = new MockRequest(undefined, {"x-access-token": apiTokenEnv}) as Express.Request;
            const mockResponse = new MockResponse();
            return getSources(mockAuth as any, undefined)(mockRequest, mockResponse as any)
                .then((res: Express.Response) => {
                    expect(res).to.exist;
                    expect(res.send).to.be.calledOnce;
                    expect(res.statusCode).to.equal(400);
                });
        });

        it("Tests that a 401 response is returned when wrong token is provided.", function () {
            const mockRequest = new MockRequest(undefined, {"x-access-token": "wrong-token"}) as Express.Request;
            const mockResponse = new MockResponse();
            return getSources(mockAuth as any, undefined)(mockRequest, mockResponse as any)
                .then((res: Express.Response) => {
                    expect(res).to.exist;
                    expect(res.send).to.be.calledOnce;
                    expect(res.statusCode).to.equal(401);
                });
        });
    });
});

/**
 * It needs to mock the methods and properties that are used so there are a little bit of white-box testing going on.
 */

type headers = {[key:string]: any};

class MockRequest {

    readonly query: any;
    readonly headers: headers;

    constructor(query?: any, headers?: headers) {
        this.query = query || {};
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
