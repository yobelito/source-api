import * as Chai from "chai";

import * as Source from "../../main/models/Source";

const expect = Chai.expect;

describe("Source", function () {

    describe("Morpher", function() {
        it("Tests that a camel-case slug is morphed", function() {
            return Source.morph("CamelCaseSlugName")
            .then(function(name: string) {
                expect(name).to.equal("camelcaseslugname");
            });
        });

        it("Tests that whitespaces are replaced by dashes", function() {
            return Source.morph("slug name is here")
            .then(function(name: string) {
                expect(name).to.equal("slug-name-is-here");
            });
        });

        it("Tests that special characters are removed.", function() {
            return Source.morph("Slug*Name(Contains&Weird#Characters@")
            .then(function(name: string) {
                expect(name).to.equal("slugnamecontainsweirdcharacters");
            });
        });

        it("Tests all the ascii special characters.", function() {
            return Source.morph("Slug!@#$%^&*()_{}:<>?-=[];'./\|Name")
            .then(function(name: string) {
                expect(name).to.equal("slug-name"); // hyphen is allowed so it keeps.
            });
        });

        it("Tests that many hyphens are collapsed to one.", function() {
            return Source.morph("Slug------------------------------Name")
            .then(function(name: string) {
                expect(name).to.equal("slug-name");
            });
        })
    });

    describe("Validate name", function () {
        it("Tests that nulls are not valid.", function () {
            let errorFound = false;
            return Source.validateName()
                .catch(function (err: Error) {
                    expect(err).to.exist;
                    errorFound = true;
                }).then(function () {
                    expect(errorFound).to.be.true;
                });
        });

        it("Tests that special characters are not allowed.", function () {
            let errorFound = false;
            return Source.validateName("Contains*specialCharacter")
                .catch(function (err: Error) {
                    expect(err).to.exist;
                    errorFound = true;
                }).then(function () {
                    expect(errorFound).to.be.true;
                });
        });

        it("Tests that small slugs are not allowed.", function () {
            let errorFound = false;
            return Source.validateName("aa")
                .catch(function (err: Error) {
                    expect(err).to.exist;
                    errorFound = true;
                }).then(function () {
                    expect(errorFound).to.be.true;
                });
        });

        it("Tests that a valid slug is passed through", function () {
            return Source.validateName("Valid-slug-name")
                .then(function (name: string) {
                    expect(name).to.equal("Valid-slug-name");
                });
        });
    });
});