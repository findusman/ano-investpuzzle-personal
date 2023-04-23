require("dotenv").config("../.env");
import * as http from "http";
import * as JSONBigInt from "json-bigint";

import App from "./app";
import { initSocketConnect } from "./socket";

import { controllers } from "_app/controllers";

import { validateEnv } from "_app/utils";
import { LoggerConfiguration } from "_app/interfaces";
import { LoggerFactory } from "_app/factories";

console.log(`Environment = ${process.env.APP_ENV}`);

if (process.env.APP_ENV !== "testing") {
  // skip env vailidation on testing mode
  validateEnv();
}

JSON.parse = JSONBigInt.parse; // Override prototype method
JSON.stringify = JSONBigInt.stringify; // Override prototype method

const PORT = process.env.PORT || 5000;
const logConfig: LoggerConfiguration = {
  service: "wafflestock-api",
  logglyToken: process.env.LOGGLY_TOKEN,
  logglySubdomain: process.env.LOGGLY_SUBDOMAIN,
  tag: process.env.APP_ENV,
};
const loggerFactory = new LoggerFactory(logConfig);

const Controllers = controllers(loggerFactory);

const app = new App(loggerFactory, [...Controllers]);

export const server = http.createServer(app.app);
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

initSocketConnect(server);
