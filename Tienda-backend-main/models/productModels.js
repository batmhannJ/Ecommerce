const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  category: {
    type: String,
    required: true,
  },
  new_price: {
    type: Number,
    required: true,
  },
  old_price: {
    type: Number,
    required: true,
  },
  s_stock: {
    type: Number,
    default: 0, // Provide a default value
  },
  m_stock: {
    type: Number,
    default: 0,
  },
  l_stock: {
    type: Number,
    default: 0,
  },
  xl_stock: {
    type: Number,
    default: 0,
  },
  stock: {
    type: Number,
    default: 0,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  available: {
    type: Boolean,
    default: true,
  },
  tags: {
    type: [{ type: String }],
    validate: [(val) => val.length <= 5, "{PATH} exceeds the limit of 5 tags"],
  },
});

ProductSchema.virtual("totalStock").get(function () {
  return this.s_stock + this.m_stock + this.l_stock + this.xl_stock;
});

ProductSchema.pre("save", function (next) {
  this.stock = this.totalStock;
  next();
});

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
