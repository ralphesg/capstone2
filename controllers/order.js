const mongoose = require('mongoose');
const auth = require("../auth.js");
const Cart = require("../models/Cart.js");
const Order = require("../models/Order.js");


module.exports.userCheckout = async (req, res) => {

  try {
  	const userId = req.user.id;

    let cart = await Cart.findOne({userId});

    if (!cart) {
      return res.status(404).send({ error: 'No Items to Checkout' });
    }

    if (cart.cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
 
      const newOrder = new Order({
        userId: cart.userId,
      	productsOrdered: cart.cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        subtotal: item.subtotal,
      })),
      totalPrice: cart.totalPrice,
    });
    
    const savedOrder = await newOrder.save();

    cart.cartItems = [];
    cart.totalPrice = 0;
    await cart.save();

   
    res.status(201).send({
      message: 'Ordered Successfully'
    });
  } catch (error) {
    res.status(500).send({ error: 'Failed to Checkout', error });
  }
};


module.exports.getMyOrders = (req, res) => {
  return Order.find({userId : req.user.id})
  .then(orders => {
    if (orders.length > 0) {
      return res.status(200).send({orders: orders});
    }
    return res.status(404).send({
      error: 'No orders found'
    });
  })
  .catch(error => errorHandler(error, req, res));
};


module.exports.getAllOrders = (req, res) => {

    return Order.find({})
    .then(orders => {
        if(orders.length > 0){
            return res.status(200).send({orders: orders});
        }
        else{
            return res.status(404).send({error: 'No orders found'});
        }
    })
    .catch(error => errorHandler(error, req, res));
};