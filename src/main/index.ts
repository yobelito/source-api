import * as Express from "express";
import GenerateSourceNameApi from "./controllers/GenerateNameApi";
import Source from "./models/Source";

const app = Express();

app.get("/sourceName", function(req, res) {
    console.log("Generating name.");
    GenerateSourceNameApi("super-duper-unique-name")
    .then(function(source: Source) {
      console.log(source);
      res.statusCode = 200;
      res.statusMessage = "Success";
      res.send(source);
    }).catch(function(err: Error) {
      console.error(err);
      res.statusCode = 400;
      res.statusMessage = "Unable to generate name."
      res.send();
    });
});

app.get("/", function (req, res) {
  res.send("Hello World!");
});

app.listen(3000, function () {
  console.log("Example app listening on port 3000!");
});
