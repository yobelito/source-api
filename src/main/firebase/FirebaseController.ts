import * as Firebase from "firebase-admin";
import * as Bluebird from "bluebird";

import { UserObj, FirebaseUserObj } from "../models/User";
import { FirebaseSourceObj, Members, MemberInfo, SourceObj } from '../models/Source';

function createNewFirebaseSource(source: SourceObj, members: any = {}): FirebaseSourceObj {
    return {
        id: source.id,
        name: source.name || source.id,
        secretKey: source.secretKey,
        created: source.created || new Date().toISOString(),
        members: members,
        monitoring_enabled: false,
        proxy_enabled: !!source.liveDebug,
        debug_enabled: !!source.liveDebug,
    }
}

export class FirebaseAuth {
    readonly auth: Firebase.auth.Auth;

    constructor(auth: Firebase.auth.Auth) {
        this.auth = auth;
    }

    getUser(user: UserObj): Promise<FirebaseAuthUser> {
        return this.auth.getUser(user.userId)
            .then(function(user: Firebase.auth.UserRecord) {
                return new FirebaseAuthUser(user);
            });
    }
}

export class FirebaseDatabase {

    readonly db: Firebase.database.Database;

    constructor(db: Firebase.database.Database) {
        this.db = db;
    }

    createSource(source: SourceObj): Promise<FirebaseSource> {
        const fbSource = createNewFirebaseSource(source, { bespoken_admin: "owner" });
        return this.getSource(source)
            .then(function (foundSource: FirebaseSource) {
                return false;
            }).catch(function () {
                return true;
            }).then((moveOn: boolean) => {
                if (moveOn) {
                    return this.db.ref()
                        .child("sources")
                        .child(source.id)
                        .set(fbSource);
                } else {
                    return Promise.reject(new Error("The source already exists."));
                }
            }).then((result: any): FirebaseSource => {
                return new FirebaseSource(this.db, fbSource);
            });
    }

    getUser(obj: UserObj | FirebaseAuthUser): Promise<FirebaseDBUser> {
        const { userId } = obj;
        return this.db.ref()
            .child("users")
            .child(userId)
            .once("value")
            .then((result: any): FirebaseDBUser | Promise<FirebaseDBUser> => {
                return new FirebaseDBUser(userId, this.db, result.val());
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

    getSources(firebaseAuth: FirebaseAuth): Promise<FirebaseSource[]> {
        let sources: FirebaseSource[] = [];
        return this.db.ref()
            .child("sources")
            .once("value")
            .then((result: any): Bluebird<FirebaseSource[]> => {
                if (!result || !result.val()) return Bluebird.resolve(sources);
                const rawSources = result.val();
                Object.keys(rawSources).forEach((key) => {
                    sources.push(new FirebaseSource(this.db, rawSources[key] as FirebaseSourceObj));
                });
                let usersToFind: {[key: string]: any} = {};
                let promises: any[] = [];
                for (const source of sources) {
                    const userIds = Object.keys(source.members);
                    for (const userId of userIds) {
                       if (!usersToFind.hasOwnProperty(userId))  {
                           usersToFind[userId] = userId;
                           promises.push(Bluebird.resolve(firebaseAuth.getUser({userId: userId})));
                       }
                    }
                }
                let users: FirebaseAuthUser[] = [];
                return Bluebird.all(promises.map((p) => p.reflect()))
                    .each((inspection: Bluebird.Inspection<any>) => {
                        if (inspection.isFulfilled())  {
                          users.push(inspection.value());
                        }
                    })
                    .then((): FirebaseSource[] => {
                        for (const source of sources) {
                            const userUids: string[] = [];
                            Object.keys(source.members).forEach((uid) => {
                                if (source.members[uid] === "owner") {
                                    userUids.push(uid);
                                }
                            });
                            for (const userUid of userUids) {
                                const firebaseUser = users.find((user) => user.userId === userUid);
                                if (firebaseUser) {
                                    source.membersInfo.push(new MemberInfo(firebaseUser.user.email));
                                }
                            }
                        }
                        return sources;
                    });
                });
    }
}

export class FirebaseAuthUser implements UserObj {
    readonly user: Firebase.auth.UserRecord

    constructor(user: Firebase.auth.UserRecord) {
        this.user = user;
    }

    get userId(): string {
        return this.user.uid;
    }
}

export class FirebaseDBUser implements FirebaseUserObj {
    readonly userId: string;
    readonly sources: {
        [userId: string]: string;
    }
    readonly db: Firebase.database.Database;
    readonly myRef: Firebase.database.Reference;

    constructor(id: string, db: Firebase.database.Database, firebaseResult: any) {
        this.db = db;
        this.userId = id;
        this.sources = (firebaseResult && firebaseResult.sources) ? firebaseResult.sources : {};
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
    addSource(source: FirebaseSourceObj): Promise<FirebaseDBUser> {
        if (source.members[this.userId]) {
            const sourcesCopy = Object.assign({}, this.sources);
            sourcesCopy[source.id] = source.members[this.userId];
            return this.myRef
                .child("sources")
                .set(sourcesCopy)
                .then((result: any) => {
                    return new FirebaseDBUser(this.userId, this.db, { sources: sourcesCopy });
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
    public membersInfo: MemberInfo[];

    constructor(db: Firebase.database.Database, firebaseResult: FirebaseSourceObj) {
        this.db = db;
        this.result = firebaseResult;
        this.myRef = db.ref().child("sources").child(this.result.id);
        this.membersInfo = [];
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

    get url(): string {
        return this.result.url;
    }

    get monitoring_enabled(): boolean {
        return this.result.monitoring_enabled;
    }

    get proxy_enabled(): boolean {
        return this.result.proxy_enabled;
    }

    get debug_enabled(): boolean {
        return this.result.debug_enabled;
    }

    /**
     * Sets the user as the owner of this source.
     * Upon success the promise will return a new Firebase object that has the new data setup.
     */
    setOwner(user: UserObj | FirebaseDBUser): Promise<FirebaseSource> {
        const membersCopy = Object.assign({}, this.members);
        membersCopy[user.userId] = "owner";

        return this.setMembers(membersCopy);
    }

    /**
     * A comprehensive function that will colletively change the member roles of a group of
     * members at once.
     *
     * @param roles The new roles for the users.  If the "role" is undefined, the user will be removed from the source.
     *
     * @return A Promise for a new FirebaseSource object with the updated information upon success.
     */
    changeMemberRoles(roles: Role[]): Promise<FirebaseSource> {
        const membersCopy = Object.assign({}, this.members);
        for (let r of roles) {
            if (r.role) {
                membersCopy[r.user.userId] = r.role;
            } else {
                delete membersCopy[r.user.userId];
            }
        }

        return this.setMembers(membersCopy);
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
        return {...this.result, ...{membersInfo: this.membersInfo}}
    }

    private setMembers(members: Members): Promise<FirebaseSource> {
        return this.myRef
            .child("members")
            .set(members)
            .then(() => {
                const firebaseResultCopy = Object.assign({}, this.result);
                firebaseResultCopy.members = members;
                return new FirebaseSource(this.db, firebaseResultCopy);
            });
    }
}

export interface Role {
    user: UserObj | FirebaseDBUser;
    role: "owner" | "member" | undefined;
}
