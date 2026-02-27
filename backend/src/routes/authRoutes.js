const express = require("express");
const router = express.Router();

const { register, login } = require("../controllers/authController");
const { registerValidator, loginValidator } = require("../utils/userValidators");

const { auth0Login } = require("../controllers/auth0Controller");

router.post("/auth0", auth0Login);

router.post("/register", registerValidator, register);
router.post("/login", loginValidator, login);

module.exports = router;