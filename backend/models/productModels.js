const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seller",
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
    default: 0,
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

// Virtual for total stock (used for clothing category)
ProductSchema.virtual("totalStock").get(function () {
  return this.s_stock + this.m_stock + this.l_stock + this.xl_stock;
});

// Middleware to handle stock calculation
ProductSchema.pre("save", function (next) {
  if (this.category === "clothes") {
    // For clothing, calculate stock as the sum of sizes
    this.stock = this.totalStock;
  }
  // For other categories (e.g., gadgets), keep the stock value as provided
  next();
});

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;