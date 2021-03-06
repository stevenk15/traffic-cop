var cassandra = require('cassandra-driver'), util = require('util');

/**
 * create the cassandra connection object
 */
var cassandraClient = new cassandra.Client({
    "contactPoints": [
        process.env.CASSANDRA_HOST
    ],
    "keyspace": "ks1"
});

function getCassandraClient (){
    return cassandraClient;
}

module.exports.getCassandraClient = getCassandraClient;