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
        "Add an Employee",
        "Update an Employee's Role",
        "Update an Employee's Manager",
        "Add a Role",
        "Add a Department",
        "Exit"
      ]
    }
  ]);

  // Pick next action based on the user's choice
  switch (answer.menuChoice) {
    case "View All Employees":
      await viewAllEmployees();
      break;
    case "View All Roles":
      await viewAllRoles();
      break;
    case "View All Departments":
      await viewAllDepartments();
      break;
    case "Add an Employee":
      await addEmployee();
      break;
    case "Update an Employee's Role":
      await updateEmployeeRole();
      break;
    case "Update an Employee's Manager":
      await updateEmployeeManager();
      break;
    case "Add a Role":
      await addRole();
      break;
    case "Add a Department":
      await addDepartment();
      break;
    default:
      exit();
  }
  mainMenu();
}

// Displays all employees and their information
async function viewAllEmployees() {
  try {
    const result = await db.selectEmployeesFullDetails();
    console.table(result);
  } catch (error) {
    console.log(error);
  }
}

// Displays all roles and their department
async function viewAllRoles() {
  try {
    const result = await db.selectRolesFullDetails();
    console.table(result);
  } catch (error) {
    console.log(error);
  }
}

// Display all departments
async function viewAllDepartments() {
  try {
    const result = await db.selectDepartments();
    console.table(result);
  } catch (error) {
    console.log(error);
  }
}

// Add an Employee
async function addEmployee() {
  const answers = await inquirer.prompt([
    {
      message: "What is the first name of the employee you would like you add?",
      name: "employeeFirstName",
      type: "input",
    },
    {
      message: "What is the last name of the employee?",
      name: "employeeLastName",
      type: "input",
    },
    {
      message: "What is the role of the employee?",
      name: "employeeRole",
      type: "list",
      choices: listRoles,
    },
    {
      message: "Who is the manager of the employee?",
      name: "employeeManager",
      type: "list",
      // We need to add a blank choice if the employee has no manager
      choices: async function () {
        const employees = await listEmployees();
        employees.push({ name: "N/A", value: null });
        return employees;
      },
    },
  ]);
  try {
    // Wrap employee in an object
    const employee = { 
      first_name: answers.employeeFirstName,
      last_name: answers.employeeLastName,
      role_id: answers.employeeRole,
      manager_id: answers.employeeManager,
    };
    // Call database to add employee object
    const result = await db.insertEmployee(employee);
    // If the insert was successful, affectedRows = 1
    if (result.affectedRows) {
      console.log(`${answers.employeeFirstName} ${answers.employeeLastName} added to Employees.`);
    } else {
      console.log(`Error adding employee.`);
    }
  } catch (error) {
    console.log(`Error adding employee: ${error.message}`);
  }
}

// Update an employee's roles
async function updateEmployeeRole() {
  const answers = await inquirer.prompt([
    {
      message: "Which employee you would like to update?",
      name: "employeeId",
      type: "list",
      choices: listEmployees,
    },
    {
      message: "What is the role of the employee?",
      name: "roleId",
      type: "list",
      choices: listRoles,
    }
  ]);
  try {
    // Wrap the columns to update in an object
    const employee = {
      role_id: answers.roleId,
    };
    // Call database to update employee object
    const result = await db.updateEmployee(employee, answers.employeeId);
    // If the update was successful, affectedRows = 1
    if (result.affectedRows) {
      console.log(
        `Role updated.`
      );
    } else {
      console.log(`Error updating employee.`);
    }
  } catch (error) {
    console.log(`Error updating employee: ${error.message}`);
  }
}

// Update employee manager
async function updateEmployeeManager () {
  const employeeAnswer = await inquirer.prompt([
    {
      message: "Which employee you would like to update?",
      name: "employeeId",
      type: "list",
      choices: listEmployees,
    },
  ]);
  // We need to chain a new inquirer prompt so that our manager choices can filter out
  // the employee currently selected
  const managerAnswer = await inquirer.prompt([
    {
      message: "Who is the manager of the employee?",
      name: "managerId",
      type: "list",
      // We need to add a blank choice if the employee has no manager
      // We also need to not list an employee as their own manager
      choices: async function () {
        const employees = await listEmployees();
        employees.push({ name: "N/A", value: null });
        return employees.filter(item => item.value !== employeeAnswer.employeeId);
      },
    },
  ]);
  try {
    // Wrap the columns to update in an object
    const employee = {
      manager_id: managerAnswer.managerId,
    };
    // Call database to update employee object
    const result = await db.updateEmployee(employee, employeeAnswer.employeeId);
    // If the update was successful, affectedRows = 1
    if (result.affectedRows) {
      console.log(`Manager updated.`);
    } else {
      console.log(`Error updating employee.`);
    }
  } catch (error) {
    console.log(`Error updating employee: ${error.message}`);
  }
}

// Add a role
async function addRole() {
  const answers = await inquirer.prompt([
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
    const salary = answers.roleSalary;
    // Check if salary is a valid number above 0
    if (isNaN(salary) && salary <= 0) {
      throw new Error("Salary must be a valid positive number.");
    }

    const role = {title: answers.roleName, salary: answers.roleSalary, department_id: answers.roleDepartment};
    const result = await db.insertRole(role);
    // If the insert was successful, affectedRows = 1
    if (result.affectedRows) {
      console.log(`${answers.roleName} added to Roles.`);
    } else {
      console.log(`Error adding role.`);
    }
  } catch (error) {
    console.log(`Error adding role: ${error.message}`);
  }
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
      console.log(`${answer.departmentName} added to Departments.`);
    } else {
      console.log(`Error adding department.`);
    }
  } catch (error) {
    console.log(`Error adding department: ${error.message}`);
  }
}

// Helper function that returns an array of objects for employees
// {employeeName: , id: }
async function listEmployees() {
  const results = await db.selectEmployeesWithId();
  return results.map((item) => {
    return { name: item.employeeName, value: item.id };
  });
}

// Helper function that returns an array of objects for roles
// {title: , id: }
async function listRoles() {
  const results = await db.selectRolesWithId();
  return results.map((item) => {
    return { name: item.title, value: item.id };
  });
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