import * as Logger from "bunyan";
import * as BunyanLoggly from "bunyan-loggly";
import { Env } from "_app/config";
import { EnvType } from "_app/enums";

import { LoggerConfiguration } from "_app/interfaces";
/**
 * LoggerFactory provides a generic logger instance which can be used to spawn child loggers for specific classes
 */
class LoggerFactory {
  public logger: Logger;

  constructor(configuration: LoggerConfiguration) {
    const { service, logglyToken, logglySubdomain, tag } = configuration;

    // const loggly = new BunyanLoggly({
    //   token: logglyToken,
    //   subdomain: logglySubdomain,
    //   tags: [tag],
    // });

    const options: Logger.LoggerOptions = {
      name: service,
      level: Logger.levelFromName.debug,
      serializers: Logger.stdSerializers,
      env: tag,
      streams:
        Env.ENABLE_FULL_LOG === "1"
          ? [
              {
                type: Env.APP_ENV === EnvType.prod ? "rotating-file" : undefined,
                path: "/var/log/bolt/bolt.log",
                period: "1d", // daily rotation
                count: 2,
              },
            ]
          : [],
    };

    this.logger = Logger.createLogger(options);
  }

  /**
   * Gets a child instance of a logger with specific name
   */
  public getNamedLogger(loggerName: string): Logger {
    return this.logger.child({ loggerName });
  }
}

export { LoggerFactory };
