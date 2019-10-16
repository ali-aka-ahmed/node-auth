import { Logger, transports } from 'winston';

/**
 * LOGGING LEVELS
 *
 * 0: error
 * 1: warn
 * 2: info
 * 3: verbose
 * 4: debug
 * 5: silly
 *
 * USAGE
 *
 * import logger from '../util/logger'
 * ...
 * logger.silly("example")
 */

const options = {
    transports: [
        new transports.Console({
            level: process.env.NODE_ENV === "production" ? "error" : "silly",
            handleExceptions: true,
            json: false,
            colorize: true
        }),
        new transports.File({
          level: "info",
          filename: "info.log",
          handleExceptions: true,
          json: false,
          maxsize: 5242880, // 5MB
          maxFiles: 5,
          colorize: false
        })
    ],
    exitOnError: false // do not exit on handled exceptions
};

const logger = new Logger(options);

if (process.env.NODE_ENV !== "production") { logger.info("Console logging initialized at debug level"); }

export default logger;
