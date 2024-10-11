const mongoose = require("mongoose");
const Joi = require("joi");

function generateTransactionId() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const orderSchema = new mongoose.Schema(
  {
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPrice: {
      type: Number,
      validate: {
        validator: function (value) {
          return value < this.price;
        },
        message: "Discount price must be less than the original price.",
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    payment: {
      type: String,
      required: true,
    },
    shippingAddress: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true },
      address: { type: String },
      phoneNumber: { type: String },
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
      default: generateTransactionId,
    },
    paymentTnxID: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const validateOrder = (order) => {
  const schema = Joi.object({
    price: Joi.number().min(0).required(),
    discountPrice: Joi.number().min(0).less(Joi.ref("price")).allow(null),
    user: Joi.string().required(),
    payment: Joi.string().required(),
    paymentTnxID: Joi.string().required(),
    shippingAddress: Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string().email().required(),
      address: Joi.string(),
      phoneNumber: Joi.string(),
    }).required(),
  });

  return schema.validate(order);
};

const Order = mongoose.model("Order", orderSchema);

exports.Order = Order;
exports.validateOrder = validateOrder;
