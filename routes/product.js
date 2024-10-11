const express = require("express");
const router = express.Router();
const _ = require("lodash");
const { Category } = require("../models/category");

//Image Upload
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/products");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

const {
  Product,
  validateAddProduct,
  validateUpdateProduct,
} = require("../models/product");
const asyncMiddleware = require("../middleware/async");

router.get(
  "/",
  asyncMiddleware(async (req, res) => {
    const allProducts = await Product.find().populate("category");

    res.send({
      success: "All Product fetch successfully",
      data: allProducts,
    });
  })
);

router.post("/", upload.single("imageUrl"), async (req, res) => {
  if (!req.file) {
    return res
      .status(404)
      .send({ error: "Product must have at least one image" });
  }
  const imagePath = req.file.path;
  req.body.imageUrl = imagePath.replace(/\\/g, "/");

  if (typeof req.body.tags === "string") {
    req.body.tags = req.body.tags.split(",").map((tag) => tag.trim());
  }

  if (!Array.isArray(req.body.tags)) {
    return res.status(400).send({ error: "Tags must be an array of strings" });
  }
  const { error } = validateAddProduct(req.body);
  if (error) return res.status(400).send({ error: error.details[0].message });

  let product = new Product({
    title: req.body.title,
    price: req.body.price,
    discountPrice: req.body.discountPrice,
    imageUrl: req.body.imageUrl,
    description: req.body.description,
    features: req.body.features,
    tags: req.body.tags,
    category: req.body.category,
    whatsappNumber: req.body.whatsappNumber,
    telegramNumber: req.body.telegramNumber,
  });

  await product.save();

  res.send({
    success: "Product has successfully added",
    data: product,
  });
});

router.put("/:productId", upload.single("imageUrl"), async (req, res) => {
  try {
    const { productId } = req.params;
    let product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send({ error: "Product not found" });
    }

    if (req.body.title) product.title = req.body.title;
    if (req.body.price) product.price = req.body.price;
    if (req.body.discountPrice) product.discountPrice = req.body.discountPrice;
    if (req.file) {
      const imagePath = req.file.path;
      product.imageUrl = imagePath.replace(/\\/g, "/");
    }
    if (req.body.description) product.description = req.body.description;
    if (req.body.features) product.features = req.body.features;
    if (typeof req.body.tags === "string") {
      req.body.tags = req.body.tags.split(",").map((tag) => tag.trim());
    }
    if (req.body.tags) {
      if (!Array.isArray(req.body.tags)) {
        return res
          .status(400)
          .send({ error: "Tags must be an array of strings" });
      }
      product.tags = req.body.tags;
    }
    if (req.body.category) {
      const category = await Category.findById(req.body.category);
      if (!category)
        return res.status(400).send({ error: "Invalid category." });

      product.category = req.body.category;
    }
    if (req.body.whatsappNumber)
      product.whatsappNumber = req.body.whatsappNumber;
    if (req.body.telegramNumber)
      product.telegramNumber = req.body.telegramNumber;

    const { error } = validateUpdateProduct(req.body);
    if (error) return res.status(400).send({ error: error.details[0].message });

    await product.save();

    res.send({
      success: "Product has been updated successfully",
      data: product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal server error" });
  }
});

router.delete("/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send({ error: "Product not found" });
    }

    await Product.deleteOne({ _id: productId });

    res.send({
      success: "Product has been successfully deleted",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

router.get(
  "/:productId",
  asyncMiddleware(async (req, res) => {
    try {
      const { productId } = req.params;
      const product = await Product.findById(productId).populate("category");

      if (!product) {
        return res.status(404).send({ error: "Product not found" });
      }

      res.send({
        success: "Product fetched successfully",
        data: product,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: "Internal server error" });
    }
  })
);

module.exports = router;
