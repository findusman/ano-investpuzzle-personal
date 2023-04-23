import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as mongoose from "mongoose";
import * as cors from "cors";
import "module-alias/register";
import * as Logger from "bunyan";

import { Env } from "_app/config";
import { Controller } from "_app/interfaces";
import { errorMiddleware, loggerMiddleware } from "_app/middlewares";
import { LoggerFactory } from "_app/factories";
import { CronService } from "./services";

class App {
  public app: express.Application;
  private logger: Logger;
  private loggerEnabled = process.env.ENABLE_FULL_LOG === "1";
  public cronService = new CronService();

  constructor(logger: LoggerFactory, controllers: Controller[]) {
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

  public listen() {
    this.app.listen(Env.PORT, () => {
      console.log(`App listening on the port ${Env.PORT}`);
    });
  }

  public getServer() {
    return this.app;
  }

  private initializeMiddlewares() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());

    if (this.loggerEnabled) {
      this.app.use(loggerMiddleware(this.logger));
    }
  }

  private initializeControllers(controllers: Controller[]) {
    controllers.forEach((controller) => {
      this.app.use("/", controller.router);
    });
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware(this.loggerEnabled ? this.logger : null));
  }

  private connectToTheDatabase() {
    mongoose.connect(Env.MONGO_PATH, (error) => {
      if (!error) {
        console.log("Database connected");
      }
    });
  }

  private runSchedule() { //crone part
    this.cronService.runJobs();
  }
}

export default App;
