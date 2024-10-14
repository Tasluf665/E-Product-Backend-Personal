const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const dotenv = require("dotenv");
dotenv.config();
const express = require('express');
const mongoose = require("mongoose");

const cors = require("cors");
const error = require("./middleware/error");

const auth = require("./routes/auth");
const product = require("./routes/product");
const category = require("./routes/category");
const order = require("./routes/order");

const app = express();
app.set("view engine", "ejs");

if (!process.env.MONGODB_URL) {
    console.error("FATAL ERROR: MONGODB_URL is not define");
    process.exit(1);
}

mongoose
    .connect(process.env.MONGODB_URL)
    .then(() => console.log("Connected with mongodb"))
    .catch((err) => console.log("Could not connect to mongodb", err));

const origins = [
    "http://localhost:3000",
    "http://gvaccountsell.com/",
    "https://gvaccountsell.com/",
    "https://e-product-backend-liard.vercel.app/"
];

const corsOptions = {
    origin: origins,
    credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use("/uploads", express.static("uploads"));
app.use("/api/auth", auth);
app.use("/api/product", product);
app.use("/api/category", category);
app.use("/api/order", order);
app.use(error);

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Listening on port ${port}...`));

