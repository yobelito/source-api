import * as Chai from "chai";
import * as Sinon from "sinon";
import * as SinonChai from "sinon-chai";

import { generateName } from "../../main/controllers/NameGenerator";

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
                console.info("In the test. " + name);
                expect(name).to.equal("Second name");

                console.info("Testing name checker");
                expect(nameChecker).to.have.been.calledThrice;
                console.info("Testing called with");
                expect(nameChecker.args[0][0]).to.equal("original name");
                expect(nameChecker.args[1][0]).to.equal("First name");
                expect(nameChecker.args[2][0]).to.equal("Second name");

                expect(nameGenerator).to.have.been.calledTwice;
                expect(nameGenerator.args[0][0]).to.equal("original name");
                expect(nameGenerator.args[1][0]).to.equal("First name");
            });
    });
});