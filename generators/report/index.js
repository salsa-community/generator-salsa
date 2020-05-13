var Client = require('node-rest-client').Client;
var Generator = require('yeoman-generator');
const Sequelize = require('sequelize');

module.exports = class extends Generator {
    info() {
        var config = {
            "databases": {
                "Database1": {
                    "database": 'ciencia_docker2', //you should always save these values in environment variables
                    "username": 'ciencia_docker',  //only for testing purposes you can also define the values here
                    "password":  'c1eNci4.2019.03',
                    "host": '172.26.13.51', //process.env.RDS_HOSTNAME1,
                    "port": '5432',
                    "dialect": "postgres"  //here you need to define the dialect of your databse, in my case it is Postgres
                },
            },
        };
        //Create an empty object which can store our databases
        const db = {};

        //Extract the database information into an array
        const databases = Object.keys(config.databases);

        //Loop over the array and create a new Sequelize instance for every database from config.js
        for (let i = 0; i < databases.length; ++i) {
            let database = databases[i];
            let dbPath = config.databases[database];
            //Store the database connection in our db object
            db[database] = new Sequelize(dbPath.database, dbPath.username, dbPath.password, dbPath);
        }
    }
};
