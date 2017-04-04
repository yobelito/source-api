import * as Firebase from "firebase-admin";

import { UserObj } from "../models/User";
import { FirebaseSourceObj, Members, SourceObj } from '../models/Source';

export class FirebaseDatabase {

    readonly db: Firebase.database.Database;

    constructor(db: Firebase.database.Database) {
        this.db = db;
    }

    getSource(obj: SourceObj): Promise<FirebaseSource> {
        return this.db.ref()
            .child("sources")
            .child(obj.id)
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

export class FirebaseSource implements FirebaseSourceObj {
    readonly result: FirebaseSourceObj;
    readonly db: Firebase.database.Database;
    readonly myRef: Firebase.database.Reference;

    constructor(db: Firebase.database.Database, firebaseResult: any) {
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
    setOwner(user: UserObj): Promise<FirebaseSource> {
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