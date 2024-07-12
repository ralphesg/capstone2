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
	origin: ["http://localhost:8000"],
	credentials: true,
	optionsSuccessStatus: 200
}

app.use(cors(corsOptions));

mongoose.connect(process.env.MONGODB_STRING);

mongoose.connection.once('open', () => console.log("Now connected to MongoDB Atlas"));

// [Backend Routes]

app.use("/users", userRoutes);
app.use("/cart", cartRoutes);
app.use("/product", productRoutes);
app.use("/order", orderRoutes);

// [Server Gateway Response]


if(require.main === module) {
	app.listen(process.env.PORT || 4000, () => console.log(`API is now available in port ${process.env.PORT || 4000}`));
}

module.exports = { app, mongoose };