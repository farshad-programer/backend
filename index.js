import express from "express";
const app = express();
import debug from "debug";
debug("app:main");
import mongoose from "mongoose";
import config from "config";
import winston from "winston";
import configApp from "./startup/config.js";
import db from "./startup/db.js";
import logging from "./startup/logging.js";
import router from "./src/routes/index.js";

configApp(app, express);
db();
logging();

app.use("/api", router);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on port ${port}`));
