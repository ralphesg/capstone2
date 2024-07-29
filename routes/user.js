// [SECTION] Dependencies and Modules
const express = require("express");
const userController = require("../controllers/user.js");
// Import the auth.js and deconstruct it to get our verify function
const { verify, isLoggedIn, verifyAdmin } = require("../auth.js");
// [SECTION] Routing Component
const router = express.Router();

router.patch('/update-password', verify, userController.updatePassword);

router.patch('/:id/set-as-admin', verify, verifyAdmin, userController.updateUserToAdmin);

router.get("/details", verify, userController.getProfile);

router.get("/details-specific/:id", verify, userController.getSpecificProfile);

router.post("/check-email", userController.checkEmailExists);

router.post("/register", userController.registerUser);

router.post("/login", userController.loginUser);

// [SECTION] Export Route System
module.exports = router;