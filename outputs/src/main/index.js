"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Express = require("express");
const GenerateNameApi_1 = require("./controllers/GenerateNameApi");
const app = Express();
app.get("/sourceName", function (req, res) {
    console.log("Generating name.");
    GenerateNameApi_1.default("super-duper-unique-name")
        .then(function (source) {
        console.log(source);
        res.statusCode = 200;
        res.statusMessage = "Success";
        res.send(source);
    }).catch(function (err) {
        console.error(err);
        res.statusCode = 400;
        res.statusMessage = "Unable to generate name.";
        res.send();
    });
});
app.get("/", function (req, res) {
    res.send("Hello World!");
});
app.listen(3000, function () {
    console.log("Example app listening on port 3000!");
});
//# sourceMappingURL=index.js.map