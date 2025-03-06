const productModel = require("../models/productModels");

const updateProductStock = async (id, size, quantity) => {
  try {
    console.log(`Received ID: ${id}`);

    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      throw new Error("Invalid ID format");
    }

    // Find the product by ID
    const product = await productModel.findOne({ id: productId });

    if (!product) {
      throw new Error("Product not found");
    }

    // Check if the product is in the 'gadgets' or 'food' category
    if (product.category === "gadgets" || product.category === "food") {
      if (product.stock < quantity) throw new Error("Not enough stock");
      product.stock -= quantity; // Direct stock reduction
    } else {
      // Ensure size is valid only for other categories
      switch (size) {
        case "S":
          if (product.s_stock < quantity) throw new Error("Not enough stock");
          product.s_stock -= quantity;
          break;
        case "M":
          if (product.m_stock < quantity) throw new Error("Not enough stock");
          product.m_stock -= quantity;
          break;
        case "L":
          if (product.l_stock < quantity) throw new Error("Not enough stock");
          product.l_stock -= quantity;
          break;
        case "XL":
          if (product.xl_stock < quantity) throw new Error("Not enough stock");
          product.xl_stock -= quantity;
          break;
        default:
          throw new Error("Invalid size");
      }
    }

    await product.save();
    console.log("Stock updated successfully");
  } catch (error) {
    console.error(`Error updating stock: ${error.message}`);
    throw new Error(`Error updating stock: ${error.message}`);
  }
};

module.exports = { updateProductStock };
