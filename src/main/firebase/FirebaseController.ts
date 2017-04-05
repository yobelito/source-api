import * as Firebase from "firebase-admin";

import { UserObj, FirebaseUserObj } from "../models/User";
import { FirebaseSourceObj, Members, SourceObj } from '../models/Source';

function createNewFirebaseSource(source: SourceObj, members: any = {}): FirebaseSourceObj {
    return {
        id: source.id,
        name: source.name || source.id,
        secretKey: source.secretKey,
        created: source.created || new Date().toISOString(),
        members: members,
    }
}

export class FirebaseDatabase {

    readonly db: Firebase.database.Database;

    constructor(db: Firebase.database.Database) {
        this.db = db;
    }

    createSource(source: SourceObj): Promise<FirebaseSource> {
        const fbSource = createNewFirebaseSource(source, { admin: "owner" });
        return this.db.ref()
            .child("sources")
            .child(source.id)
            .set(fbSource)
            .then((result: any): FirebaseSource => {
                return new FirebaseSource(this.db, fbSource);
            });
    }

    getUser(obj: UserObj): Promise<FirebaseUser> {
        const { userId } = obj;
        return this.db.ref()
            .child("users")
            .child(userId)
            .once("value")
            .then((result: any): FirebaseUser | Promise<FirebaseUser> => {
                if (result.exists()) {
                    return new FirebaseUser(userId, this.db, result.val());
                } else {
                    return Promise.reject("User not found.");
                }
            });
    }

    getSource(obj: SourceObj): Promise<FirebaseSource> {
        const { id } = obj;
        return this.db.ref()
            .child("sources")
            .child(id)
            .once("value")
            .then((result: any): FirebaseSource | Promise<FirebaseSource> => {
                if (result.exists()) {
                    return new FirebaseSource(this.db, result.val());
                } else {
                    return Promise.reject("Source not found.");
                }
            });
    }
}

export class FirebaseUser implements FirebaseUserObj {
    readonly userId: string;
    readonly sources: {
        [userId: string]: string;
    }
    readonly db: Firebase.database.Database;
    readonly myRef: Firebase.database.Reference;

    constructor(id: string, db: Firebase.database.Database, firebaseResult: any) {
        this.db = db;
        this.userId = id;
        this.sources = firebaseResult.sources;
        this.myRef = db.ref().child("users").child(this.userId);
    }

    /**
     * Adds a source to the user's list of sources.  The user must already be contained in
     * the provided source.
     *
     * @param source The source to add the user to.
     *
     * @return A new FirebaseUser that has been updated.
     */
    addSource(source: FirebaseSourceObj): Promise<FirebaseUser> {
        if (source.members[this.userId]) {
            const sourcesCopy = Object.assign({}, this.sources);
            sourcesCopy[source.id] = source.members[this.userId];
            return this.myRef
                .child("sources")
                .set(sourcesCopy)
                .then((result: any) => {
                    return new FirebaseUser(this.userId, this.db, { sources: sourcesCopy } );
                });
        } else {
            return Promise.reject(new Error("User is not a member of the source."));
        }
    }
}

export class FirebaseSource implements FirebaseSourceObj {
    readonly result: FirebaseSourceObj;
    readonly db: Firebase.database.Database;
    readonly myRef: Firebase.database.Reference;

    constructor(db: Firebase.database.Database, firebaseResult: FirebaseSourceObj) {
        this.db = db;
        this.result = firebaseResult;
        this.myRef = db.ref().child("sources").child(this.result.id);
    }

    get id(): string {
        return this.result.id;
    }

    get secretKey(): string {
        return this.result.secretKey;
    }

    get created(): string {
        return this.result.created;
    }

    get members(): Members {
        return this.result.members;
    }

    get name(): string {
        return this.result.name;
    }

    /**
     * Sets the user as the owner of this source.
     * Upon success the promise will return a new
     * Firebase object that has the new data setup.
     */
    setOwner(user: UserObj | FirebaseUser): Promise<FirebaseSource> {
        const membersCopy = Object.assign({}, this.members);
        membersCopy[user.userId] = "owner";

        return this.myRef
            .child("members")
            .set(membersCopy)
            .then(() => {
                const firebaseResultCopy = Object.assign({}, this.result);
                firebaseResultCopy.members = membersCopy;
                return new FirebaseSource(this.db, firebaseResultCopy);
            });
    }

    hasOwner(): boolean {
        for (let v in this.members) {
            if (this.members[v] === "owner") {
                return true;
            }
        }
        return false;
    }

    isOwner(user: UserObj) {
        return this.members[user.userId] === "owner";
    }

    /**
     * Converts this object to a generic FirebaseSourceObj;
     */
    toObject(): FirebaseSourceObj {
        return Object.assign({}, this.result);
    }
}