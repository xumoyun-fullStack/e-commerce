const express = require("express");
const fs = require("fs");
const path = require("path");
const morgan = require("morgan");
const CookieParser = require("cookie-parser");
const { PORT } = require("../config");

const app = express();

app.listen(PORT, () => console.log(`SERVER AT http://localhost:${PORT}`));

//middlewares

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));
app.use(CookieParser());
app.use("/public", express.static(path.join(__dirname, "public")));

//Routes

fs.readdir(path.join(__dirname, "routes"), (err, files)=>{
    files.forEach(file => {
        let routePath = path.join(__dirname, "routes", file);
        let Route = require(routePath);

        if(Route.path && Route.router) app.use(Route.path, Route.router);
    })

})