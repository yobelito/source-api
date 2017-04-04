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
    readonly id: string;
    readonly secretKey: string;
    readonly created: string;
    readonly members: Members;
    readonly name: string;

    readonly db: Firebase.database.Database;

    constructor(db: Firebase.database.Database, firebaseResult: any) {
        this.db = db;
        this.id = firebaseResult.id;
        this.secretKey = firebaseResult.secretKey;
        this.created = firebaseResult.created;
        this.members = firebaseResult.members;
        this.name = firebaseResult.name;
    }

    isOwner(user: UserObj) {
        return this.members[user.userId] === "owner";
    }
}