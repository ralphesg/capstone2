// [SECTION] Dependencies and Modules

const User = require("../models/User.js");
const Product = require("../models/Product.js");
// Importing auth.js
const auth = require("../auth.js");
const { errorHandler } = auth;
const mongoose = require('mongoose');

module.exports.createProduct = async (req, res) => {
  // Check if the user is an admin
  if (!req.user.isAdmin) {
    return res.status(403).send({ message: 'Access denied. Only admins can create products.' });
  }

  // Extract product details from request body
  const { name, description, price, isActive } = req.body;

  // Validate required fields
  if (!name || !price) {
    return res.status(400).send({ message: 'Name and price are required.' });
  }

  // Create a new product
  const newProduct = new Product({
    name,
    description,
    price,
    isActive,
  });

  try {
    const savedProduct = await newProduct.save();
    res.status(201).send({product: savedProduct});
  } catch (error) {
    res.status(500).send({ message: 'Error creating product', error });
  }
};


module.exports.getAllProduct = (req, res) => {

    return Product.find({})
    .then(result => {
        // if the result is not null send status 200 and its result
        if(result.length > 0){
            return res.status(200).send({products: result});
        }
        else{
            return res.status(404).send({message: 'No product found'});
        }
    })
    .catch(error => errorHandler(error, req, res));

};

module.exports.getAllActive = (req, res) => {

    Product.find({ isActive: true })
    .then(result => {
        // If the result is not null
        if(result.length > 0){
            // send the result as a response
            return res.status(200).send({products: result});
        // else, there are no results found
        } else {
            // send a false boolean value
            return res.status(404).send(false);
        }
    })
    .catch(error => errorHandler(error, req, res));
};

module.exports.getProduct = (req, res) => {

    Product.findById(req.params.id)
    .then(result => res.send({product: result}))
    .catch(err => errorHandler(err, req, res));
};


module.exports.updateProduct = (req, res) => {
    console.log(req.params.id);
    let productUpdate = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price
    }

    return Product.findByIdAndUpdate(req.params.id, productUpdate, {
    new: true,
  })
    .then((product) => {
      if (product) {
        res.status(200).send({
          message: "Product updated successfully",
          updatedProduct: product
        })
      } else {
        res.status(404).send({ message: "Product not found" })
      }
    })
    .catch((error) => errorHandler(error, req, res))
};


module.exports.archiveProduct = (req, res) => {

    let updateActiveField = {
        isActive: false
    };

    Product.findByIdAndUpdate(req.params.id, updateActiveField)
    .then(product => {
        if (product) {
            if (!product.isActive) {
                return res.status(200).send({ 
                    message: 'Product already archived',
                    product: product
                });
            }
            return res.status(200).send({ 
                message: 'Product archived successfully',
                archiveProduct: product
            });
        } else {
            return res.status(404).send({ message: 'Product not found' });
        }
    })
    .catch(error => errorHandler(error, req, res));
};


module.exports.activateProduct = (req, res) => {

    let updateActiveField = {
        isActive: true
    }

    Product.findByIdAndUpdate(req.params.id, updateActiveField)
    .then(product => {
        if (product) {
            if (product.isActive) {
                return res.status(200).send({ 
                    message: 'Product already activated', 
                    product: product
                });
            }
            return res.status(200).send({
                message: 'Product activated successfully',
                activateProduct: product
            });
        } else {
            return res.status(404).send({ message: 'Product not found' });
        }
    })
    .catch(error => errorHandler(error, req, res));
};


module.exports.searchProductByPrice = async (req, res) => {
  try {
    const { minPrice, maxPrice } = req.body;

    // Validate the price range
    if (minPrice === undefined || maxPrice === undefined) {
      return res.status(400).json({ message: 'Please provide both minPrice and maxPrice' });
    }

    if (minPrice > maxPrice) {
      return res.status(400).json({ message: 'minPrice cannot be greater than maxPrice' });
    }

    // Query the database for courses within the price range
    const products = await Product.find({
      price: { $gte: minPrice, $lte: maxPrice }
    });

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to search for products' });
  }
};


module.exports.searchProductByName = async (req, res) => {
  try {
    const { name } = req.body;

    // Validate the name
    if (!name) {
      return res.status(400).json({ message: 'Please provide a product name to search' });
    }

    // Query the database for products with a name matching the given name
    const products = await Product.find({
      name: { $regex: new RegExp(name, 'i') } // 'i' makes it case-insensitive
    });

    if (products.length === 0) {
      return res.status(404).json({ message: 'No products found with the specified name' });
    }

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to search for products' });
  }
};