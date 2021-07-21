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
    default:
      exit();
  }
}

// Displays all employees and their information
async function viewAllEmployees() {
  const result = await db.selectAllEmployeesFullDetails();
  console.table(result);
  mainMenu();
}

// Displays all roles and their department
async function viewAllRoles() {
  const result = await db.selectRolesFullDetails();
  console.table(result);
  mainMenu();
}

// Exits the program
function exit() {
  console.log('Goodbye!');
  process.exit(0);
}

// Run the program
run();