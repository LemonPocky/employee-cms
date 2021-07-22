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

    // Override connection methods with promises
    this.connection.connect = util.promisify(this.connection.connect);
    this.connection.query = util.promisify(this.connection.query);

    return this.connection.connect();
  }

  async selectEmployeesFullDetails() {
    const query = `
      SELECT 
        e.id,
        CONCAT(e.first_name, " ", e.last_name) AS employee_name, 
        r.title,
        r.salary,
        d.name AS department,
        CONCAT(m.first_name, " ", m.last_name) AS manager_name
      FROM employee AS e
      LEFT JOIN role AS r
      ON e.role_id = r.id
      LEFT JOIN department AS d
      ON r.department_id = d.id
      LEFT JOIN employee AS m
      ON e.manager_id = m.id;`;
    return this.connection.query(query);
  }

  async selectRolesFullDetails() {
    const query = `
      SELECT 
        r.title,
        r.salary,
        d.name AS department
      FROM role AS r
      LEFT JOIN department AS d
      ON r.department_id = d.id;`;
    return this.connection.query(query);
  }

  async selectDepartments() {
    const query = `
      SELECT 
        name
      FROM department;`;
    return this.connection.query(query);
  }

  async selectDepartmentsWithId() {
    const query = `
      SELECT 
        id,
        name
      FROM department;`;
    return this.connection.query(query);
  }

  // Inserts the role object into the role table
  async insertRole(role) {
    const query = `INSERT INTO role SET ?`;
    return this.connection.query(query, role);
  }

  // Inserts the department object into department table
  async insertDepartment(department) {
    const query = `INSERT INTO department SET ?`;
    return this.connection.query(query, department);
  }
}

module.exports = EmployeeCMSDB;