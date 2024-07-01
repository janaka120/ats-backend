const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
dotenv.config();

async function createTables() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
  });

  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${process.env.MYSQL_DATABASE}`
    );

    await connection.query(`USE ${process.env.MYSQL_DATABASE}`);

    await connection.query(`
    CREATE TABLE IF NOT EXISTS Users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) UNIQUE,
        name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        suspended BOOLEAN DEFAULT FALSE,
        role ENUM('teacher', 'student') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    await connection.query(`
        CREATE TABLE IF NOT EXISTS Teachers_Students (
            teacher_id INT,
            student_id INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (teacher_id) REFERENCES Users(id),
            FOREIGN KEY (student_id) REFERENCES Users(id),
            PRIMARY KEY (teacher_id, student_id)
            );
        ;`);

    const [data] = await connection.query(`SELECT * FROM Users`);
    // Insert mock data into Users table
    if (!data || data.length === 0) {
      await connection.query(`
        INSERT INTO Users (email, name, password, role) VALUES
        ('teacherken@gmail.com', 'Ken Teacher', 'mockpassword001', 'teacher'),
        ('teacherjoe@example.com', 'Joe Teacher', 'mockpassword002', 'teacher'),
        ('studentjon@gmail.com', 'Jon Student', 'mockpassword003', 'student'),
        ('studenthon@gmail.com', 'Thon Student', 'mockpassword004', 'student'),
        ('commonstudent1@gmail.com', 'Common Student One', 'mockpassword005', 'student'),
        ('commonstudent2@gmail.com', 'Common Student Two', 'mockpassword006', 'student'),
        ('student_only_under_teacher_ken@gmail.com', 'Student Ken', 'mockpassword007', 'student'),
        ('studentmary@gmail.com', 'Mary Student', 'mockpassword008', 'student'),
        ('studentbob@gmail.com', 'Bob Student', 'mockpassword009', 'student'),
        ('studentagnes@gmail.com', 'Agnes Student', 'mockpassword010', 'student'),
        ('studentmiche@gmail.com', 'Miche Student', 'mockpassword011', 'student');
      `);
    }

    console.log("Tables created successfully");
  } catch (err) {
    console.error(err);
    console.error("Error creating tables");
    process.exit(1); // Exit process with an error code
  } finally {
    console.log("Close DB connection");
    await connection.end();
  }
}

module.exports = createTables;
