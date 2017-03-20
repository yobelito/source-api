import * as BodyParser from "body-parser";
import * as Express from "express";

import GenerateSourceNameApi from "./controllers/GenerateNameApi";
import * as Source from "./models/Source";

const app = Express();

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

app.post("/v1/sourceName", function (req, res) {
  console.log("Generating name.");
  const name = req.body.name;
  Promise.resolve(name)
    .then(function(name: string) {
      if (name) {
        return Source.validateName(name).then(Source.morph);
      } else {
        return name;
      }
    })
    .then(GenerateSourceNameApi)
    .then(returnSource(res))
    .catch(returnError(res));
});

app.get("/", function (req, res) {
  res.statusCode = 200;
  res.send("Hello World!");
});

app.listen(3000, function () {
  console.log("Example app listening on port 3000!");
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