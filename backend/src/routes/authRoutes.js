const express = require("express");
const router = express.Router();

const { register, login, googleLogin } = require("../controllers/authController");
const { registerValidator, loginValidator } = require("../utils/userValidators");

//  Google
router.post("/google", googleLogin);

router.post("/register", registerValidator, register);
router.post("/login", loginValidator, login);

module.exports = router;