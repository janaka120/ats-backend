const pool = require("./db.js");

async function queryUserById(id) {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection?.beginTransaction();
    const [user] = await connection?.query("SELECT * FROM Users WHERE id = ?", [
      id,
    ]);
    connection?.release();

    return { status: true, data: user[0] };
  } catch (error) {
    console.log("queryUserById | Error:", error);
    connection?.release();
    return { status: false, message: error?.message || error };
  }
}

async function queryUserByEmailRole(email, role) {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection?.beginTransaction();
    const [user] = await connection?.query(
      "SELECT * FROM Users WHERE email = ? AND role = ?",
      [email, role]
    );
    connection?.release();

    return { status: true, data: user[0] };
  } catch (error) {
    console.log("queryUserByEmailRole | Error:", error);
    connection?.release();
    return new Error(error?.message || error);
  }
}

async function queryUserByEmail(email) {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection?.beginTransaction();
    const [user] = await connection?.query(
      "SELECT * FROM Users WHERE email = ?",
      [email]
    );
    connection?.release();

    return { status: true, data: user[0] };
  } catch (error) {
    console.log("queryUserByEmail | Error:", error);
    connection?.release();
    return new Error(error?.message || error);
  }
}

async function queryInsertUser(email, name, password, role) {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection?.beginTransaction();

    const [user] = await connection?.query(
      "INSERT INTO Users (email, name, password, role) VALUES (?, ?, ?, ?)",
      [email, name, password, role]
    );
    connection?.release();
    const id = user?.insertId;
    if (id) {
      return await queryUserById(id);
    }
    return { status: false, message: "Fail to insert user data" };
  } catch (error) {
    console.log("queryInsertUser | Error:", error);
    connection?.release();
    return { status: false, message: error?.message || error };
  }
}

async function queryAllUsersByRole(role) {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection?.beginTransaction();

    const [users] = await connection?.query(
      "SELECT * FROM Users WHERE role = ?",
      [role]
    );
    connection?.release();

    return { status: true, data: users };
  } catch (error) {
    console.log("queryAllUsersByRole | Error:", error);
    connection?.release();
    return { status: false, message: error?.message || error };
  }
}

async function queryUsersByEmailList(emails, role) {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection?.beginTransaction();

    const emailClause = emails.map((email) => "?").join(", ");
    const query = `SELECT * FROM Users WHERE email IN (${emailClause})`;

    const [users] = await connection.query(query, emails);
    connection?.release();
    const validEmails = users.filter(
      (user) => user.email && user.role === role
    );

    return { status: true, data: validEmails };
  } catch (error) {
    console.log("queryUsersByEmailList | Error:", error);
    connection?.release();
    return { status: false, message: error?.message || error };
  }
}

async function queryInsertTeacherStudent(teacherEmail, studentEmails) {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection?.beginTransaction();

    const teacherData = await queryUserByEmailRole(teacherEmail, "teacher");
    let studentValues = await Promise.all(
      studentEmails.map(async (email) => {
        const { status, data } = await queryUserByEmailRole(email, "student");
        if (teacherData.status && teacherData.data && status && data) {
          return [teacherData.data.id, data.id];
        }
      })
    );
    const insertQuery = `INSERT IGNORE INTO Teachers_Students (teacher_id, student_id) VALUES ${studentValues.map(
      (val) => `(${val[0]}, ${val[1]})`
    )}`;
    const insertRes = await connection.query(insertQuery, studentValues);
    connection.release();
    if (insertRes) {
      return { status: true, data: insertRes.insertId };
    }

    return { status: false, message: "Fail to insert student data" };
  } catch (error) {
    console.log("queryInsertTeacherStudent | Error:", error);
    connection?.release();
    return { status: false, message: error?.message || error };
  }
}

async function queryStudentsBelongsTeacher(teacherEmails) {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection?.beginTransaction();
    const placeholders = teacherEmails.map(() => "?");

    const query = `
        SELECT students.email
        FROM Users AS teachers
        INNER JOIN Teachers_Students ON teachers.id = Teachers_Students.teacher_id
        INNER JOIN Users AS students ON Teachers_Students.student_id = students.id
        WHERE teachers.email IN (${placeholders}) AND teachers.role = 'teacher' AND students.role = 'student'
    `;

    const [students] = await connection.query(query, teacherEmails);

    connection.release();

    if (students) {
      return { status: true, data: students };
    }
    return { status: false, message: "Fail to query students" };
  } catch (error) {
    console.log("queryStudentsBelongsTeacher | Error:", error);
    connection?.release();
    return { status: false, message: error?.message || error };
  }
}

async function querySuspendUser(email, role) {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection?.beginTransaction();

    const [result] = await connection.query(
      "UPDATE Users SET suspended = TRUE WHERE email = ? AND role = ?",
      [email, role]
    );

    connection.release();

    if (result) {
      return { status: true, data: result };
    }
    return { status: false, message: "Fail to query students" };
  } catch (error) {
    console.log("querySuspendUser | Error:", error);
    connection?.release();
    return { status: false, message: error?.message || error };
  }
}

async function queryAllUsersNotSuspend(emails) {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection?.beginTransaction();

    const emailClause = emails.map((email) => "?").join(", ");
    const query = `SELECT * FROM Users WHERE suspended = false AND role = 'student' AND email IN (${emailClause})`;

    const [users] = await connection.query(query, emails);
    connection?.release();
    const validEmails = users.filter(
      (user) => user.email && user.role === 'student'
    );

    return { status: true, data: validEmails };
  } catch (error) {
    console.log("queryAllUsersNotSuspend | Error:", error);
    connection?.release();
    return { status: false, message: error?.message || error };
  }
}

module.exports = {
  queryUserById,
  queryInsertUser,
  queryUserByEmailRole,
  queryAllUsersByRole,
  queryUserByEmail,
  queryUsersByEmailList,
  queryInsertTeacherStudent,
  queryStudentsBelongsTeacher,
  querySuspendUser,
  queryAllUsersNotSuspend
};
