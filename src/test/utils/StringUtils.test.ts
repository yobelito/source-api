import * as Chai from "chai";

import { randomString }from "../../main/utils/StringUtils";

const expect = Chai.expect;

describe("StringUtils", function() {
    describe("randomString", function() {
        it("Tests that it generates a string of the specified length.", function() {
            const generatedString = randomString(7);
            expect(generatedString).to.have.length(7);
        });

        it("Tests it generates a different string each time.", function() {
            // Can't really test "randomness", but at least determine that it's different.
            let string1: string;
            let string2: string;
            // Skipping the first ten to make it less likely to have a collision.
            for (let i = 10; i < 110; ++i) {
                string1 = randomString(i);
                string2 = randomString(i);
                // Although theoretically, there's a small chance that the two strings can be equal since it's "random".
                expect(string1).to.not.deep.equal(string2);
            }
        })
    });
});