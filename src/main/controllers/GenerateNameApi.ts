import * as Admin from "firebase-admin";
import * as UUID from "uuid";

import * as Config from "../config";
import generateName from "../controllers/GenerateName";
import Source from "../models/Source";
import * as StringUtils from "../utils/StringUtils";

// Fetch the service account key JSON file contents
var serviceAccount = require("../../../../creds/bespoken-tools-firebase-adminsdk-vwdeq-1b1098346f.json");

// Initialize the app with a service account, granting admin privileges
Admin.initializeApp({
  credential: Admin.credential.cert(serviceAccount),
  databaseURL: Config.BESPOKEN_TOOLS_FIREBASE_URL
});

// As an admin, the app has access to read and write all data, regardless of Security Rules
var db = Admin.database();

export default function generateUniqueSourceName(name: string): Promise<Source> {
    const newSource: Source = { name: name, secretKey: UUID.v4() };
    return generateName(name, namechecker(), nameGenerator())
        .then(function(name: string) {
            newSource.name = name;
            return newSource;
        });
}

function namechecker(): (name: string) => Promise<boolean> {
    const sourcesPath = db.ref().child("sources");
    return function(name: string): Promise<boolean> {
        // This attempts to read the key at the given source.  If it passes, then the key exists. Else it does not exist and can continue
        return sourcesPath.child(name).once("value")
            .then(function(result: any) {
                return result.exists();
            }).catch(function(error: Error) {
                console.error(error);
                return false;
            });
    }
}

function nameGenerator(): (name: string, remaining: number) => string {
    let extraCount = 0;
    return function(name: string, remaining: number): string {
        // console.info("Generating " + name + " " + remaining);
        if (remaining % 10 === 0) {
            ++extraCount;
        }
        return name + "-" + StringUtils.randomString(Config.APPEND_LENGTH + extraCount);
    }
}