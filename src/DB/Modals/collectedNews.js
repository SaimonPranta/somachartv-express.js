const mongoose = require("mongoose");

const collectedNewsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  htmlDescription: {
    type: String,
    required: true
  },
  images: [new mongoose.Schema({
    src: {
      type: String,
      required: true
    },
    alt: {
      type: String
    },
    figcaption: {
      type: String
    },
  })],
  category: {
    type: String,
    required: true
  },
  subcategory: {
    type: String,
  },
  sourceUrl: {
    type: String,
    required: true
  },
  failedProcessCount: {
    type: Number,
    required: true,
    default: 0
  },
}, {
  timestamps: true
});

const CollectedNewsCollection = new mongoose.model(
  "collected_news",
  collectedNewsSchema
);

module.exports = CollectedNewsCollection;
