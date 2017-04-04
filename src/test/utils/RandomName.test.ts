import * as Chai from "chai";

import nameGenerator from "../../main/utils/RandomName";

const expect = Chai.expect;

describe("RandomName", function () {
    describe("name generator", function () {

        it("Tests generateRandomName", function () {
            const name = nameGenerator();
            expect(name).to.exist;
        });

        it("Tests tests \"randomness\"", function () {
            // It's statistically possible to receive the same name twice thanks to laws of probability.
            // So a failure does not indicate it was not generated.
            // So, instead, we're going to loop and hope that we get "randomness" at least 90% of the time.
            // While still possible, highly unlikely.
            let count = 0;
            let max = 100;
            for (let i = 0; i < max; ++i) {
                if (nameGenerator() === nameGenerator()) {
                    ++count;
                }
                expect(count).to.be.lessThan(Math.floor(max * 0.1));
            }
        });
    });
});