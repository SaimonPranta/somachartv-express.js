const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    htmlDescription: {
      type: String,
      required: true,
    },
    images: [
      new mongoose.Schema({
        src: {
          type: String,
          required: true,
        },
        alt: {
          type: String,
        },
        figcaption: {
          type: String,
        },
      }),
    ],
    category: new mongoose.Schema({
      label: {
        type: String,
        required: true,
      },
      route: {
        type: String,
        required: true,
      },
    }),
    subcategory: new mongoose.Schema({
      label: {
        type: String,
      },
      route: {
        type: String,
      },
    }),
    contentType: {
      type: String,
      required: true,
      enum: ["News", "Blog", "Story"],
      default: "News",
    },
    language: {
      type: String,
      required: true,
      enum: ["English", "Bengali", "Hindi"],
      default: "Bengali",
    },
    viewCount: {
      type: Number,
      required: true,
      default: 0,
    },
    source: new mongoose.Schema({
      title: {
        type: String,
        required: true,
      },
      sourceUrl: {
        type: String,
        required: true,
      },
    }),
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "employ",
    },
    googleIndexInfo: {
      indexed: {
        type: Boolean,
        default: false,
      },
      date: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  }
);

const NewsCollection = new mongoose.model("news", newsSchema);

module.exports = NewsCollection;
