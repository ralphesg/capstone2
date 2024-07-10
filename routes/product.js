const express = require("express");
const productController = require("../controllers/product.js");
const { verify, isLoggedIn, verifyAdmin } = require("../auth.js");
const router = express.Router();
const User = require('../models/User');

router.post('/', verify, verifyAdmin, productController.createProduct);

router.get("/all", verify, verifyAdmin, productController.getAllProduct); 

router.get("/active", productController.getAllActive);

router.get("/:id", productController.getProduct);

// [SECTION] Export Route System
module.exports = router;