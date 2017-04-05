import * as Chai from "chai";
import * as SinonChai from "sinon-chai";

import * as MockFirebase from "./MockFirebase";
import * as Source from "../../main/models/Source";
import * as FirebaseController from "../../main/firebase/FirebaseController";

Chai.use(SinonChai);
const expect = Chai.expect;

describe("FirebaseController", function () {
    let mockDB: MockFirebase.DBMock;
    let returnSource: Source.FirebaseSourceObj;
    let returnUser: any;

    before(function () {
        returnSource = {
            id: "ABC123",
            secretKey: "123ABC",
            name: "Test Source",
            members: {
                "TestUser": "owner"
            },
            created: new Date(2017, 4, 4, 5, 4, 3).toISOString()
        }

        returnUser = {
            sources: {
                "ABCD": "owner",
                "EFGH": "owner",
                "JKLM": "member",
                "NOPQ": "member",
                "RSTUV": "owner",
                "WXYZ": "owner"
            }
        }

        mockDB = new MockFirebase.DBMock();
        mockDB.reference.changeOnce(returnSource);
    });

    afterEach(function () {
        mockDB.reset();
        mockDB.reference.changeOnce(returnSource);
    });

    after(function () {
        mockDB.restore();
    });

    describe("FirebaseController.FirebaseUser", function () {
        it("Tests the construction", function () {
            const user: FirebaseController.FirebaseUser = new FirebaseController.FirebaseUser("UserID", mockDB as any, returnUser);
            expect(user.userId).to.equal("UserID");
            expect(user.sources).to.deep.equal(returnUser.sources);
        });

        it("Tests that the controller gave the appropriate parameters to Firebase", function () {
            const user: FirebaseController.FirebaseUser = new FirebaseController.FirebaseUser("TestUser", mockDB as any, returnUser);
            return user.addSource(returnSource)
                .then(function () {
                    const expectedValue = Object.assign({}, returnUser.sources);
                    expectedValue[returnSource.id] = returnSource.members["TestUser"];
                    expect(mockDB.reference.set).to.be.calledOnce;

                    const arg = mockDB.reference.set.args[0][0];
                    expect(arg).to.deep.equal(expectedValue);
                });
        })

        it("Tests that the addSource method works in good conditions.", function () {
            const expectedValue = Object.assign({}, returnUser.sources);
            expectedValue[returnSource.id] = returnSource.members["TestUser"];

            const user: FirebaseController.FirebaseUser = new FirebaseController.FirebaseUser("TestUser", mockDB as any, returnUser);
            return user.addSource(returnSource)
                .then(function (newUser: FirebaseController.FirebaseUser) {
                    expect(newUser).to.exist;
                    expect(newUser.sources[returnSource.id]).to.equal(returnSource.members["TestUser"]);
                });
        });

        it("Tests that the addSource method will thrown error when user is not in the source.", function () {
            const user: FirebaseController.FirebaseUser = new FirebaseController.FirebaseUser("userID", mockDB as any, returnUser);
            let caughtErr: Error;
            return user.addSource(returnSource)
                .catch(function (error: Error) {
                    caughtErr = error;
                }).then(function () {
                    expect(caughtErr).to.exist;
                });
        });

        it("Tests that the add source calls the appropriate locations.", function () {
            const expectedValue = Object.assign({}, returnUser.sources);
            expectedValue[returnSource.id] = returnSource.members["TestUser"];
            const user: FirebaseController.FirebaseUser = new FirebaseController.FirebaseUser("TestUser", mockDB as any, returnUser);
            return user.addSource(returnSource)
                .then(function () {
                    const child = mockDB.reference.child;
                    expect(child.getCall(0)).to.be.calledWith("users")
                    expect(child.getCall(1)).to.be.calledWith(user.userId);
                    expect(child.getCall(2)).to.be.calledWith("sources");
                });
        });
    });

    describe("FirebaseController.FirebaseSource", function () {
        it("Test the construction", function () {
            const source: FirebaseController.FirebaseSource = new FirebaseController.FirebaseSource(mockDB as any, returnSource);
            expect(source.created).to.equal(returnSource.created);
            expect(source.id).to.equal(returnSource.id);
            expect(source.members).to.deep.equal(returnSource.members);
            expect(source.secretKey).to.equal(returnSource.secretKey);
            expect(source.name).to.equal(returnSource.name);
        });

        it("Tests that the hasHowner method returns true if there is an owner.", function () {
            const source: FirebaseController.FirebaseSource = new FirebaseController.FirebaseSource(mockDB as any, returnSource);
            expect(source.hasOwner()).to.be.true;
        });

        it("Tests that the hasOwner method returns false if there is not an owner.", function () {
            const sourceCopy = {
                id: "ABC123",
                secretKey: "123ABC",
                name: "Test Source",
                members: {},
                created: new Date(2017, 4, 4, 5, 4, 3).toISOString()
            }
            const source: FirebaseController.FirebaseSource = new FirebaseController.FirebaseSource(mockDB as any, sourceCopy);
            expect(source.hasOwner()).to.be.false;
        });

        it("Tests that the hasOwner method returns false if there are many users but no owner.", function () {
            const sourceCopy = {
                id: "ABC123",
                secretKey: "123ABC",
                name: "Test Source",
                members: {
                    "user1": "member",
                    "user2": "member",
                    "user3": "member",
                    "user4": "member",
                },
                created: new Date(2017, 4, 4, 5, 4, 3).toISOString()
            }
            const source: FirebaseController.FirebaseSource = new FirebaseController.FirebaseSource(mockDB as any, sourceCopy);
            expect(source.hasOwner()).to.be.false;
        });

        it("Tests that the isOwner Method returns true for correct owner", function () {
            const source: FirebaseController.FirebaseSource = new FirebaseController.FirebaseSource(mockDB as any, returnSource);
            expect(source.isOwner({ userId: "TestUser" })).is.true;
        });

        it("Tests that the isOwner Method returns true for correct owner", function () {
            const source: FirebaseController.FirebaseSource = new FirebaseController.FirebaseSource(mockDB as any, returnSource);
            expect(source.isOwner({ userId: "NoUser" })).is.false;
        });

        it("Tests the convert to obj method.", function () {
            const source: FirebaseController.FirebaseSource = new FirebaseController.FirebaseSource(mockDB as any, returnSource);
            expect(source.toObject()).to.deep.equal(returnSource);
        });

        it("Tests that the setOwner method returns appropriate object.", function () {
            const source: FirebaseController.FirebaseSource = new FirebaseController.FirebaseSource(mockDB as any, returnSource);
            return source.setOwner({ userId: "NewUserID" })
                .then(function (newSource: FirebaseController.FirebaseSource) {
                    expect(newSource.created).to.equal(returnSource.created);
                    expect(newSource.id).to.equal(returnSource.id);
                    expect(newSource.secretKey).to.equal(returnSource.secretKey);
                    expect(newSource.name).to.equal(returnSource.name);
                    expect(newSource.members["NewUserID"]).to.equal("owner");
                    expect(newSource.members["TestUser"]).to.equal("owner");
                });
        });
    });

    describe("FirebaseController.FirebaseDatabase", function () {

        describe("Success", function () {
            let dbController: FirebaseController.FirebaseDatabase;

            beforeEach(function () {
                dbController = new FirebaseController.FirebaseDatabase(mockDB as any);
            });

            it("Tests the getSource method exists.", function () {
                return dbController.getSource({ id: "ABC123", secretKey: "123ABC" })
                    .then(function (source: FirebaseController.FirebaseSource) {
                        expect(source.created).to.equal(returnSource.created);
                        expect(source.id).to.equal(returnSource.id);
                        expect(source.members).to.deep.equal(returnSource.members);
                        expect(source.secretKey).to.equal(returnSource.secretKey);
                        expect(source.name).to.equal(returnSource.name);
                    });
            });

            it("Tests that the correct path was used to retrieve the value.", function () {
                return dbController.getSource({ id: "ABC123", secretKey: "123ABC" })
                    .then(function () {
                        const ref = mockDB.reference;
                        expect(ref.child.getCall(0)).to.be.calledWith("sources");
                        expect(ref.child.getCall(1)).to.be.calledWith("ABC123");
                        expect(ref.once).to.be.calledWith("value");
                    });
            });
        });

        describe("Failure", function () {
            let dbController: FirebaseController.FirebaseDatabase;

            beforeEach(function () {
                mockDB.reference.changeOnce(undefined);
                dbController = new FirebaseController.FirebaseDatabase(mockDB as any);
            });

            it("Tests that an error is thrown when source not found.", function () {
                let caughtErr: Error;
                return dbController.getSource({ id: "ABC123", secretKey: "123ABC" })
                    .catch(function (err: Error) {
                        caughtErr = err;
                    }).then(function () {
                        expect(caughtErr).to.exist;
                    });
            });
        });
    });
});

