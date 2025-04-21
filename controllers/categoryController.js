// controllers/categoryController.js
const Category = require("../models/Category");

// Create category
exports.createCategory = async (req, res) => {
  try {
    const category = new Category({ name: req.body.name, subcategories: [] });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.deleteSubcategory = async (req, res) => {
    try {
      const { id, subcategoryId } = req.params;
  
      // Delete subcategory
      await Subcategory.findByIdAndDelete(subcategoryId);
  
      // Remove subcategory reference from the category
      await Category.findByIdAndUpdate(id, {
        $pull: { subcategories: subcategoryId }
      });
  
      res.json({ message: "Subcategory deleted and removed from category." });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
// Get category by ID
exports.getCategoryById = async (req, res) => {
    try {
      const category = await Category.findById(req.params.id);
  
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
  
      res.status(200).json(category);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  };



// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    );
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add subcategory
exports.addSubcategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    category.subcategories.push({ name: req.body.name });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Edit subcategory
exports.updateSubcategory = async (req, res) => {
  try {
    const { subcategoryId, name } = req.body;
    const category = await Category.findById(req.params.id);
    const sub = category.subcategories.id(subcategoryId);
    sub.name = name;
    await category.save();
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Get subcategory by ID
exports.getSubcategoryById = async (req, res) => {
    try {
      const { subcategoryId } = req.params;
  
      // Search for the category that contains this subcategory
      const category = await Category.findOne({
        'subcategories._id': subcategoryId,
      });
  
      if (!category) {
        return res.status(404).json({ message: 'Subcategory not found' });
      }
  
      const subcategory = category.subcategories.id(subcategoryId);
  
      if (!subcategory) {
        return res.status(404).json({ message: 'Subcategory not found' });
      }
  
      res.status(200).json(subcategory);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  };

// Delete subcategory
exports.deleteSubcategory = async (req, res) => {
  try {
    const { subcategoryId } = req.params;
    const category = await Category.findById(req.params.id);
    category.subcategories = category.subcategories.filter(
      (sub) => sub._id.toString() !== subcategoryId
    );
    await category.save();
    res.json({ message: "Subcategory deleted", category });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Get all subcategories from all categories
exports.getAllSubcategories = async (req, res) => {
    try {
      const categories = await Category.find();
      const allSubcategories = categories.flatMap((cat) =>
        cat.subcategories.map((sub) => ({
          categoryId: cat._id,
          categoryName: cat.name,
          subcategoryId: sub._id,
          subcategoryName: sub.name,
        }))
      );
      res.json(allSubcategories);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  
  // Get all subcategories of a specific category
  exports.getSubcategoriesOfCategory = async (req, res) => {
    try {
      const category = await Category.findById(req.params.id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category.subcategories);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  