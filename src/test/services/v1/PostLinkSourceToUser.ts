import * as Chai from "chai";
import * as Express from "express";
import * as Sinon from "sinon";
import * as SinonChai from "sinon-chai";

import * as Source from "../../../main/models/Source";
import * as User from "../../../main/models/User";
import PostLinkSourceToUser from "../../../main/services/v1/PostLInkSourceToUser";

Chai.use(SinonChai);
const expect = Chai.expect;

describe("PostLinkSourceToUser Service", function () {

    describe("Success", function() {

        let user: User.UserObj;
        let source: Source.SourceObj;

        before(function() {
            user = { userId: "UserABC123" }
            source = { id: "ABC123", secretKey: "123ABC" }
        });

        it("Tests the response is returned.", function() {
            const mockRequest = new MockRequest({ query: { user: user, source: source }}) as Express.Request;
            const mockResponse = new MockResponse();
            return  PostLinkSourceToUser(undefined)(mockRequest, mockResponse as any)
                .then(function(res: Express.Response) {
                    expect(res).to.exist;
                    expect(res.statusCode).to.equal(200);
                    expect(res.statusMessage).to.equal("Success");
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