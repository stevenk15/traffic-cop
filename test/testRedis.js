var should = require('should'),
    util = require('util'),
    rewire = require('rewire'),
    redisClient = require('../src/redis');

var rewiredRedis = rewire("../src/redis");

describe("redis.js", function(){
    describe("retry_strategy", function(){

        var retryStrategy = rewiredRedis.__get__("redisRetryStrategy");

        it("should return an Error when the connection is refused");
        it("should return an Error when the total time for retries has been exceeded");
        it("should return undefined when times_connected is greater than 2");
        it("should return a positive integer when no errors detected");
    });
});