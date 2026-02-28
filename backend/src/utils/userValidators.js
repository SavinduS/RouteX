const { body } = require("express-validator");

// AUTH VALIDATORS
exports.registerValidator = [
  body("full_name").notEmpty().withMessage("Full name is required"),

  body("email").isEmail().withMessage("Valid email required"),

  body("phone_number").notEmpty().withMessage("Phone number required"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password min 6 characters"),

  body("role")
    .isIn(["entrepreneur", "driver", "admin"])
    .withMessage("Invalid role"),

  // Driver-only validation
  body("vehicle_type")
    .if(body("role").equals("driver"))
    .notEmpty()
    .withMessage("Vehicle type required for driver"),

  body("license_number")
    .if(body("role").equals("driver"))
    .notEmpty()
    .withMessage("License number required for driver"),
];

exports.loginValidator = [
  body("email").isEmail().withMessage("Valid email required"),
  body("password").notEmpty().withMessage("Password is required"),
];

// USER PROFILE VALIDATORS
exports.updateProfileValidator = [
  body("full_name")
    .optional()
    .isLength({ min: 2 })
    .withMessage("Full name too short"),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Valid email required"),

  body("phone_number")
    .optional()
    .notEmpty()
    .withMessage("Phone number required"),
];

exports.changePasswordValidator = [
  body("current_password")
    .notEmpty()
    .withMessage("Current password required"),

  body("new_password")
    .isLength({ min: 6 })
    .withMessage("New password min 6 characters"),
];

// ADMIN USER VALIDATORS
exports.adminCreateUserValidator = [
  body("full_name").notEmpty().withMessage("Full name is required"),

  body("email").isEmail().withMessage("Valid email required"),

  body("phone_number").notEmpty().withMessage("Phone number required"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password min 6 characters"),

  body("role")
    .isIn(["entrepreneur", "driver", "admin"])
    .withMessage("Invalid role"),
];

exports.adminUpdateUserValidator = [
  body("full_name").optional().isLength({ min: 2 }),
  body("email").optional().isEmail(),
  body("phone_number").optional().notEmpty(),
  body("role")
    .optional()
    .isIn(["entrepreneur", "driver", "admin"]),
];