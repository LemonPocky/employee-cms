// Used to connect to and manipulate MySQL database
const mysql = require('mysql');
// Used for promisify to convert mysql callbacks into promises
const util = require('util');

// Class that controls connecting to and modifying the tables in the Employee CMS database.
class EmployeeCMSDB {
  constructor(dbhost, dbport, dbuser, dbpassword, dbname) {
    this.config = {
      host: dbhost,
      port: dbport,
      user: dbuser,
      password: dbpassword,
      database: dbname,
    };
  }

  // Establish a connection to the Employee CMS database.
  // Returns a promise that resolves once the connection is successful
  async connect() {
    this.connection = mysql.createConnection(this.config);
    this.connection.connect = util.promisify(this.connection.connect);
    return this.connection.connect();
  }

}

module.exports = EmployeeCMSDB;