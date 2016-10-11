var log = require('./logger').log,
    appName = require('../package.json').name,
    appVersion = require('../package.json').version,
    getCassandraClient = require('./cassandra').getCassandraClient,
    getRedisClient = require('./redis').getRedisClient,
    util = require('util'),
    restify = require('restify');

/**
 * This function will handle the GET requests for a userId lookup. It
 * first validates that the request contains the required parameters.
 * Then is will look into Redis for the given userId.  If found it will
 * return that.  If not found it will check into the Cassandra database.
 * If it finds the information in Cassandra it will then update Redis.
 *
 * @param request
 *      The request object
 * @param response
 *      The response object
 * @param next
 *      The callback to invoke when finished
 * @returns {*}
 */
function handleGetRequest(request, response, next){

    // Validate the GET parameters, return 400 if missing
    var msg;
    if (!request.params){
        msg = "Missing request.params!";
        log.error(msg);
        response.json(new restify.errors.BadRequestError(msg));
        next();
    } else if (!request.params.userId){
        msg = "Missing request.params.userId!";
        log.error(msg);
        response.json(new restify.errors.BadRequestError(msg));
        next();
    } else {

        var userId = request.params.userId;
        log.debug("userId: " + userId);

        var redisClient = getRedisClient();
        var cassandraClient = getCassandraClient();

        retrieveUserInfo(redisClient, cassandraClient, userId, function retrieveUserInfoCb(error, data) {
            if (!error) {
                response.json(200, data);
            } else {
                response.json(error);
            }
        });

        next();
    }
}

/**
 * In this example the logic for handling a POST is the same as handling a
 * GET.  In reality they will probably be different as the POST body will
 * likely contain a different object.
 *
 * @param request
 *      The request object
 * @param response
 *      The response object
 * @param next
 *      The callback to invoke when finished
 * @returns {*}
 */
function handlePostRequest(request, response, next){
    handleGetRequest(request, response, next);
}

function handleHealthCheck(request, response, next){

    var redisClient = getRedisClient();
    var cassandraClient = getCassandraClient();
    var statusCode = 200;
    var responseData = {
        "name": appName,
        "version": appVersion
    };

    // check Redis
    if (redisClient.connected){
        responseData.redis = "Connected";
    } else {
        statusCode = 500;
        responseData.redis = "Not Connected";
    }

    // check Cassandra
    cassandraClient.connect(function(error){
        if (!error){
            responseData.cassandra = "Connected";
        } else {
            statusCode = 500;
            responseData.cassandra = "Not Connected";
        }
        responseData.statusCode = statusCode;
        response.json(statusCode, responseData);
    });

    next();

}

/**
 * Once the userId has been parsed out of the respective request method this
 * function contains all the necessary logic to perform the actual look up
 * in Redis/Cassandra.
 *
 * @private
 * @param userId
 *      The parsed userId value from the request
 * @param callback
 *      The callback to invoke when finished
 */
function retrieveUserInfo(redisClient, cassandraClient, userId, callback){
    redisClient.get(userId, function(error, reply){
        if (!error){
            if (reply){
                // the key was found, return the value
                callback(null, reply);
            } else {
                // the key was not found in redis, go to Cassandra
                log.debug("Redis key was not found, go to the database");

                var query = "SELECT platform FROM users WHERE userId = ?";
                var params = [userId];
                cassandraClient.execute(query, params, {"prepare": true}, function(cError, cResult){
                    if (!cError){
                        if (cResult.rows && cResult.rows.length > 0){
                            log.info(cResult.rows[0]);
                            var cVal = cResult.rows[0].platform;
                            callback(null, cVal);

                            // put the userId into Redis
                            redisClient.set(userId, cVal);
                        } else {
                            callback(new restify.errors.NotFoundError("User not found in DB"), null);
                        }
                    } else {
                        // Cassandra error, return the error
                        callback(new restify.errors.InternalServerError("Cassandra error: " + cError), null);
                    }
                });
            }
        } else {
            // Redis error, return the error
            callback(new restify.errors.InternalServerError("Redis error: " + error), null);
        }
    });
}

module.exports.handleGetRequest = handleGetRequest;
module.exports.handlePostRequest = handlePostRequest;
module.exports.handleHealthCheck = handleHealthCheck;