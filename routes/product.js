const express = require("express");
const productController = require("../controllers/product.js");
const { verify, isLoggedIn, verifyAdmin } = require("../auth.js");
const router = express.Router();
const User = require('../models/User');

router.post('/', verify, verifyAdmin, productController.createProduct);

router.get("/all", verify, verifyAdmin, productController.getAllProduct); 

router.get("/active", productController.getAllActive);

router.get("/:productid", productController.getProduct);

router.patch("/:productid/update", verify, verifyAdmin, productController.updateProduct);

router.patch("/:productid/archive", verify, verifyAdmin, productController.archiveProduct);

router.patch("/:productid/activate", verify, verifyAdmin, productController.activateProduct);

// [SECTION] Export Route System
module.exports = router;