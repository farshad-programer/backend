import express from "express";
const app = express();
import debug from "debug";
debug("app:main");
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import config from "config";
import winston from "winston";
import credentials from "./src/middlewares/credential.js";
import configApp from "./startup/config.js";
import db from "./startup/db.js";
import logging from "./startup/logging.js";
import router from "./src/routes/index.js";
import cors from "cors";

logging();
configApp(app, express, cookieParser, cors, credentials);
db();
app.use("/api", router);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`listening on port ${port}`));
