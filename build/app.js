"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cookieParser = require("cookie-parser");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("module-alias/register");
const config_1 = require("_app/config");
const middlewares_1 = require("_app/middlewares");
const services_1 = require("./services");
class App {
    constructor(logger, controllers) {
        this.loggerEnabled = process.env.ENABLE_FULL_LOG === "1";
        this.cronService = new services_1.CronService();
        this.app = express();
        this.logger = logger.getNamedLogger("app-root");
        this.app.use(cors());
        this.app.use(express.static("public"));
        this.app.use(express.static("uploads"));
        this.app.get("/", function (req, res) {
            res.sendFile("/index.html");
        });
        this.connectToTheDatabase();
        this.initializeMiddlewares();
        this.initializeControllers(controllers);
        this.initializeErrorHandling();
        // this.runSchedule();
    }
    listen() {
        this.app.listen(config_1.Env.PORT, () => {
            console.log(`App listening on the port ${config_1.Env.PORT}`);
        });
    }
    getServer() {
        return this.app;
    }
    initializeMiddlewares() {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cookieParser());
        if (this.loggerEnabled) {
            this.app.use((0, middlewares_1.loggerMiddleware)(this.logger));
        }
    }
    initializeControllers(controllers) {
        controllers.forEach((controller) => {
            this.app.use("/", controller.router);
        });
    }
    initializeErrorHandling() {
        this.app.use((0, middlewares_1.errorMiddleware)(this.loggerEnabled ? this.logger : null));
    }
    connectToTheDatabase() {
        mongoose.connect(config_1.Env.MONGO_PATH, (error) => {
            if (!error) {
                console.log("Database connected");
            }
        });
    }
    runSchedule() {
        this.cronService.runJobs();
    }
}
exports.default = App;
//# sourceMappingURL=app.js.map