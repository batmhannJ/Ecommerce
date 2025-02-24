const productModel = require("../models/productModels");
const mongoose = require("mongoose");

const updateProductStock = async (id, size, quantity) => {
  try {
    console.log(`Received ID: ${id}`);

    // Check if ID is a valid ObjectId
    /*if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid ID format");
    }*/

    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      throw new Error("Invalid ID format");
    }

    // Find the product by MongoDB ObjectId
    //const product = await productModel.findOne({ _id: id }); // MongoDB uses _id

    const product = await productModel.findOne({ id: productId }); // Adjust query based on your schema

    if (!product) {
      throw new Error("Product not found");
    }

    // Update stock based on size
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

    await product.save();
    console.log("Stock updated successfully");
  } catch (error) {
    console.error(`Error updating stock: ${error.message}`);
    throw new Error(`Error updating stock: ${error.message}`);
  }
};

module.exports = { updateProductStock };
