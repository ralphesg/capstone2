const mongoose = require('mongoose');
const auth = require("../auth.js");
const Product = require("../models/Product.js");
const Cart = require("../models/Cart.js");

module.exports.addToCart = async (req, res) => {
  const { productId, quantity } = req.body;

  const userId = req.user.id;

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



module.exports.getUsersCart = async (req, res) => {
  const userId = req.user.id;

  let cart = await Cart.findOne({ userId });

  try {
   if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }

  res.status(201).send({
    cart: cart,
  });

} catch (err) {
  res.status(500).json({ error: err.message });
}
};



module.exports.updateCartItemQuantity = async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;


  try {
    // Find the user's cart
    let cart = await Cart.findOne({ userId });
    const product = await Product.findById(productId);

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find the cart item
    let cartItem = cart.cartItems.find(item => item.productId.toString() === productId);

    if (!cartItem) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    // Update the quantity and subtotal
    cartItem.quantity = quantity;
    cartItem.subtotal = product.price * cartItem.quantity

    // Update the total price of the cart
    cart.totalPrice = cart.cartItems.reduce((total, item) => total + item.subtotal, 0);

    // Save the updated cart
    const savedCart = await cart.save();

    res.status(201).send({
      message: 'Item updated cart successfully',
      updatedCart: savedCart,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


module.exports.removeItemfFromCart = async (req, res) => {
  const productId = req.params.productid;
  const userId = req.user.id;

  try {
    // Find the user's cart
    let cart = await Cart.findOne({ userId });
    const product = await Product.findById(productId);

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find the cart item
    const productIndex = cart.cartItems.findIndex(item => item.productId.toString() === productId);

    if (productIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    // Remove the product from cartItems
    const removedProduct = cart.cartItems.splice(productIndex, 1)[0];

    // Update totalPrice in cart
    cart.totalPrice -= removedProduct.subtotal;

    // Save the updated cart
    const savedCart = await cart.save();

    res.status(201).send({
      message: 'Item removed from cart successfully',
      updatedCart: savedCart,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


module.exports.clearCart = async (req, res) => {
  const userId = req.user.id;


  try {
    // Find the user's cart
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }


    // Clear cartItems array
    cart.cartItems = [];

    // Update totalPrice to 0 
    cart.totalPrice = 0;

    // Save the updated cart
    const savedCart = await cart.save();

    res.status(201).send({
      message: 'Cart cleared successfully',
      updatedCart: savedCart,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


