import * as Admin from "firebase-admin";
import * as BodyParser from "body-parser";
import * as Express from "express";
import * as https from "https";

import * as Config from "./config";
import * as Services from "./services/v1";

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
console.info("Service Account: " + serviceAccount.client_email);

// Initialize the app with a service account, granting admin privileges
Admin.initializeApp({
    credential: Admin.credential.cert(serviceAccount),
    databaseURL: firebaseURL
});

// As an admin, the app has access to read and write all data, regardless of Security Rules
var db = Admin.database();
var auth = Admin.auth();

app.get("/v1/sources", Services.getSources(db));

app.get("/v1/sourceId", Services.getSourceId(db));

app.post("/v1/linkSource", Services.postLinkSourceToUser(auth, db));

app.post("/v1/createSource", Services.postNewSource(db));

app.get("/", function (req, res) {
  res.statusCode = 200;
  res.send("Hello World!");
});

if (process.env.SSL_KEY) {
    const credentials = {
        key: process.env.SSL_KEY.replace(/\\n/g, "\n"),
        cert: process.env.SSL_CERT.replace(/\\n/g, "\n"),
    };
    const httpsServer = https.createServer(credentials, app);
    httpsServer.listen(443, () => {
        console.log("Listening on port :" + 443);
    });
} else {
    app.listen(9250, function () {
        console.log("Listening on port 9250!");
    });
}
