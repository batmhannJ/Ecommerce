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
  thumbnail1: {
    type: String,
    default: "",
  },
  thumbnail2: {
    type: String,
    default: "",
  },
  thumbnail3: {
    type: String,
    default: "",
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
  },
  markup_price: {
    type: Number,
  },
  markup_value: { 
    type: Number,
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

// Middleware to handle stock calculation and category-based markup price
ProductSchema.pre("save", function (next) {
  // Calculate markup percentage based on category
  let markupPercentage;
  
  switch(this.category.toLowerCase()) {
    case 'gadget':
    case 'gadgets':
      markupPercentage = 0.01; // 1% for gadgets
      break;
    case 'food':
    case 'foods':
      markupPercentage = 0.10; // 10% for food
      break;
    case 'cloth':
    case 'clothes':
    case 'clothing':
      markupPercentage = 0.02; // 2% for clothes
      break;
    default:
      markupPercentage = 0.05; // Default markup of 5% for other categories
  }
  
  // Calculate markup_price as new_price + (percentage of new_price)
  const markup = this.new_price * markupPercentage;
  this.markup_value = markup;
  this.markup_price = this.new_price + markup;
  
  // Round markup_price to 2 decimal places for currency
  this.markup_price = Math.round(this.markup_price * 100) / 100;
  
  // For clothing, calculate stock as the sum of sizes
  if (this.category.toLowerCase() === "clothes" || 
      this.category.toLowerCase() === "cloth" || 
      this.category.toLowerCase() === "clothing") {
    this.stock = this.totalStock;
  }
  
  next();
});

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;