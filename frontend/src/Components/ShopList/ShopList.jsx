import React from "react";
import { Link } from "react-router-dom";
import "./ShopList.css";

const ShopList = ({ id, image, shopName, businessLocation }) => {
  return (
    <div className="shop-card">
      <Link to={`/store/${id}`} className="shop-image-container">
        <div className="shop-image-overlay"></div>
        <img src={image} alt={shopName} className="shop-image" />
      </Link>
      <div className="shop-details">
        <h3 className="shop-name">{shopName}</h3>
        <p className="shop-location">{businessLocation}</p>
      </div>
    </div>
  );
};

export default ShopList;