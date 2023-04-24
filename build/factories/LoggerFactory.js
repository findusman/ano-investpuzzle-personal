"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerFactory = void 0;
const Logger = require("bunyan");
const config_1 = require("_app/config");
const enums_1 = require("_app/enums");
/**
 * LoggerFactory provides a generic logger instance which can be used to spawn child loggers for specific classes
 */
class LoggerFactory {
    constructor(configuration) {
        const { service, logglyToken, logglySubdomain, tag } = configuration;
        // const loggly = new BunyanLoggly({
        //   token: logglyToken,
        //   subdomain: logglySubdomain,
        //   tags: [tag],
        // });
        const options = {
            name: service,
            level: Logger.levelFromName.debug,
            serializers: Logger.stdSerializers,
            env: tag,
            streams: config_1.Env.ENABLE_FULL_LOG === "1"
                ? [
                    {
                        type: config_1.Env.APP_ENV === enums_1.EnvType.prod ? "rotating-file" : undefined,
                        path: "/var/log/bolt/bolt.log",
                        period: "1d",
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
    getNamedLogger(loggerName) {
        return this.logger.child({ loggerName });
    }
}
exports.LoggerFactory = LoggerFactory;
//# sourceMappingURL=LoggerFactory.js.map