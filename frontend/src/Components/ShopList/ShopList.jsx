import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ShopList.css";

const ShopList = ({ id, image, shopName, businessLocation, categories, minOrder, rating, reviewCount, freeDeliveryMinimum, idPicture }) => {
  const navigate = useNavigate();

  const handleShopClick = () => {
    navigate(`/store/${id}`, {
      state: {
        id,
        image,
        shopName,
        businessLocation,
        categories,
        minOrder,
        rating,
        reviewCount,
        freeDeliveryMinimum,
        idPicture
      }
    });
  };

  return (
    <div className="shop-card" onClick={handleShopClick}>
      <div className="shop-image-container">
        <div className="shop-image-overlay"></div>
        <img src={image} alt={shopName} className="shop-image" />
      </div>
      <div className="shop-details">
        <h3 className="shop-name">{shopName}</h3>
        <p className="shop-location">{businessLocation}</p>
      </div>
    </div>
  );
};

export default ShopList;