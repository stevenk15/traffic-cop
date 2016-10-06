var cassandra = require('cassandra-driver');

/**
 * create the cassandra connection object
 */
var cassandraClient = new cassandra.Client({
    "contactPoints": [
        process.env.CASSANDRA_HOST
    ],
    "keyspace": "ks1"
});

module.exports.cassandraClient = cassandraClient;