import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import "./Category.css";

const CategoryHeader = () => {
  const location = useLocation();
  const shop = location.state;
  const [isFavorite, setIsFavorite] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showMoreInfo, setShowMoreInfo] = useState(false);

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
    freeDeliveryMinimum = 0,
    deliveryTime = "30-45 min",
    isOpen = true,
    openingHours = "09:00 - 21:00",
    verifiedBusiness = true,
    promoCode = "WELCOME20",
    discountPercentage = 20
  } = shop || {};

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const toggleShareModal = () => {
    setIsShareModalOpen(!isShareModalOpen);
  };

  const toggleMoreInfo = () => {
    setShowMoreInfo(!showMoreInfo);
  };

  // Calculate star rating array
  const renderStars = () => {
    return Array(5).fill().map((_, i) => (
      <span key={i} className={`star ${i < Math.round(rating) ? 'filled' : 'empty'}`}>
        {i < Math.round(rating) ? "★" : "☆"}
      </span>
    ));
  };

  return (
    <div className="premium-shop-container">
      {/* Premium badges */}
      <div className="premium-badges">
        {verifiedBusiness && (
          <div className="verified-badge">
            <span className="verified-icon">✓</span> Verified
          </div>
        )}
        {isOpen ? (
          <div className="open-badge">
            <span className="status-icon">●</span> Open Now
          </div>
        ) : (
          <div className="closed-badge">
            <span className="status-icon">●</span> Closed
          </div>
        )}
      </div>

      {/* Main header section */}
      <div className="premium-shop-header">
        <div className="header-main-content">
          {/* Shop logo */}
          <div className="premium-shop-logo">
            <img src={image || "https://via.placeholder.com/100"} alt={shopName} />
          </div>

          {/* Shop information */}
          <div className="premium-shop-info">
            <div className="shop-name-container">
              <h1 className="premium-shop-name">{shopName}</h1>
              {deliveryTime && (
                <div className="delivery-time">
                  <span className="delivery-icon">🕒</span>
                  <span>{deliveryTime}</span>
                </div>
              )}
            </div>

            <div className="shop-location-container">
              <span className="location-icon">📍</span>
              <span className="location-text">{businessLocation}</span>
              <span className="hours-text">• {openingHours}</span>
            </div>

            <div className="premium-shop-metrics">
              <div className="rating-container">
                <div className="rating-stars">
                  {renderStars()}
                </div>
                <span className="rating-number">{rating.toFixed(1)}</span>
                <span className="review-count">({reviewCount}+ reviews)</span>
              </div>
            </div>

            <div className="premium-shop-categories">
              {categories.map((category, index) => (
                <span key={index} className="premium-category">{category}</span>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="premium-shop-actions">
            <button 
              className={`action-icon-button ${isFavorite ? 'favorite-active' : ''}`} 
              onClick={toggleFavorite}
              aria-label="Save to favorites"
            >
              <span className="action-icon">{isFavorite ? "❤️" : "🤍"}</span>
              <span className="action-text">Save</span>
            </button>

            <button 
              className="action-icon-button" 
              onClick={toggleShareModal}
              aria-label="Share this shop"
            >
              <span className="action-icon">↗</span>
              <span className="action-text">Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Shop features */}
      <div className="shop-features">
        <div className="feature-item">
          <div className="feature-icon">🚚</div>
          <div className="feature-details">
            <div className="feature-title">Free Delivery</div>
            <div className="feature-description">On orders over ₱{freeDeliveryMinimum}</div>
          </div>
        </div>

        <div className="feature-item">
          <div className="feature-icon">💰</div>
          <div className="feature-details">
            <div className="feature-title">Minimum Order</div>
            <div className="feature-description">₱{minOrder}</div>
          </div>
        </div>

        <div className="feature-item">
          <div className="feature-icon">⏱️</div>
          <div className="feature-details">
            <div className="feature-title">Delivery Time</div>
            <div className="feature-description">{deliveryTime}</div>
          </div>
        </div>

        <div className="feature-item">
          <div className="feature-icon">🔍</div>
          <div className="feature-details">
            <div className="feature-title">More Info</div>
            <button 
              className="see-more-button" 
              onClick={toggleMoreInfo}
              aria-label="See details"
            >
              See Details {showMoreInfo ? '▲' : '▼'}
            </button>
          </div>
        </div>
      </div>

      {/* More information panel */}
      {showMoreInfo && (
        <div className="more-info-panel">
          <div className="more-info-content">
            <div className="info-section">
              <h3 className="info-title">About this Shop</h3>
              <p className="info-text">
                {shopName} is a verified business located in {businessLocation}. We offer a wide range of products with free delivery on orders over ₱{freeDeliveryMinimum}.
              </p>
            </div>
            <div className="info-section">
              <h3 className="info-title">Payment Methods</h3>
              <div className="payment-methods">
                <span className="payment-method"><span className="payment-icon">💳</span> Credit Card</span>
                <span className="payment-method"><span className="payment-icon">💵</span> Cash on Delivery</span>
                <span className="payment-method"><span className="payment-icon">📱</span> E-wallet</span>
              </div>
            </div>
            <div className="info-section">
              <h3 className="info-title">Business Hours</h3>
              <div className="business-hours">
                <div className="day-hours">
                  <span className="day">Monday - Friday</span>
                  <span className="hours">09:00 - 21:00</span>
                </div>
                <div className="day-hours">
                  <span className="day">Saturday - Sunday</span>
                  <span className="hours">10:00 - 22:00</span>
                </div>
              </div>
            </div>
          </div>
          <button 
            className="close-info-button" 
            onClick={toggleMoreInfo}
            aria-label="Close information panel"
          >
            Close
          </button>
        </div>
      )}

     

      
    </div>
  );
};

export default CategoryHeader;