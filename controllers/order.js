const mongoose = require('mongoose');
const auth = require("../auth.js");
const Cart = require("../models/Cart.js");
const Order = require("../models/Order.js");


module.exports.userCheckout = async (req, res) => {

  try {
  	const userId = req.user.id;

    let cart = await Cart.findOne({userId});

    console.log(cart)

    if (!cart) {
      return res.status(404).send({ error: 'No items to Checkout' });
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

    // Clear Cart
    // cart.cartItems = [];
    // cart.totalPrice = 0;
    // await cart.save();

   
    res.status(201).send({
      orders: savedOrder
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
      console.log("HEY 1" + orders);
        // if the result is not null send status 200 and its result
        if(orders.length > 0){
            return res.status(200).send({orders: orders});
        }
        else{
            // aside from status code 404 for not found courses, respond with a message indicating no courses were found.
                console.log("HEY 2" + orders);
            return res.status(404).send({error: 'No orders found'});
        }
              console.log("HEY 3" + orders);
    })
    .catch(error => errorHandler(error, req, res));
};