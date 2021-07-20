USE employee_cms_db;

-- SET FOREIGN_KEY_CHECKS = 0;
-- DELETE FROM employee_cms_db.department;
-- DELETE FROM employee_cms_db.role;
-- DELETE FROM employee_cms_db.employee;
-- SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO department (name)
VALUES 
  ("sushi"),
  ("ramen");

INSERT INTO role (title, salary, department_id)
VALUES
  ("Fish Massager", 75000, 1),
  ("Broth Taster", 80000, 2),
  ("Noodle Elonger", 100000, 2);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
  ("May", "Tofu", 1, null),
  ("Ky", "Chashu",  2, null),
  ("Millia", "Onion", 3, 2),
  ("Potemkin", "Potato", 1, 1),
  ("Giovanna", "Maguro", 1, 1);
  