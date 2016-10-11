var should = require('should'),
    sinon = require('sinon'),
    rewire = require('rewire'),
    util = require('util'),
    getRedisClient = require('../src/redis').getRedisClient,
    getCassandraClient = require('../src/cassandra').getCassandraClient,
    handleGetRequest = require('../src/controller').handleGetRequest,
    handlePostRequest = require('../src/controller').handlePostRequest,
    handleHealthCheck = require('../src/controller').handleHealthCheck;

/*
 * Rewire retrieveUserInfo, which is private, and replace it with a mock
 * so that we can control its behavior in the tests.
 */
var rewiredController = rewire("../src/controller");

describe("Controller.js", function(){

    describe("public function handleGetRequest", function(){
        it("should call response.json with a 400 when request.params is undefined", function(done){
            var response = {
                "json": sinon.spy()
            };
            var request = {};
            handleGetRequest(request, response, function(){
                response.json.calledOnce.should.equal(true);
                response.json.args[0][0].should.be.an.Error();
                response.json.args[0][0].should.have.property("message", "Missing request.params!");
                response.json.args[0][0].should.have.property("statusCode", 400);
                done();
            });
        });
        it("should call response.json with a 400 when request.params is null", function(done){
            var response = {
                "json": sinon.spy()
            };
            var request = {
                "params": null
            };
            handleGetRequest(request, response, function(){
                response.json.calledOnce.should.equal(true);
                response.json.args[0][0].should.be.an.Error();
                response.json.args[0][0].should.have.property("message", "Missing request.params!");
                response.json.args[0][0].should.have.property("statusCode", 400);
                done();
            });
        });
        it("should call response.json with a 400 when request.params.userId is undefined", function(done){
            var response = {
                "json": sinon.spy()
            };
            var request = {
                "params": {}
            };
            handleGetRequest(request, response, function(){
                response.json.calledOnce.should.equal(true);
                response.json.args[0][0].should.be.an.Error();
                response.json.args[0][0].should.have.property("message", "Missing request.params.userId!");
                response.json.args[0][0].should.have.property("statusCode", 400);
                done();
            });
        });
        it("should call response.json with a 400 when request.params.userId is null", function(done){
            var response = {
                "json": sinon.spy()
            };
            var request = {
                "params": {
                    "userId": null
                }
            };
            handleGetRequest(request, response, function(){
                response.json.calledOnce.should.equal(true);
                response.json.args[0][0].should.be.an.Error();
                response.json.args[0][0].should.have.property("message", "Missing request.params.userId!");
                response.json.args[0][0].should.have.property("statusCode", 400);
                done();
            });
        });
        it("should respond appropriately when there is a Redis/Cassandra failure", function(done){
            var response = {
                "json": sinon.spy()
            };
            var request = {
                "params": {
                    "userId": 7777777
                }
            };
            var fakeError = new Error("this is a fake error");
            var retrieveUserInfoStub = sinon.stub().yields(fakeError, null);
            var revert = rewiredController.__set__("retrieveUserInfo", retrieveUserInfoStub);
            rewiredController.handleGetRequest(request, response, function(){
                response.json.calledOnce.should.equal(true);
                response.json.args[0][0].should.be.an.Error();
                response.json.args[0][0].should.have.property("message", "this is a fake error");
                revert();
                done();
            });
        });
        it("should respond appropriately when there is a Redis/Cassandra success", function(done){
            var response = {
                "json": sinon.spy()
            };
            var request = {
                "params": {
                    "userId": 7777777
                }
            };
            var retrieveUserInfoStub = sinon.stub().yields(null, "fake data");
            var revert = rewiredController.__set__("retrieveUserInfo", retrieveUserInfoStub);
            rewiredController.handleGetRequest(request, response, function(){
                response.json.calledOnce.should.equal(true);
                response.json.args[0][0].should.be.a.Number();
                response.json.args[0][0].should.equal(200);
                response.json.args[0][1].should.be.a.String();
                response.json.args[0][1].should.equal("fake data");
                revert();
                done();
            });
        });
    });

    describe("public function handlePostRequest", function(){
        it("should call response.json with a 400 when request.params is undefined", function(done){
            var response = {
                "json": sinon.spy()
            };
            var request = {};
            handlePostRequest(request, response, function(){
                response.json.calledOnce.should.equal(true);
                response.json.args[0][0].should.be.an.Error();
                response.json.args[0][0].should.have.property("message", "Missing request.params!");
                response.json.args[0][0].should.have.property("statusCode", 400);
                done();
            });
        });
        it("should call response.json with a 400 when request.params is null", function(done){
            var response = {
                "json": sinon.spy()
            };
            var request = {
                "params": null
            };
            handlePostRequest(request, response, function(){
                response.json.calledOnce.should.equal(true);
                response.json.args[0][0].should.be.an.Error();
                response.json.args[0][0].should.have.property("message", "Missing request.params!");
                response.json.args[0][0].should.have.property("statusCode", 400);
                done();
            });
        });
        it("should call response.json with a 400 when request.params.userId is undefined", function(done){
            var response = {
                "json": sinon.spy()
            };
            var request = {
                "params": {}
            };
            handlePostRequest(request, response, function(){
                response.json.calledOnce.should.equal(true);
                response.json.args[0][0].should.be.an.Error();
                response.json.args[0][0].should.have.property("message", "Missing request.params.userId!");
                response.json.args[0][0].should.have.property("statusCode", 400);
                done();
            });
        });
        it("should call response.json with a 400 when request.params.userId is null", function(done){
            var response = {
                "json": sinon.spy()
            };
            var request = {
                "params": {
                    "userId": null
                }
            };
            handlePostRequest(request, response, function(){
                response.json.calledOnce.should.equal(true);
                response.json.args[0][0].should.be.an.Error();
                response.json.args[0][0].should.have.property("message", "Missing request.params.userId!");
                response.json.args[0][0].should.have.property("statusCode", 400);
                done();
            });
        });
        it("should respond appropriately when there is a Redis/Cassandra failure", function(done){
            var response = {
                "json": sinon.spy()
            };
            var request = {
                "params": {
                    "userId": 7777777
                }
            };
            var fakeError = new Error("this is a fake error");
            var retrieveUserInfoStub = sinon.stub().yields(fakeError, null);
            var revert = rewiredController.__set__("retrieveUserInfo", retrieveUserInfoStub);
            rewiredController.handlePostRequest(request, response, function(){
                response.json.calledOnce.should.equal(true);
                response.json.args[0][0].should.be.an.Error();
                response.json.args[0][0].should.have.property("message", "this is a fake error");
                revert();
                done();
            });
        });
        it("should respond appropriately when there is a Redis/Cassandra success", function(done){
            var response = {
                "json": sinon.spy()
            };
            var request = {
                "params": {
                    "userId": 7777777
                }
            };
            var retrieveUserInfoStub = sinon.stub().yields(null, "fake data");
            var revert = rewiredController.__set__("retrieveUserInfo", retrieveUserInfoStub);
            rewiredController.handlePostRequest(request, response, function(){
                response.json.calledOnce.should.equal(true);
                response.json.args[0][0].should.be.a.Number();
                response.json.args[0][0].should.equal(200);
                response.json.args[0][1].should.be.a.String();
                response.json.args[0][1].should.equal("fake data");
                revert();
                done();
            });
        });
    });

    describe("private function retrieveUserInfo", function(){
        it("should respond appropriately when Redis returns an error", function(done){
            var redisClient = {
                "get": sinon.stub().yields(new Error("fake Redis error!"), null)
            };
            var cassandraClient = getCassandraClient();
            var retrieve = rewiredController.__get__("retrieveUserInfo");
            retrieve(redisClient, cassandraClient, 7, function(error, data){
                should.exist(error);
                should.not.exist(data);
                error.should.be.an.Error();
                error.message.should.equal("Redis error: Error: fake Redis error!");
                done();
            });
        });
        it("should respond appropriately when Redis returns a success", function(done){
            var redisClient = {
                "get": sinon.stub().yields(null, "fake Redis data!")
            };
            var cassandraClient = getCassandraClient();
            var retrieve = rewiredController.__get__("retrieveUserInfo");
            retrieve(redisClient, cassandraClient, 7, function(error, data){
                should.not.exist(error);
                should.exist(data);
                data.should.equal("fake Redis data!");
                done();
            });
        });
        it("should respond appropriately when Cassandra returns an error", function(done){
            var redisClient = {
                "get": sinon.stub().yields(null, null)
            };
            var cassandraClient = {
                "execute": sinon.stub().yields(new Error("fake Cassandra error!"), null)
            };
            var retrieve = rewiredController.__get__("retrieveUserInfo");
            retrieve(redisClient, cassandraClient, 7, function(error, data){
                should.exist(error);
                should.not.exist(data);
                error.should.be.an.Error();
                error.message.should.equal("Cassandra error: Error: fake Cassandra error!");
                done();
            });
        });
        it("should respond appropriately when Cassandra returns no rows", function(done){
            var redisClient = {
                "get": sinon.stub().yields(null, null)
            };
            var cassandraClient = {
                "execute": sinon.stub().yields(null, {"rows": []})
            };
            var retrieve = rewiredController.__get__("retrieveUserInfo");
            retrieve(redisClient, cassandraClient, 7, function(error, data){
                should.exist(error);
                should.not.exist(data);
                error.message.should.equal("User not found in DB");
                done();
            });
        });
        it("should respond appropriately when Cassandra returns a success", function(done){
            var redisClient = {
                "get": sinon.stub().yields(null, null),
                "set": function(key, value){return true;}
            };
            var cassandraClient = {
                "execute": sinon.stub().yields(null, {"rows": [{"platform": "Fake Cassandra data"}]})
            };
            var retrieve = rewiredController.__get__("retrieveUserInfo");
            retrieve(redisClient, cassandraClient, 7, function(error, data){
                should.not.exist(error);
                should.exist(data);
                data.should.equal("Fake Cassandra data");
                done();
            });
        });
    });

    describe("public function handleHealthCheck", function(){
        it("should respond appropriately when redis is down");
        it("should respond appropriately when redis is up");
        it("should respond appropriately when cassandra is down");
        it("should respond appropriately when cassandra is up");
    });

});