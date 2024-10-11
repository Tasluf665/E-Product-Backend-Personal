const express = require("express");
const router = express.Router();
const _ = require("lodash");
const { Category, validateCategory } = require("../models/category");
const asyncMiddleware = require("../middleware/async");
const { Product } = require("../models/product");

router.get(
  "/",
  asyncMiddleware(async (req, res) => {
    const allCategories = await Category.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "category",
          as: "products",
        },
      },
      {
        $addFields: {
          productCount: { $size: "$products" },
        },
      },
    ]).exec();

    res.send({
      success: "All Categories fetch successfully",
      data: allCategories,
    });
  })
);

router.get("/products-by-category", async (req, res) => {
  try {
    // Fetch all categories
    const categories = await Category.find();

    // Fetch products for each category and construct the response
    const categoriesWithProducts = await Promise.all(
      categories.map(async (category) => {
        const products = await Product.find({ category: category._id });
        return {
          category: category.name,
          products: products,
        };
      })
    );

    res.json(categoriesWithProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  const { error } = validateCategory(req.body);
  if (error) return res.status(400).send({ error: error.details[0].message });

  let category = new Category(_.pick(req.body, ["name"]));

  await category.save();

  res.send({
    success: "Category has successfully added",
    data: category,
  });
});

router.put("/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;
    let category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).send({ error: "Category not found" });
    }

    const { error } = validateCategory(req.body);
    if (error) return res.status(400).send({ error: error.details[0].message });

    if (req.body.name) category.name = req.body.name;

    await category.save();

    res.send({
      success: "Category has been updated successfully",
      data: category,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal server error" });
  }
});

router.delete("/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).send({ error: "Category not found" });
    }

    await Category.deleteOne({ _id: categoryId });

    res.send({
      success: "Category has been successfully deleted",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

router.get("/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).send({ error: "Category not found" });
    }

    res.send({
      success: "Category fetched successfully",
      data: category,
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

module.exports = router;
