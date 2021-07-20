// Used to connect to and manipulate MySQL database
const mysql = require('mysql');
// Used for promisify to convert mysql callbacks into promises
const util = require('util');

// Class that controls connecting to and modifying the tables in the Employee CMS database.
class EmployeeCMSDB {
  constructor(host='localhost', port=3306, user='root', password='') {
    this.config = {
      host: host,
      port: port,
      user: user,
      password: password,
      database: 'employee_cms_db'
    }    
  }

  // Establish a connection to the Employee CMS database.
  // Returns a promise that resolves once the connection is successful
  connect() {
    this.connection = mysql.createConnection(config);
    const connectionPromise = util.promisify(this.connection.connect);
    return connectionPromise();
  }

}