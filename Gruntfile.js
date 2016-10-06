module.exports = function(grunt) {

    grunt.initConfig({
        "jshint": {
            "files": ['Gruntfile.js', 'src/**/*.js', 'index.js'],
            "options": {}
        },
        "env": {
            "dev": {
                "CASSANDRA_HOST": "localhost",
                "REDIS_HOST": "localhost",
                "REDIS_PORT": "6379",
                "SERVER_PORT": "5000",
                "DEBUG": "true"
            }
        },
        "mochaTest": {
            "test": {
                "options": {
                    "reporter": 'spec',
                    "captureFile": 'results.txt', // Optionally capture the reporter output to a file
                    "quiet": false, // Optionally suppress output to standard out (defaults to false)
                    "clearRequireCache": false, // Optionally clear the require cache before running tests (defaults to false)
                    "noFail": false // Optionally set to not fail on failed tests (will still fail on other errors)
                },
                "src": ['test/**/*.js']
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-mocha-test');

    grunt.registerTask('default', ['jshint', 'env:dev', 'mochaTest']);
};