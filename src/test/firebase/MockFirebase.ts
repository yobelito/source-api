import * as Firebase from "firebase-admin"
import * as Sinon from "sinon";

class MockResult {
    value: any;
    val(): any {
        return this.value;
    }
    exists(): boolean {
        return this.val() !== undefined;
    }

    constructor(val?: any) {
        this.value = val;
    }
}

/**
 * A Firebase Reference mock that contains stubs for each method.
 * This isn't necessarily a complete mock as only the methods  that are actualy used will be mocked.
 *
 * To use this, you may need to either cast it to "Firebase.database.Reference" or "any". The functions and
 * properties of the reference class are stubbed here so through the magic of Javascript it will just "work".
 *
 * All functions are Sinon stubs unless they return other Firebase Objects.  In which case, they will return
 * a mocked version of that object.
 */
export class RefMock {
    child: Sinon.SinonStub;
    once: Sinon.SinonStub;
    set: Sinon.SinonStub;

    constructor() {
        this.child = Sinon.stub().returnsThis();
        this.once = Sinon.stub().returns(Promise.resolve(new MockResult()));
        this.set = Sinon.stub().returns(Promise.resolve());
    }

    /**
     * Update the once call to return the value.  Set to undefined for the result to not exist.
     *
     * @return The stub that can be chained for further calls.
     */
    changeOnce(value: any): Sinon.SinonStub {
        this.once = Sinon.stub().returns(Promise.resolve(new MockResult(value)));
        return this.once;
    }

    changeSet(value: any): Sinon.SinonStub {
        this.set = Sinon.stub().returns(Promise.resolve(new MockResult(value)));
        return this.set;
    }

    reset() {
        this.child.reset();
        this.once.reset();
        this.set.reset();
    }

    restore() {
        // Nothing to do yet.  The stubs don't need to be restored.
    }
}

/**
 * A  Firebase Database mock that contains stubs for each method.
 * This isn't necessarily a complete mock as only the methods that are actualy used will be mocked.
 *
 * To use this, you may need to either cast it to "Firebase.database.Reference" or "any". The functions and
 * properties of the reference class are stubbed here so through the magic of Javascript it will just "work".
 *
 * All functions are Sinon stubs unless they return other Firebase Objects.  In which case, they will return
 * a mocked version of that object.
 */
export class DBMock {
    reference: RefMock;

    ref(): Firebase.database.Reference {
        return this.reference as any;
    }

    constructor() {
        this.reference = new RefMock();
    }

    reset() {
        this.reference.reset();
    }

    restore() {
        this.reference.restore();
    }
}

/**
 * A User mock for a auth mock.  It contains stubs that could be used in place of a user in the Firebase API.
 */
export class MockAuthUser {

    uid: string;

    constructor(uid: string) {
        this.uid = uid;
    }

    reset() {

    }

    restore() {

    }
}

/**
 * A Firebase Authentication mock that contains stubs for each method.
 * This isn't necessarily a complete mock as only the methods that are actualy used will be mocked.
 */
export class AuthMock {

    users: {
        [userId: string]: MockAuthUser;
    };

    constructor() {
        this.users = {};
    }

    createUser(user: MockAuthUser) {
        this.users[user.uid] = user;
    }

    getUser(userId: string): Promise<MockAuthUser> {
        const user = this.users[userId];
        return (user) ? Promise.resolve(user) : Promise.reject(new Error("User not contained in auth."));
    }

    reset() {
        for (let k in this.users) {
            this.users[k].reset();
        }
    }

    restore() {
        for (let k in this.users) {
            this.users[k].restore();
        }
    }
}