module.exports = {
  /**Declaration of databases for my development environment**/
  development: {
    databases: {
      Database1: {
        database: 'ciencia_docker2', //you should always save these values in environment variables
        username: 'ciencia_docker', //only for testing purposes you can also define the values here
        password: 'c1eNci4.2019.03',
        host: '172.26.13.51', //process.env.RDS_HOSTNAME1,
        port: '5432',
        dialect: 'postgres', //here you need to define the dialect of your databse, in my case it is Postgres
      },
    },
  },
};
