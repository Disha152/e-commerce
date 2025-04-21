// // routes/categoryRoutes.js
// const express = require("express");
// const router = express.Router();
// const Category = require("../models/Category");
// const { protect, authorizeRoles } = require('../middleware/auth');



// // Get all categories
// router.get("/", protect,async (req, res) => {
//   const categories = await Category.find();
//   res.json(categories);
// });

// // Add category
// router.post("/",protect, authorizeRoles('admin'), async (req, res) => {
//   const { name } = req.body;
//   const newCategory = new Category({ name });
//   await newCategory.save();
//   res.status(201).json(newCategory);
// });

// // Edit category
// router.put("/:id", authorizeRoles('admin'), async (req, res) => {
//   const category = await Category.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true });
//   res.json(category);
// });

// // Delete category
// router.delete("/:id", authorizeRoles('admin'), async (req, res) => {
//   await Category.findByIdAndDelete(req.params.id);
//   res.json({ message: "Category deleted" });
// });

// module.exports = router;


// routes/categories.js
const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");

// Category routes
router.post("/", categoryController.createCategory);
router.get("/", categoryController.getAllCategories);
router.put("/:id", categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);

// Subcategory routes
router.post("/:id/subcategories", categoryController.addSubcategory);
router.put("/:id/subcategories", categoryController.updateSubcategory);
router.delete("/:id/subcategories/:subcategoryId", categoryController.deleteSubcategory);

// Get all subcategories from all categories
router.get("/subcategories/all", categoryController.getAllSubcategories);

// Get subcategories of a specific category
router.get("/:id/subcategories", categoryController.getSubcategoriesOfCategory);


module.exports = router;
