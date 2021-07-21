require('dotenv').config();
const inquirer = require('inquirer');

const EmployeeCMSDB = require('./db/EmployeeCMSDB');

const db = new EmployeeCMSDB(
  'localhost',
  3306,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  process.env.DB_NAME,
);

async function run() {
  try {
    await db.connect();
    console.log("Connected to database.");
  } catch (error) {
    console.log(error);
    return;
  }

  console.log('Welcome to the EMPLOYEE MANAGER! Ver. 0.01a');
  mainMenu();
}

async function mainMenu() {
  const answer = await inquirer.prompt([
    {
      message: 'MAIN MENU: What would you like to do?',
      name: 'menuChoice',
      type: 'list',
      choices: [
        "View All Employees",
        "Exit"
      ]
    }
  ]);

  switch(answer.menuChoice) {
    case 'View All Employees':
      viewAllEmployees();
      break;
    default:
      exit();
  }
}

function viewAllEmployees() {
  mainMenu();
}

function exit() {
  console.log('Goodbye!');
  process.exit(0);
}

run();