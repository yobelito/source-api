import * as UUID from "uuid";

import * as Config from "../config";
import generateName from "../controllers/GenerateName";
import * as Source from "../models/Source";
import randomName from "../utils/RandomName";
import * as StringUtils from "../utils/StringUtils";

export default class Generator {
    readonly db: admin.database.Database;

    constructor(db: admin.database.Database) {
        this.db = db;
        this.generateUniqueSourceName = this.generateUniqueSourceName.bind(this);
    }

    generateUniqueSourceName(name?: string): Promise<Source.SourceObj> {
        const newName: string = name || randomName();
        const newSource: Source.SourceObj = { name: name, secretKey: UUID.v4() };
        return generateName(newName, namechecker(this.db), nameGenerator(this.db))
            .then(function (name: string) {
                newSource.name = name;
                return newSource;
            });
    }
}

function namechecker(db: admin.database.Database): (name: string) => Promise<boolean> {
    const sourcesPath = db.ref().child("sources");
    return function (name: string): Promise<boolean> {
        // This attempts to read the key at the given source.  If it passes, then the key exists. Else it does not exist and can continue
        return sourcesPath.child(name).once("value")
            .then(function (result: any) {
                return result.exists();
            }).catch(function (error: Error) {
                console.error(error);
                return false;
            });
    }
}

function nameGenerator(db: admin.database.Database): (name: string, remaining: number) => string {
    let extraCount = 0;
    return function (name: string, remaining: number): string {
        if (remaining % 10 === 0) {
            ++extraCount;
        }
        return name + "-" + StringUtils.randomString(Config.APPEND_LENGTH + extraCount);
    }
}