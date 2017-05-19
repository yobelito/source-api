import * as Admin from "firebase-admin";
import * as BodyParser from "body-parser";
import * as Express from "express";

import * as Config from "./config";
import * as Services from "./services/v1";
import * as Returns from "./services/v1/Returns";

const app = Express();

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

// CORS Headers
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Fetch the service account key JSON file contents
const serviceAccount = {
    "private_key": process.env.private_key.replace(/\\n/g, '\n'),
    "client_email": process.env.client_email.replace(/\\n/g, '\n'),
}

if (!serviceAccount.private_key || !serviceAccount.client_email) {
    throw new Error("The \"private_key\" and \"client_email\" environment variables must be provided to log in to Firebase.");
}

const firebaseURL = (process.env.env === "prod") ? Config.BESPOKEN_TOOLS_FIREBASE_PROD_URL : Config.BESPOKEN_TOOLS_FIREBASE_DEV_URL;

console.info(firebaseURL);

// Initialize the app with a service account, granting admin privileges
Admin.initializeApp({
    credential: Admin.credential.cert(serviceAccount),
    databaseURL: Config.BESPOKEN_TOOLS_FIREBASE_PROD_URL
});

// As an admin, the app has access to read and write all data, regardless of Security Rules
var db = Admin.database();
var auth = Admin.auth();

function Authenticator(next: ((req: Express.Request, res: Express.Response) => Promise<Express.Response>)) {
    return function(req: Express.Request, res: Express.Response): Promise<Express.Response> {
        const token = req.headers["x-access-token"];
        if (!token || token !== process.env.API_TOKEN) {
            return Promise.reject(new Error("No x-access-token header provided or invalid"))
                .catch((err: Error) => {
                    Returns.NotOkay(res, 401, err).send();
                    return res;
                });
        } else {
            return next(req, res);
        }
    }
}

app.get("/v1/sources", Authenticator(Services.getSources(db)));

app.get("/v1/sourceId", Services.getSourceId(db));

app.post("/v1/linkSource", Services.postLinkSourceToUser(auth, db));

app.post("/v1/createSource", Services.postNewSource(db));

app.get("/", function (req, res) {
  res.statusCode = 200;
  res.send("Hello World!");
});

app.listen(9250, function () {
  console.log("Listening on port 9250!");
});
