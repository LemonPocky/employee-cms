// Grabs our sensitive database information from .env
// If you don't have a .env file yet, make a copy of .env.EXAMPLE, rename
// it to .env, and fill out the fields (do not use quotes).
require('dotenv').config();

// Used for an interactive command prompt
const inquirer = require('inquirer');

// Used to nicely format tables
const consoleTable = require('console.table');

// Contains employee database methods
const EmployeeCMSDB = require('./db/EmployeeCMSDB');

// Create a new database object with connection parameters
const db = new EmployeeCMSDB(
  'localhost',
  3306,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  process.env.DB_NAME,
);

// Entry method into our program
async function run() {
  // Try to connect to the database. Exits the program if there's an error.
  try {
    await db.connect();
    console.log("Connected to database.");
  } catch (error) {
    console.log(error);
    return;
  }

  // On successful database connect
  console.log('Welcome to the EMPLOYEE MANAGER! Ver. 0.01a');
  mainMenu();
}

// Displays the main menu of the program
// We return here after every user cycle
async function mainMenu() {
  const answer = await inquirer.prompt([
    {
      message: 'MAIN MENU: What would you like to do?',
      name: 'menuChoice',
      type: 'list',
      choices: [
        "View All Employees",
        "View All Roles",
        "View All Departments",
        "Add a Role",
        "Add a Department",
        "Exit"
      ]
    }
  ]);

  // Pick next action based on the user's choice
  switch(answer.menuChoice) {
    case "View All Employees":
      viewAllEmployees();
      break;
    case "View All Roles":
      viewAllRoles();
      break;
    case "View All Departments":
      viewAllDepartments();
      break;
    case "Add a Role":
      addRole();
      break;
    case "Add a Department":
      addDepartment();
      break;
    default:
      exit();
  }
}

// Displays all employees and their information
async function viewAllEmployees() {
  try {
    const result = await db.selectEmployeesFullDetails();
    console.table(result);
  } catch (error) {
    console.log(error);
  }
  mainMenu();
}

// Displays all roles and their department
async function viewAllRoles() {
  try {
    const result = await db.selectRolesFullDetails();
    console.table(result);
  } catch (error) {
    console.log(error);
  }
  mainMenu();
}

// Display all departments
async function viewAllDepartments() {
  try {
    const result = await db.selectDepartments();
    console.table(result);
  } catch (error) {
    console.log(error);
  }
  mainMenu();
}

// Add a role
async function addRole() {
  const answer = await inquirer.prompt([
    {
      message: "What is the name of the role you would like to add?",
      name: "roleName",
      type: "input",
    },
    {
      message: "What is the salary of the role?",
      name: "roleSalary",
      type: "input",
    },
    {
      message: "What is the department of the role?",
      name: "roleDepartment",
      type: "list",
      choices: listDepartments,
    },
  ]);
  try {
    const salary = answer.roleSalary;
    if (isNaN(salary) && salary <= 0) {
      throw new Error("Salary must be a valid positive number.");
    }

    const role = {title: answer.roleName, salary: answer.roleSalary, department_id: answer.roleDepartment};
    const result = await db.insertRole(role);
    // If the insert was successful, affectedRows = 1
    if (result.affectedRows) {
      console.log(`Role ${answer.roleName} added.`);
    } else {
      console.log(`Error adding role.`);
    }
  } catch (error) {
    console.log(`Error adding role: ${error.message}`);
  }
  mainMenu();
}

// Add new department
async function addDepartment() {
  const answer = await inquirer.prompt([
    {
      message: "What is the name of the department you would like to add?",
      name: "departmentName",
      type: "input",
    },
  ]);
  try {
    // Wrap department name in an object
    const department = {name: answer.departmentName};
    // Call database to add department object
    const result = await db.insertDepartment(department);
    // If the insert was successful, affectedRows = 1
    if (result.affectedRows) {
      console.log(`Department ${answer.departmentName} added.`);
    } else {
      console.log(`Error adding department.`);
    }
  } catch (error) {
    console.log(`Error adding department: ${error.message}`);
  }
  mainMenu();
}

// Helper function that returns an array of objects for departments
// {name: , id:}
async function listDepartments() {
  const results = await db.selectDepartmentsWithId();
  return results.map((item) => {
    // This mapping makes it so that the names of the departments are shown in the CLI,
    // but the answers hash actually gets the id of the department as a value!
    return {name: item.name, value: item.id};
  })
}

// Exits the program
function exit() {
  console.log('Goodbye!');
  process.exit(0);
}

// Run the program
run();