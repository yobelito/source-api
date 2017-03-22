import * as Admin from "firebase-admin";
import * as BodyParser from "body-parser";
import * as Express from "express";

import * as Config from "./config";
import GenerateSourceNameApi from "./controllers/GenerateNameApi";
import * as Source from "./models/Source";

const app = Express();

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

// Fetch the service account key JSON file contents
const serviceAccount = {
    "private_key": process.env.private_key.replace(/\\n/g, '\n'),
    "client_email": process.env.client_email.replace(/\\n/g, '\n'),
}

if (!serviceAccount.private_key || !serviceAccount.client_email) {
    throw new Error("The \"private_key\" and \"client_email\" environment variables must be provided to log in to Firebase.");
}

// Initialize the app with a service account, granting admin privileges
Admin.initializeApp({
    credential: Admin.credential.cert(serviceAccount),
    databaseURL: Config.BESPOKEN_TOOLS_FIREBASE_URL
});

// As an admin, the app has access to read and write all data, regardless of Security Rules
var db = Admin.database();

app.post("/v1/sourceName", function (req, res) {
  const name = req.body.name;
  const generator: GenerateSourceNameApi = new GenerateSourceNameApi(db);

  Promise.resolve(name)
    .then(function(name: string) {
      if (name) {
        return Source.validateName(name).then(Source.morph);
      } else {
        return name;
      }
    })
    .then(generator.generateUniqueSourceName)
    .then(returnSource(res))
    .catch(returnError(res));
});

app.get("/", function (req, res) {
  res.statusCode = 200;
  res.send("Hello World!");
});

app.listen(9250, function () {
  console.log("Listening on port 9250!");
});

function returnSource(res: Express.Response): (source: Source.SourceObj) => void {
  return function (source: Source.SourceObj) {
    res.statusCode = 200;
    res.statusMessage = "Success";
    res.send(source);
  }
}

function returnError(res: Express.Response): (err: Error) => void {
  return function (err: Error) {
    console.error(err);
    res.statusCode = 400;
    res.statusMessage = err.message;
    res.send();
  }
}