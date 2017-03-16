import * as Express from "express";

const app = Express();

app.get("/sourceName", function(req, res) {
    console.log("Generating name.");
});

app.get("/", function (req, res) {
  res.send("Hello World!");
});

app.listen(3000, function () {
  console.log("Example app listening on port 3000!");
});
