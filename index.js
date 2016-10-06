/*
 * Traffic Cop app
 *
 * This application's purpose is to search in a user database for a
 * given userId and return a toggle to an up stream consumer.  The
 * toggle is intended to indicate which stack to send this request to,
 * the 'legacy' stack or the new 'microservices' stack.  It will be
 * used by all incoming requests and should be optimized accordingly.
 */

// check for required environment variables and fail if they are missing
validateRequiredEnvVars();

// import all libraries, declare class scope variables
var restify = require('restify'),
    log = require('./src/logger').log,
    handleGetRequest = require('./src/controller').handleGetRequest,
    handlePostRequest = require('./src/controller').handlePostRequest,
    handleHealthCheck = require('./src/controller').handleHealthCheck,
    start,
    appName = require('./package.json').name;

// Define and create the Restify server
var server = restify.createServer({
	"name": appName,
	"log": log
});

/*
 * This function will be called on all requests and will add any 
 * query string parameters to the request object.
 */
server.use(restify.queryParser());

/*
 * This function will be called on all requests and will add any
 * any JSON that is included in the HTTP body to the request object.
 */
server.use(restify.bodyParser({"mapParams": true}));

/*
 * This function will be called on all requests and will capture
 * the start time of this request to be used in a timer later.
 */
server.use(function(req, res, next){
	start = (new Date()).getTime();
	next();
});

/*
 * This listens for the "after" event to be fired by the Restify
 * server.  It determines the request time and writes it to the log.
 */
server.on("after", function(req, res, next){
	var end = (new Date()).getTime() - start;
    log.info("time=" + end);
});

/*
 * This defines a GET route and applies the callback function to 
 * any matching requests.  For this use case the userId parameter
 * is found in a query string called 'userId'.
 */
server.get('/svc/v1/traffic-cop', handleGetRequest);

/*
 * This defines a POST route and applies the callback function to
 * any matching requests.  For this use case the userId parameter
 * is found in a JSON object in the HTTP body.
 */
server.post("/svc/v1/traffic-cop", handlePostRequest);

/*
 * This health check route will verify the health of the two dependencies,
 * Redis and Cassandra.  If those dependencies are healthy it will return
 * a 200.  If not then it will return a 500.
 */
server.get("/healthcheck", handleHealthCheck);

// Start the server on the given port.
server.listen(process.env.SERVER_PORT, function startServerCb(){
    // names the process for use in a 'ps' command
    process.title = appName;
	log.info("Traffic Cop started");
});

/**
 * This function will check for each of the required environment
 * variables and stop the process if any of them are missing.
 */
function validateRequiredEnvVars (){
	var environmentReady = true;
	if (!process.env.REDIS_HOST){
		console.error("Redis host is missing!");
		environmentReady = false;
	}
	if (!process.env.REDIS_PORT){
        console.error("Redis port is missing!");
		environmentReady = false;
	}
	if (!process.env.SERVER_PORT){
        console.error("Server port is missing!");
		environmentReady = false;
	}
	if (!process.env.CASSANDRA_HOST){
        console.error("Cassandra host is missing!");
        environmentReady = false;
    }

	/*
	 * After checking all environment variables stop the process if
	 * any of the required are missing.
	 */
	if (environmentReady === false){
        console.error("Process can not be started due to missing environment variables");
		process.exit();
	}
}
