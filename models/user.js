const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 255,
  },
  email: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 255,
    unique: true,
  },
  password: {
    type: String,
    minlength: 5,
    maxlength: 1024,
    required: true,
  },
  role: {
    type: String,
    enum: ["customer", "admin", "moderator"],
    default: "customer"
  },
  verified: {
    type: Boolean,
    default: false,
    required: true,
  },
  phone: {
    type: String,
    minlength: 1,
    maxlength: 20,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
  },
  orders: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Order",
  },
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, role: this.role },
    process.env.JWT_PRIVATE_KEY,
    { expiresIn: process.env.JWT_EXPIRATION_TIME }
  );
  return token;
};

userSchema.methods.generateRefreshToken = function () {
  const refreshToken = jwt.sign(
    { _id: this._id, role: this.role },
    process.env.JWT_REFRESH_TOKEN_PRIVATE_KEY,
    { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME }
  );
  return refreshToken;
};

const User = mongoose.model("User", userSchema);

function validateUserSignUp(user) {
  const schema = Joi.object({
    name: Joi.string().min(1).max(255).required(),
    email: Joi.string().min(1).max(255).required().email(),
    password: Joi.string().min(5).max(255),
    phone: Joi.string().min(1).max(255),
    gender: Joi.string().min(1).max(255),
  });

  return schema.validate(user);
}

function validateUserLogin(user) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
  });

  return schema.validate(user);
}

function validateForgotPassword(user) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
  });

  return schema.validate(user);
}

function validateResetPassword(user) {
  const schema = Joi.object({
    password: Joi.string().min(5).max(255).required(),
  });

  return schema.validate(user);
}

exports.User = User;
exports.validateUserSignUp = validateUserSignUp;
exports.validateUserLogin = validateUserLogin;
exports.validateForgotPassword = validateForgotPassword;
exports.validateResetPassword = validateResetPassword;
