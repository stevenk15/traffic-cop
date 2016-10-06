var log = require('./logger').log,
    cassandraClient = require('./cassandra').cassandraClient,
    redisClient = require('./redis').redisClient,
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
    }
    if (!request.params.userId){
        msg = "Missing request.params.userId!";
        log.error(msg);
        response.json(new restify.errors.BadRequestError(msg));
        next();
    }

    var userId = request.params.userId;
    log.debug("userId: " + userId);

    retrieveUserInfo(userId, function retrieveUserInfoCb(error, data){
        if (!error){
            response.json(200, data);
        } else {
            response.json(error);
        }
    });

    next();
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

function handleHealthCheck(request, response, next){}

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
function retrieveUserInfo(userId, callback){
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
                        var cVal = cResult.rows[0].platform;
                        callback(null, cVal);

                        // put the userId into Redis
                        redisClient.set();
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