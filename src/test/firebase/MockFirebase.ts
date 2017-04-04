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

    constructor() {
        this.child = Sinon.stub().returnsThis();
        this.once = Sinon.stub().returns(Promise.resolve(new MockResult()));
    }

    /**
     * Update the once call to return the value.  Set to undefined for the result to not exist.
     */
    changeOnce(value: any) {
        this.once = Sinon.stub().returns(Promise.resolve(new MockResult(value)));
    }

    reset() {
        this.child.reset();
        this.once.reset();
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