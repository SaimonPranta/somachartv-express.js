const mongoose = require("mongoose");

const categoryGroupSchema = new mongoose.Schema({
  groupName: {
    type: String,
    required: true, 
    unique: true,
  },
  categories: [
    new mongoose.Schema({
      label: {
        type: String,
        required: true
      },
      route: {
        type: String,
        required: true
      },
    })
  ],
});

const CategoriesGroupCollection = new mongoose.model(
  "categories_group",
  categoryGroupSchema
);

module.exports = CategoriesGroupCollection;
