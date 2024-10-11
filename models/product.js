const mongoose = require("mongoose");
const Joi = require("joi");

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 255,
  },
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
  imageUrl: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  features: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  whatsappNumber: {
    type: String,
  },
  telegramNumber: {
    type: String,
  },
});

const Product = mongoose.model("Product", productSchema);

function validateAddProduct(product) {
  const schema = Joi.object({
    title: Joi.string().min(1).max(255).required(),
    price: Joi.number().min(0).required(),
    discountPrice: Joi.number(),
    imageUrl: Joi.string().required(),
    description: Joi.string().required(),
    features: Joi.string().required(),
    tags: Joi.array().items(Joi.string().min(1).max(255)).required(),
    category: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required(),
    whatsappNumber: Joi.string(),
    telegramNumber: Joi.string(),
  });

  return schema.validate(product);
}

function validateUpdateProduct(product) {
  const schema = Joi.object({
    title: Joi.string().min(1).max(255),
    price: Joi.number().min(0),
    discountPrice: Joi.number(),
    imageUrl: Joi.string(),
    description: Joi.string(),
    features: Joi.string(),
    tags: Joi.array().items(Joi.string().min(1).max(255)),
    category: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    whatsappNumber: Joi.string(),
    telegramNumber: Joi.string(),
  });

  return schema.validate(product);
}

exports.Product = Product;
exports.validateAddProduct = validateAddProduct;
exports.validateUpdateProduct = validateUpdateProduct;
