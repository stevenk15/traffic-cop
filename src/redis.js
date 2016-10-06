
var redis = require('redis'),
    log = require('./logger').log;

/**
 * Creates the Redis client for export
 */
var redisClient = redis.createClient({
    "host": process.env.REDIS_HOST,
    "port": parseInt(process.env.REDIS_PORT),
    /*
     * The retry_strategy function defines how to handle certain error
     * situations in Redis.
     */
    "retry_strategy": function (options) {
        if (options.error.code === 'ECONNREFUSED') {
            // End reconnecting on a specific error and flush all commands with a individual error
            return new Error('The Redis server refused the connection');
        }
        if (options.total_retry_time > 1000 * 60) {
            // End reconnecting after a specific timeout and flush all commands with a individual error
            return new Error('Retry time exhausted');
        }
        if (options.times_connected > 2) {
            // End reconnecting with built in error
            return undefined;
        }
        // reconnect after
        return Math.max(options.attempt * 100, 3000);
    }
});

redisClient.on("error", function redisOnErrorCb(err) {
    log("Error: " + err);
});

module.exports.redisClient = redisClient;