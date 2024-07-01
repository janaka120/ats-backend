const express = require("express");
const { check, query, body } = require("express-validator");

const apiController = require("../controllers/api");
const isAuth = require("../middleware/is-auth");
const { ROLE_TYPES } = require("../utils/constants");
const {
  queryUserByEmail,
  queryUsersByEmailList,
  queryUserByEmailRole,
} = require("../config/db-queries.js");
const { isValidEmailList } = require("../utils/common-utils");

const router = express.Router();

// GET /api/all
router.get(
  "/all",
  isAuth,
  [
    check("role")
      .exists()
      .withMessage("The role is required")
      .isString()
      .trim()
      .not()
      .isEmpty()
      .withMessage("Invalid role.")
      .custom((value, { req }) => {
        if (!ROLE_TYPES.includes(value)) {
          return Promise.reject("Role not exists.");
        }
        return [];
      }),
  ],
  apiController.getUsers
);

// POST api/register
router.post(
  "/register",
  isAuth,
  [
    body("teacher")
      .exists()
      .withMessage("The teacher is required")
      .not()
      .isEmpty()
      .withMessage("Invalid teacher.")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        return queryUserByEmailRole(value, "teacher").then((result) => {
          const { status, data } = result;
          if (status && data && data.length === 0) {
            return Promise.reject("Teacher E-Mail address does not exists!");
          }
        });
      })
      .normalizeEmail(),
    body("students")
      .exists() // Ensure the parameter exists (mandatory)
      .withMessage("The students is required")
      .not()
      .isEmpty()
      .withMessage("Invalid students.")
      .isArray()
      .withMessage("Invalidate student data type.")
      .custom(isValidEmailList)
      .withMessage("Invalid student email address")
      .custom((value, { req }) => {
        return queryUsersByEmailList(value, "student").then((result) => {
          const { status, data } = result;
          if (!status || !data) {
            return Promise.reject("Validation fail.");
          }
          if (status && data && value.length !== data.length) {
            return Promise.reject("Some email addresses are invalid");
          }
        });
      }),
  ],
  apiController.registerUser
);

// GET api/commonstudents
router.get(
  "/commonstudents",
  isAuth,
  [
    query("teacher")
      .exists()
      .withMessage("The teacher is required")
      .not()
      .isEmpty()
      .withMessage("Invalid teacher.")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        const emails = typeof value == "string" ? [value] : value;
        return queryUsersByEmailList(emails, "teacher").then((result) => {
          const { status, data } = result;
          if (!status || !data) {
            return Promise.reject("Validation fail.");
          }
          if (status && data && emails.length !== data.length) {
            return Promise.reject("Some email addresses are invalid");
          }
        });
      })
      .normalizeEmail(),
  ],
  apiController.getCommonStudent
);

// POST api/suspend
router.post(
  "/suspend",
  isAuth,
  [
    body("student")
      .exists()
      .withMessage("The student is required")
      .not()
      .isEmpty()
      .withMessage("Invalid student.")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        return queryUserByEmailRole(value, "student").then((result) => {
          const { status, data } = result;
          if (status && data && data.length === 0) {
            return Promise.reject("Student E-Mail address does not exists!");
          }
        });
      })
      .normalizeEmail(),
  ],
  apiController.suspendUser
);

// POST api/retrievefornotifications
router.post(
  "/retrievefornotifications",
  isAuth,
  [
    body("teacher")
      .exists()
      .withMessage("The teacher is required")
      .not()
      .isEmpty()
      .withMessage("Invalid teacher.")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        return queryUserByEmailRole(value, "teacher").then((result) => {
          const { status, data } = result;
          if (status && data && data.length === 0) {
            return Promise.reject("Teacher E-Mail address does not exists!");
          }
        });
      })
      .normalizeEmail(),
    body("notification")
      .exists()
      .withMessage("The notification is required")
      .isString()
      .not()
      .isEmpty()
      .withMessage("Invalid notification."),
  ],
  apiController.retrieveNotificationsUser
);

// POST api/create
router.post(
  "/create",
  isAuth,
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        return queryUserByEmail(value).then((result) => {
          const { status, data } = result;
          if (status && data && data.length > 0) {
            return Promise.reject("E-Mail address already exists!");
          }
        });
      })
      .normalizeEmail(),
    body("password").trim().isLength({ min: 5 }),
    body("name").trim().not().isEmpty(),
    body("role")
      .trim()
      .not()
      .isEmpty()
      .custom((value, { req }) => {
        if (!ROLE_TYPES.includes(value)) {
          return Promise.reject("Role not exists.");
        }
        return [];
      }),
  ],
  apiController.createUser
);

module.exports = router;
