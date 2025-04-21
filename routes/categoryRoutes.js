// routes/categoryRoutes.js
const express = require("express");
const router = express.Router();
const Category = require("../models/Category");
const { protect, authorizeRoles } = require('../middleware/auth');

// // Middleware to check if user is admin
// const isAdmin = (req, res, next) => {
//   if (req.user && req.user.role === "admin") next();
//   else res.status(403).json({ message: "Access denied" });
// };

// Get all categories
router.get("/", protect,async (req, res) => {
  const categories = await Category.find();
  res.json(categories);
});

// Add category
router.post("/",protect, authorizeRoles('admin'), async (req, res) => {
  const { name } = req.body;
  const newCategory = new Category({ name });
  await newCategory.save();
  res.status(201).json(newCategory);
});

// Edit category
router.put("/:id", authorizeRoles('admin'), async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true });
  res.json(category);
});

// Delete category
router.delete("/:id", authorizeRoles('admin'), async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: "Category deleted" });
});

module.exports = router;
