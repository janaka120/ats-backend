const { validationResult } = require("express-validator");

const {
  queryAllUsersByRole,
  queryInsertUser,
  queryInsertTeacherStudent,
  queryStudentsBelongsTeacher,
  querySuspendUser,
  queryAllUsersNotSuspend,
  queryUsersByEmailList,
} = require("../config/db-queries.js");
const { retrieveEmailAddressInString } = require("../utils/common-utils.js");

exports.getUsers = async (req, res, next) => {
  try {
    const role = req.query.role;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed.");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    const result = await queryAllUsersByRole(role);
    if (!result.status) {
      throw new Error(result.message);
    }
    res.status(200).json({
      message: "Fetched users successfully.",
      data: result.data,
      status: true,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed, entered data is incorrect.");
      error.statusCode = 422;
      throw error;
    }
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    const role = req.body.role;
    const result = await queryInsertUser(email, name, password, role);
    if (!result.status) {
      throw new Error(result.message);
    }
    res.status(200).json({
      message: "Create user successfully.",
      data: result.data,
      status: true,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.registerUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed, entered data is incorrect.");
      error.statusCode = 422;
      throw error;
    }
    const teacher = req.body.teacher;
    const students = req.body.students;
    const result = await queryInsertTeacherStudent(teacher, students);
    if (!result.status) {
      throw new Error(result.message);
    }
    res.status(200).json({
      message: "Registered student under teacher successfully.",
      status: true,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getCommonStudent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed, entered data is incorrect.");
      error.statusCode = 422;
      throw error;
    }

    const queryParams = req.query;
    const teachersEmails =
      typeof queryParams.teacher === "string"
        ? [queryParams.teacher]
        : queryParams.teacher;

    const result = await queryStudentsBelongsTeacher(teachersEmails);
    if (!result.status) {
      throw new Error(result.message);
    }
    const data = result.data.map((user) => user.email);
    res.status(200).json({
      message: "Fetch student under teachers successfully.",
      status: true,
      students: data,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.suspendUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed, entered data is incorrect.");
      error.statusCode = 422;
      throw error;
    }
    const student = req.body.student;
    const result = await querySuspendUser(student, "student");
    if (!result.status) {
      throw new Error(result.message);
    }
    res.status(200).json({
      message: "Suspended student successfully.",
      status: true,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.retrieveNotificationsUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed, entered data is incorrect.");
      error.statusCode = 422;
      throw error;
    }
    const teacher = req.body.teacher;
    const notification = req.body.notification;
    const studentEmails = retrieveEmailAddressInString(notification);
    const resultStudents = await queryStudentsBelongsTeacher([teacher]);
    const studentsUnderTeacher = resultStudents.status
      ? resultStudents.data.map((user) => user.email)
      : [];

    if (studentEmails && studentEmails.length > 0) {
      const studentEmailsVerifyRes = await queryUsersByEmailList(
        studentEmails,
        "student"
      );
      const tagValidEmails = studentEmailsVerifyRes.status
        ? studentEmailsVerifyRes.data
        : [];
      if (tagValidEmails.length !== studentEmails.length) {
        const error = new Error(
          "Validation failed, given emails are incorrect."
        );
        error.statusCode = 422;
        throw error;
      }
    }

    const notifyStudentResult = await queryAllUsersNotSuspend([
      ...studentsUnderTeacher,
      ...studentEmails,
    ]);
    if (!notifyStudentResult.status) {
      throw new Error(result.message);
    }
    const recipients = notifyStudentResult.data.map((student) => student.email);
    res.status(200).json({
      message: "Notify student successfully.",
      status: true,
      recipients: recipients,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
