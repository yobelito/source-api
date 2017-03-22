import * as Chai from "chai";
import * as Sinon from "sinon";
import * as SinonChai from "sinon-chai";

import * as Source from "../../main/models/Source";
import GenerateNameAPI from "../../main/controllers/GenerateNameApi";

Chai.use(SinonChai);
const expect = Chai.expect;

describe("GenerateNameAPI", function () {

    describe("FireBaseMock", function () {

        let db: admin.database.Database;
        let ref: admin.database.Reference;
        let refFunc: Sinon.SinonStub;
        let childFunc: Sinon.SinonStub;
        let onceFunc: Sinon.SinonStub;

        let namingAPI: GenerateNameAPI;

        before(function () {
            db = <admin.database.Database>{};
            ref = <admin.database.Reference>{};

            refFunc = Sinon.stub().returns(ref);
            childFunc = Sinon.stub().returnsThis();
            onceFunc = Sinon.stub().returns(Promise.resolve(new MockResult(false)));

            db.ref = refFunc;
            ref.child = childFunc;
            ref.once = onceFunc;

            namingAPI = new GenerateNameAPI(db);
        });

        afterEach(function () {
            refFunc.reset();
            childFunc.reset();
            onceFunc.reset();
        });

        it("Tests a name is pulled when null is given.", function () {
            return namingAPI.generateUniqueSourceName()
                .then(function (result: Source.SourceObj) {
                    expect(result).to.exist;
                });
        });

        it("Tests that it returns the name passed in if it doesn't already exist.", function () {
            return namingAPI.generateUniqueSourceName("testName")
                .then(function (result: Source.SourceObj) {
                    expect(result.id).to.equal("testName");
                });
        });

        it("Tests that a randomly generated name is passed in if it already exists.", function () {
            // Recreating a new once func to return true on first call so it should generate a new one.
            const newOnceFunc = Sinon.stub().returns(Promise.resolve(new MockResult(false)));
            newOnceFunc.onFirstCall().returns(Promise.resolve(new MockResult(true)));
            ref.once = newOnceFunc;

            return namingAPI.generateUniqueSourceName("testName")
                .then(function (result: Source.SourceObj) {
                    ref.once = onceFunc;

                    expect(result.id).to.exist;
                    expect(result.id).to.not.equal("testName");
                }).catch(function (err: Error) {
                    // In case it fails in the generate method.
                    ref.once = onceFunc;
                    throw err;
                });
        });

        it("Tests that it times out by config size.", function () {
            const newOnceFunc = Sinon.stub().returns(Promise.resolve(new MockResult(true)));
            ref.once = newOnceFunc;

            let caughtError: Error = undefined;
            return namingAPI.generateUniqueSourceName("testName")
                .catch(function (err: Error) {
                    caughtError = err;
                    return true;
                }).then(function () {
                    ref.once = onceFunc;
                    expect(caughtError).to.exist;
                });
        });

        it("Tests that a name is generated if the once value returns an error.", function () {
            const newOnceFunc = Sinon.stub().returns(Promise.reject(new Error("Error thrown per requirements of the test.")));
            ref.once = newOnceFunc;

            let caughtError: Error = undefined;
            return namingAPI.generateUniqueSourceName("testName")
                .catch(function (err: Error) {
                    caughtError = err;
                    return true;
                }).then(function () {
                    ref.once = onceFunc;
                    expect(caughtError).to.exist;
                });
        });
    });
});

class MockResult {
    doesExist: boolean;

    constructor(doesExist: boolean) {
        this.doesExist = doesExist;
    }

    exists() {
        return this.doesExist;
    }
}