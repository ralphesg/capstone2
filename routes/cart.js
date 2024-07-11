// [SECTION] Dependencies and Modules
const express = require("express");
const cartController = require("../controllers/cart.js");
// Import the auth.js and deconstruct it to get our verify function
const { verify, isLoggedIn, verifyAdmin } = require("../auth.js");
// [SECTION] Routing Component
const router = express.Router();

router.post('/add-to-cart', verify, cartController.addToCart);

router.get('/get-cart', verify, cartController.getUsersCart);

router.patch('/update-cart-quantity', verify, cartController.updateCartItemQuantity);

router.patch('/:productid/remove-from-cart', verify, cartController.removeItemfFromCart);

router.put('/clear-cart', verify, cartController.clearCart);

module.exports = router;