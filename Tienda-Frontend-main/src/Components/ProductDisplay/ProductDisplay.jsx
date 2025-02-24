import React, { useContext, useEffect, useState } from "react";
import "./ProductDisplay.css";
import { ShopContext } from "../../Context/ShopContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Ensure axios is installed

const ProductDisplay = (props) => {
  const { product } = props;
  const { addToCart } = useContext(ShopContext);
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState("");
  const [adjustedPrice, setAdjustedPrice] = useState(product.new_price);
  const [adjustedOldPrice, setAdjustedPriceOld] = useState(product.old_price);
  const [currentStock, setCurrentStock] = useState(product.stock); // Default to total stock
  const [quantity, setQuantity] = useState(1); // State for quantity
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    // Reset adjustedPrice, stock, and quantity when product changes
    setAdjustedPrice(product.new_price);
    setAdjustedPriceOld(product.old_price);
    setSelectedSize(""); // Optionally reset size
    setCurrentStock(product.stock); // Reset to default total stock
    setQuantity(1); // Reset quantity
  }, [product]);

  const handleSizeChange = async (size) => {
    setSelectedSize(size);

    // Adjust price based on size
    let priceAdjustment = 0;
    if (size === "S") {
      priceAdjustment = 0;
    } else if (size === "M") {
      priceAdjustment = 100;
    } else if (size === "L") {
      priceAdjustment = 200;
    } else if (size === "XL") {
      priceAdjustment = 300;
    }
    setAdjustedPrice(product.new_price + priceAdjustment);

    let priceAdjustmentOld = 0;
    if (size === "S") {
      priceAdjustmentOld = 0;
    } else if (size === "M") {
      priceAdjustmentOld = 100;
    } else if (size === "L") {
      priceAdjustmentOld = 200;
    } else if (size === "XL") {
      priceAdjustmentOld = 300;
    }
    setAdjustedPriceOld(product.old_price + priceAdjustmentOld);

    // Adjust stock based on size selection
    let stockAdjustment = "";
    if (size === "S") {
      stockAdjustment = product.s_stock;
    } else if (size === "M") {
      stockAdjustment = product.m_stock;
    } else if (size === "L") {
      stockAdjustment = product.l_stock;
    } else if (size === "XL") {
      stockAdjustment = product.xl_stock;
    }

    console.log(`Selected Size: ${size}, Stock Available: ${stockAdjustment}`); // Log selected size and stock

    // Ensure stock is updated
    setCurrentStock(stockAdjustment);
  };

  const handleAddToCart = async () => {
    const authToken = localStorage.getItem("auth-token");

    // Log the current state values
    console.log("Current State:", {
      productId: product.id,
      selectedSize: selectedSize,
      adjustedPrice: adjustedPrice,
      quantity: quantity,
      currentStock: currentStock,
    });

    if (authToken) {
      if (!selectedSize) {
        toast.info("Please select a size before adding to cart.", {
          position: "bottom-left",
        });
        return;
      }
      if (quantity > currentStock) {
        toast.error(`Only ${currentStock} items are available in stock.`, {
          position: "top-left",
        });
        return;
      }

      // First, add the product to the cart context
      await addToCart(product.id, selectedSize, adjustedPrice, quantity);
      toast.success("Product added to cart!", {
        position: "top-left",
      });
    } else {
      toast.error("You are not logged in. Please log in to add to cart.", {
        position: "top-left",
      });
      navigate("/login");
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleQuantityChange = (delta) => {
    if (quantity + delta <= 0) {
      toast.info("Quantity cannot be less than 1.", {
        position: "bottom-left",
      });
    } else if (quantity + delta > currentStock) {
      toast.warning(`Only ${currentStock} items are available in stock.`, {
        position: "top-left",
      });
    } else {
      setQuantity(quantity + delta);
    }
  };

  return (
    <div className="productdisplay">
      <div className="productdisplay-left">
        <img
          className="productdisplay-main-img"
          src={product.image}
          alt="Main Image"
        />
        {/* Remove the small images section */}
      </div>
      <div className="productdisplay-right-container">
        <div className="productdisplay-tabs">
          <div
            className={`productdisplay-tab ${
              activeTab === "details" ? "active" : ""
            }`}
            onClick={() => handleTabClick("details")}
          >
            Details
          </div>
          <div
            className={`productdisplay-tab ${
              activeTab === "sizes" ? "active" : ""
            }`}
            onClick={() => handleTabClick("sizes")}
          >
            Sizes
          </div>
        </div>
        <div
          className={`productdisplay-tab-content ${
            activeTab === "details" ? "active" : ""
          }`}
        >
          <h1>{product.name}</h1>
          <h4>{product.description}</h4>
        </div>
        <div
          className={`productdisplay-tab-content ${
            activeTab === "sizes" ? "active" : ""
          }`}
        >
          <div className="productdisplay-right-prices">
            <p>Price:</p>
            <div className="productdisplay-right-price-new">
              ₱{adjustedPrice}
            </div>
          </div>
          <div className="productdisplay-stock">
            <p>No. of Stock: {currentStock ?? 0}</p>
          </div>
          <h2>Select Size</h2>
          <div className="productdisplay-right-sizes">
            {["S", "M", "L", "XL"].map((size) => (
              <div
                key={size}
                onClick={() => handleSizeChange(size)}
                className={`size-option ${
                  selectedSize === size ? "selected" : ""
                }`}
              >
                {size}
              </div>
            ))}
          </div>

          <div className="quantity-controls">
            <p>Quantity: </p>
            <button
              className="quantity-button"
              onClick={() => handleQuantityChange(-1)}
            >
              {" "}
              -{" "}
            </button>
            <span className="quantity-value">{quantity}</span>
            <button
              className="quantity-button"
              onClick={() => handleQuantityChange(1)}
            >
              {" "}
              +{" "}
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={currentStock === 0 || !selectedSize}
            className="productdisplay-button"
          >
            {currentStock === 0 ? "OUT OF STOCK" : "ADD TO CART"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDisplay;
