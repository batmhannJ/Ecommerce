import React from "react";
import { Link } from "react-router-dom";
import "./ShopList.css";

  const ProductCard = ({ id, image, shopName, businessLocation }) => {
    return (
      <div className="product-card">
        <Link to={`/product/${id}`} className="product-image-wrapper">
          <img src={image} alt={shopName} className="product-image" />
        </Link>
        <div className="product-info">
          <p className="product-shop-name">{shopName}</p>
          <p className="product-location">{businessLocation}</p>
        </div>
      </div>
    );
  };
  
  export default ProductCard;
