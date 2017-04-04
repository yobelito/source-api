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

    constructor(db: Firebase.database.Database, firebaseResult: any) {
        this.db = db;
        this.result = firebaseResult;
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
        return this.result;
    }
}