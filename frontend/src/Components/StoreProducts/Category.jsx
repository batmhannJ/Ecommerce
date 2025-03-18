import React from "react";
import { useLocation } from "react-router-dom";
import "./Category.css";

const CategoryHeader = () => {
  // Get the shop data from the location state
  const location = useLocation();
  const shop = location.state;

  // Default values in case shop data is incomplete
  const {
    id,
    image = "",
    shopName = "",
    businessLocation = "",
    idPicture = "",
    categories = [],
    minOrder = 0,
    rating = 0,
    reviewCount = 0,
    freeDeliveryMinimum = 0
  } = shop || {};

  return (
    <div className="shop-header">
      <div className="shop-header-content">
        <div className="shop-header-image">
          <img src={image} alt={shopName} />
        </div>
        <div className="shop-header-info">
          <div className="shop-categories">
            {categories.map((category, index) => (
              <React.Fragment key={index}>
                <span className="category-tag">{category}</span>
                {index < categories.length - 1 && <span className="category-separator">•</span>}
              </React.Fragment>
            ))}
          </div>
          
          <h1 className="shop-title">{shopName} — {businessLocation}</h1>
          
          <div className="shop-header-details">
            {freeDeliveryMinimum > 0 && (
              <div className="delivery-info">
                <span className="free-delivery">Free delivery for first order ₱{freeDeliveryMinimum}</span>
                <span className="detail-separator">•</span>
              </div>
            )}
            
            <div className="min-order">
              <span>Min. order ₱{minOrder}</span>
            </div>
          </div>
          
          <div className="shop-ratings">
            <div className="star-rating">
              <span className="star-icon">★</span>
              <span className="rating-value">{rating}/5</span>
              <span className="review-count">({reviewCount}+)</span>
            </div>
            <button className="reviews-button">See reviews</button>
            <button className="info-button">
              <span className="info-icon">ⓘ</span>
              More info
            </button>
          </div>
          
          {/* ID Picture can be used here if needed */}
          {idPicture && (
            <div className="seller-id-section">
              <img src={idPicture} alt="Seller ID" className="seller-id-image" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryHeader;