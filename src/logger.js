
var bunyan = require('bunyan'),
    appName = require('./../package.json').name,
    logLevel = "info";

if (process.env.DEBUG === "true"){
    logLevel = "debug";
}

/**
 * Create the logger object
 */
var log = bunyan.createLogger({
    "name": appName,
    "streams": [
        {
            "stream": process.stdout,
            "level": logLevel
        }
    ]
});

module.exports.log = log;