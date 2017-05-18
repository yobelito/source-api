import * as Chai from "chai";
import * as Express from "express";
import * as Sinon from "sinon";
import * as SinonChai from "sinon-chai";

import GetSources from "../../../main/services/v1/GetSources";
import * as MockFirebase from "../../firebase/MockFirebase";
import { FirebaseDatabase, FirebaseSource } from "../../../main/firebase/FirebaseController";
import { Members, FirebaseSourceObj} from "../../../main/models/Source";

Chai.use(SinonChai);
const expect = Chai.expect;

describe("GetSources Service", function () {
    let mockDB: MockFirebase.DBMock;

    describe("Success", function () {
        let returnObj: FirebaseSource[];
        let getSources: Sinon.SinonStub;

        before(function () {
            mockDB = new MockFirebase.DBMock();
            let members: Members = {"knhoyhjHE1RuS5vtqbEjZPdFWVS2": "owner"};
            let sourceObj: FirebaseSourceObj = {
                "id": "desperate-bradley-AUI5GY",
                "created": "2017-04-06T14:59:15.816Z",
                "secretKey": "abc",
                "members": members,
                "name": "chris-skill",
                "url": "https://romantic-shelley-8zIRae.bespoken.link"
            };
            returnObj = [new FirebaseSource(mockDB as any, sourceObj)]; 
            getSources = Sinon.stub(FirebaseDatabase.prototype, "getSources").returns(Promise.resolve(returnObj));
        });

        afterEach(function () {
            mockDB.reset();
            getSources.reset();
        });

        after(function () {
            mockDB.restore();
            getSources.restore();
        });

        it("Tests that a response is returned.", function () {
            const mockRequest = new MockRequest({ monitor: "true" }) as Express.Request;
            const mockResponse = new MockResponse();
            return GetSources(mockDB as any)(mockRequest, mockResponse as any)
                .then(function (res: Express.Response) {
                    expect(res).to.exist;
                    expect(res.send).to.be.calledOnce;
                    expect(res.statusCode).to.equal(200);
                    expect(res.statusMessage).to.equal("Success");
                    expect(res.send).to.be.calledWith();
                });
        });


    });

    describe("Failure", function () {
        let returnObj: FirebaseSource[];
        let getSources: Sinon.SinonStub;

        before(function () {
            mockDB = new MockFirebase.DBMock();
            let members: Members = {"knhoyhjHE1RuS5vtqbEjZPdFWVS2": "owner"};
            let sourceObj: FirebaseSourceObj = {
                "id": "desperate-bradley-AUI5GY",
                "created": "2017-04-06T14:59:15.816Z",
                "secretKey": "abc",
                "members": members,
                "name": "chris-skill",
                "url": "https://romantic-shelley-8zIRae.bespoken.link"
            };
            returnObj = [new FirebaseSource(mockDB as any, sourceObj)]; 
            getSources = Sinon.stub(FirebaseDatabase.prototype, "getSources").returns(Promise.resolve(returnObj));
        });

        afterEach(function () {
            mockDB.reset();
            getSources.reset();
        });

        after(function () {
            mockDB.restore();
            getSources.restore();
        });

        it("Tests that a 400 response is returned when monitor queryparam is not provided.", function () {
            const mockRequest = new MockRequest() as Express.Request;
            const mockResponse = new MockResponse();
            return GetSources(undefined)(mockRequest, mockResponse as any)
                .then(function (res: Express.Response) {
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
class MockRequest {

    readonly query: any;

    constructor(query?: any) {
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
