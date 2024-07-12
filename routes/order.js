// [SECTION] Dependencies and Modules
const express = require("express");
const orderController = require("../controllers/order.js");
// Import the auth.js and deconstruct it to get our verify function
const { verify, isLoggedIn, verifyAdmin } = require("../auth.js");
// [SECTION] Routing Component
const router = express.Router();

router.post('/checkout', verify, orderController.userCheckout);

router.get("/my-orders", verify, orderController.getMyOrders);

router.get("/all-orders", verify, verifyAdmin, orderController.getAllOrders); 

module.exports = router;