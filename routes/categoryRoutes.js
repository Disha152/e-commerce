const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");



// Subcategory-specific
router.get('/subcategory/:subcategoryId', categoryController.getSubcategoryById);
router.get("/subcategories/all", categoryController.getAllSubcategories);

// Subcategory of a category
router.get("/:id/subcategories", categoryController.getSubcategoriesOfCategory);
router.post("/:id/subcategories", categoryController.addSubcategory);
router.put("/:id/subcategories", categoryController.updateSubcategory);
router.delete("/:id/subcategories/:subcategoryId", categoryController.deleteSubcategory);

// Category CRUD
router.post("/", categoryController.createCategory);
router.get("/", categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);
router.put("/:id", categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;
