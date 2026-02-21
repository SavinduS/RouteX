const { body } = require("express-validator");

exports.registerValidator = [
  body("full_name").notEmpty().withMessage("Full name is required"),
  body("email").isEmail().withMessage("Valid email required"),
  body("phone_number").notEmpty().withMessage("Phone number required"),
  body("password").isLength({ min: 6 }).withMessage("Password min 6 characters"),
  body("role")
    .isIn(["entrepreneur", "driver", "admin"])
    .withMessage("Invalid role"),
];

exports.loginValidator = [
  body("email").isEmail().withMessage("Valid email required"),
  body("password").notEmpty().withMessage("Password is required"),
];