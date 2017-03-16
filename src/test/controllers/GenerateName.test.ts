import * as Chai from "chai";
import * as Sinon from "sinon";
import * as SinonChai from "sinon-chai";

import * as Config from "../../main/config";
import generateName from "../../main/controllers/GenerateName";

Chai.use(SinonChai);
const expect = Chai.expect;

describe("NameGenerator", function () {

    it("Tests that a it returns the original name on default.", function () {
        const nameChecker: Sinon.SinonStub = Sinon.stub().returns(false);
        const nameGenerator: Sinon.SinonStub = Sinon.stub().returns("New Name");
        return generateName("original name", nameChecker, nameGenerator)
            .then(function (name: string) {
                expect(name).to.equal("original name");
                expect(nameChecker).to.have.been.calledOnce;
                expect(nameChecker).to.have.been.calledWith("original name");
                expect(nameGenerator).to.not.have.been.called;
            });
    });

    it("Tests that it returns a new name when original was taken.", function () {
        const nameChecker: Sinon.SinonStub = Sinon.stub().returns(true);
        nameChecker.onThirdCall().returns(false);
        const nameGenerator: Sinon.SinonStub = Sinon.stub()
            .returns("Name that should not be seen because it's too far");
        nameGenerator.onFirstCall().returns("First name");
        nameGenerator.onSecondCall().returns("Second name");

        return generateName("original name", nameChecker, nameGenerator)
            .then(function (name: string) {
                expect(name).to.equal("Second name");

                expect(nameChecker).to.have.been.calledThrice;
                expect(nameChecker.args[0][0]).to.equal("original name");
                expect(nameChecker.args[1][0]).to.equal("First name");
                expect(nameChecker.args[2][0]).to.equal("Second name");

                expect(nameGenerator).to.have.been.calledTwice;
                expect(nameGenerator.args[0][0]).to.equal("original name");
                expect(nameGenerator.args[0][1]).to.equal(Config.GENERATION_FAIL_LIMIT);
                expect(nameGenerator.args[1][0]).to.equal("First name");
                expect(nameGenerator.args[1][1]).to.equal(Config.GENERATION_FAIL_LIMIT - 1);
            });
    });

    it("Tests that it returns a new name when original was taken with promises.", function () {
        const nameChecker: Sinon.SinonStub = Sinon.stub().returns(Promise.resolve(true));
        nameChecker.onThirdCall().returns(Promise.resolve(false));
        const nameGenerator: Sinon.SinonStub = Sinon.stub()
            .returns(Promise.resolve("Name that should not be seen because it's too far"));
        nameGenerator.onFirstCall().returns(Promise.resolve("First name"));
        nameGenerator.onSecondCall().returns(Promise.resolve("Second name"));

        return generateName("original name", nameChecker, nameGenerator)
            .then(function (name: string) {
                expect(name).to.equal("Second name");

                expect(nameChecker).to.have.been.calledThrice;
                expect(nameChecker.args[0][0]).to.equal("original name");
                expect(nameChecker.args[1][0]).to.equal("First name");
                expect(nameChecker.args[2][0]).to.equal("Second name");

                expect(nameGenerator).to.have.been.calledTwice;
                expect(nameGenerator.args[0][0]).to.equal("original name");
                expect(nameGenerator.args[1][0]).to.equal("First name");
            });
    });

    it("Tests that an error is thrown when limit is reached.", function () {
        const nameChecker: Sinon.SinonStub = Sinon.stub().returns(true);
        const nameGenerator: Sinon.SinonStub = Sinon.stub().returns("New Name");

        let errorCaught = false;
        return generateName("original name", nameChecker, nameGenerator)
            .catch(function (error: Error) {
                expect(error).to.exist;
                errorCaught = true;
            }).then(function () {
                expect(errorCaught, "There was no error caught.").to.be.true;
            });
    });

    it("Tests that an error is thrown when limit is reached with set limit.", function () {
        const nameChecker: Sinon.SinonStub = Sinon.stub().returns(true);
        const nameGenerator: Sinon.SinonStub = Sinon.stub().returns("New Name");

        let errorCaught = false;
        return generateName("original name", nameChecker, nameGenerator, 5)
            .catch(function (error: Error) {
                expect(error).to.exist;
                expect(nameChecker).to.have.callCount(5);
                errorCaught = true;
            }).then(function () {
                expect(errorCaught, "There was no error caught.").to.be.true;
            });
    });

    it("Tests that an error is immediately thrown if the limit is negative.", function() {
        const nameChecker: Sinon.SinonStub = Sinon.stub().returns(true);
        const nameGenerator: Sinon.SinonStub = Sinon.stub().returns("New Name");

        let errorCaught = false;
        return generateName("original name", nameChecker, nameGenerator, -1)
            .catch(function (error: Error) {
                expect(error).to.exist;
                errorCaught = true;
            }).then(function () {
                expect(errorCaught, "There was no error caught.").to.be.true;
            });
    });
});