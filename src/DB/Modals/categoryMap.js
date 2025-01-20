const mongoose = require("mongoose");

const categoryMapSchema = new mongoose.Schema({
  mapName: {
    type: String,
    required: true, 
    unique: true,
  },
  mapRoute: {
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

const CategoriesMapCollection = new mongoose.model(
  "categories_map",
  categoryMapSchema
);

module.exports = CategoriesMapCollection;
