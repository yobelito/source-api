import * as Chai from "chai";
import * as Express from "express";
import * as Sinon from "sinon";
import * as SinonChai from "sinon-chai";

import * as Source from "../../../main/models/Source";
import * as User from "../../../main/models/User";
import PostLinkSourceToUser from "../../../main/services/v1/PostLinkSourceToUser";
import * as MockFirebase from "../../firebase/MockFirebase";

Chai.use(SinonChai);
const expect = Chai.expect;

describe("PostLinkSourceToUser Service", function () {

    let mockDB: MockFirebase.DBMock;
    let user: User.UserObj;
    let source: Source.SourceObj;
    let returnObj: Source.FirebaseSourceObj;

    before(function () {
        user = { userId: "UserABC123" };
        source = { id: "ABC123", secretKey: "123ABC" };
        returnObj = {
            id: "ABC123",
            secretKey: "123ABC",
            name: "TestSource",
            created: new Date(2017, 4, 3, 2, 1, 0).toISOString(),
            members: {}
        };

        mockDB = new MockFirebase.DBMock();
        mockDB.reference.changeOnce(returnObj);
    });

    afterEach(function () {
        mockDB.reference.changeOnce(returnObj);
        mockDB.reset();
    })

    describe("Success", function () {

        it("Tests the response is returned.", function () {
            const mockRequest = new MockRequest({ user: user, source: source }) as Express.Request;
            const mockResponse = new MockResponse();
            return PostLinkSourceToUser(mockDB as any)(mockRequest, mockResponse as any)
                .then(function (res: Express.Response) {
                    expect(res).to.exist;
                    expect(res.statusCode).to.equal(200);
                    expect(res.statusMessage).to.equal("Success");
                    expect(res.send).to.be.calledOnce;

                    const sendArg = (res.send as Sinon.SinonStub).args[0][0];
                    const argUser: User.UserObj = sendArg.user;
                    const argSource: Source.FirebaseSourceObj = sendArg.source;
                    expect(argUser).to.deep.equal(user);
                    expect(argSource.id).to.equal(returnObj.id);
                    expect(argSource.secretKey).to.equal(returnObj.secretKey);
                    expect(argSource.created).to.equal(returnObj.created);
                    expect(argSource.name).to.equal(returnObj.name);

                    // Then check the new member was added.
                    expect(argSource.members[user.userId]).to.equal("owner");
                });
        });
    });

    describe("Failure", function () {
        it("Tests that an error is thrown when the user is not present in the query.", function () {
            const mockRequest = new MockRequest({ source: source }) as Express.Request;
            const mockResponse = new MockResponse();
            return PostLinkSourceToUser(mockDB as any)(mockRequest, mockResponse as any)
                .then(checkError);
        });

        it("Tests that an error is thrown when the user ID is not present in the query.", function () {
            const mockRequest = new MockRequest({ user: { userId: undefined }, source: source }) as Express.Request;
            const mockResponse = new MockResponse();
            return PostLinkSourceToUser(mockDB as any)(mockRequest, mockResponse as any)
                .then(checkError);
        });

        it("Tests that an error is thrown when the source is not provided.", function () {
            const mockRequest = new MockRequest({ user: { userId: user } }) as Express.Request;
            const mockResponse = new MockResponse();
            return PostLinkSourceToUser(mockDB as any)(mockRequest, mockResponse as any)
                .then(checkError);
        });

        it("Tests that an error is thrown when the source does not have source id.", function () {
            const mockRequest = new MockRequest({ user: { userId: user }, source: { id: undefined, secretKey: "ABC123" } }) as Express.Request;
            const mockResponse = new MockResponse();
            return PostLinkSourceToUser(mockDB as any)(mockRequest, mockResponse as any)
                .then(checkError);
        });

        it("Tests that an error is thrown when the source does not have secret key.", function () {
            const mockRequest = new MockRequest({ user: { userId: user }, source: { id: "ABC123", secretKey: undefined } }) as Express.Request;
            const mockResponse = new MockResponse();
            return PostLinkSourceToUser(mockDB as any)(mockRequest, mockResponse as any)
                .then(checkError);
        });

        it("Tests that the error is sent when the source is not found.", function () {
            const mockRequest = new MockRequest({ user: user, source: source }) as Express.Request;
            const mockResponse = new MockResponse();
            mockDB.reference.changeOnce(undefined);
            return PostLinkSourceToUser(mockDB as any)(mockRequest, mockResponse as any)
                .then(checkError);
        });

        it("Tests that the error is sent when the returned source already has an owner.", function () {
            const ownedSource = Object.assign({}, returnObj);
            ownedSource.members["TestUser"] = "owner";

            const mockRequest = new MockRequest({ user: user, source: source }) as Express.Request;
            const mockResponse = new MockResponse();
            mockDB.reference.changeOnce(ownedSource);

            return PostLinkSourceToUser(mockDB as any)(mockRequest, mockResponse as any)
                .then(checkError);
        });

        function checkError(res: Express.Response) {
            expect(res).to.exist;
            expect(res.statusCode).to.equal(403);
            expect(res.statusMessage).to.exist;
            expect(res.send).to.be.calledOnce;
        }
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