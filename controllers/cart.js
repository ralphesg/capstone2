const mongoose = require('mongoose');
const auth = require("../auth.js");
const Product = require("../models/Product.js");
const Cart = require("../models/Cart.js");

module.exports.addToCart = async (req, res) => {
  const { userId, productId, quantity } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send({ message: 'Product not found' });
    }

    let cart = await Cart.findOne({ userId });

    const subtotal = product.price * quantity;

    if (cart) {
      // If the cart exists, update it
      const itemIndex = cart.cartItems.findIndex((item) => item.productId.equals(productId));

      if (itemIndex > -1) {
        // If product exists in the cart, update the quantity and subtotal
        cart.cartItems[itemIndex].quantity += quantity;
        cart.cartItems[itemIndex].subtotal += subtotal;
      } else {
        // If product does not exist in the cart, add it
        cart.cartItems.push({ productId, quantity, subtotal });
      }

      cart.totalPrice += subtotal;
    } else {
      // If cart does not exist, create a new one
      cart = new Cart({
        userId,
        cartItems: [{ productId, quantity, subtotal }],
        totalPrice: subtotal,
      });
    }

    const savedCart = await cart.save();

    res.status(201).send({
      message: 'Item added to cart successfully',
      cart: savedCart,
    });
  } catch (error) {
    res.status(500).send({ message: 'Error adding item to cart', error });
  }
};

module.exports.getUsersCart = (req, res) => {
  return Cart.find({cartId: req.body.id})
  .then(cart => {
    if (cart.length > 0) {
      console.log(cart);
      return res.status(200).send({cart: cart});
    }
    console.log(cart);
    return res.status(404).send({
      message: 'Cart not found'
    });
  })
  .catch(error => errorHandler(error, req, res));
};
