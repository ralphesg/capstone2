const express = require("express");
const mongoose = require("mongoose");

const cors = require("cors");

// [ROUTES]

const userRoutes = require("./routes/user.js");
const cartRoutes = require("./routes/cart.js");
const productRoutes = require("./routes/product.js");
const orderRoutes = require("./routes/order.js");


// [Environment Setup] 

require("dotenv").config();

// [Server setup] 

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));

const corsOptions = {
	origin: ["https://capstone3-mocha.vercel.app"],
	credentials: true,
	optionsSuccessStatus: 200
}

app.use(cors(corsOptions));

mongoose.connect(process.env.MONGODB_STRING);

mongoose.connection.once('open', () => console.log("Now connected to MongoDB Atlas"));

// [Backend Routes]

app.use("/b2/users", userRoutes);
app.use("/b2/cart", cartRoutes);
app.use("/b2/products", productRoutes);
app.use("/b2/orders", orderRoutes);

// [Server Gateway Response]


if(require.main === module) {
	app.listen(process.env.PORT || port, () => console.log(`API is now available in port ${process.env.PORT || port}`));
}

module.exports = { app, mongoose };
