import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Star, Clock, Bookmark, ChevronRight } from "lucide-react";
import "./ShopList.css"; // We'll create a new CSS file but keep the same import

const ShopList = ({ 
  id, 
  image, 
  shopName, 
  businessLocation, 
  categories = [], 
  minOrder = 0, 
  rating = 0, 
  reviewCount, 
  freeDeliveryMinimum, 
  idPicture,
  isNew = false,
  promotionText = null,
  estimatedDelivery = "30-45 min"
}) => {
  const [favoriteStatus, setFavoriteStatus] = useState(false);
  const navigate = useNavigate();
  
  const navigateToShop = () => {
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
  
  const toggleFavorite = (e) => {
    e.stopPropagation();
    setFavoriteStatus(!favoriteStatus);
  };
  
  // Format categories for display
  const formattedCategories = Array.isArray(categories) 
    ? categories.slice(0, 2).join(' · ') 
    : '';
    
  return (
    <div className="shop-card" onClick={navigateToShop}>
      {isNew && <div className="new-tag">NEW</div>}
      
      <div className="shop-card-main">
        <div className="shop-image-container">
          <img src={image} alt={shopName} className="shop-image" loading="lazy" />
        </div>
        
        <div className="shop-details">
          <div className="shop-top-row">
            <h3 className="shop-name">{shopName}</h3>
            <button 
              className={`favorite-button ${favoriteStatus ? 'is-favorite' : ''}`}
              onClick={toggleFavorite}
              aria-label={favoriteStatus ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart size={16} />
            </button>
          </div>
          
          {rating > 0 && (
            <div className="shop-rating">
              <Star size={14} className="rating-star" />
              <span className="rating-value">{rating.toFixed(1)}</span>
              {reviewCount && <span className="review-count">({reviewCount})</span>}
            </div>
          )}
          
          {formattedCategories && (
            <div className="shop-categories">{formattedCategories}</div>
          )}
          
          {businessLocation && (
            <div className="shop-location">{businessLocation}</div>
          )}
        </div>
      </div>
      
      <div className="shop-card-footer">
        <div className="delivery-info">
          <Clock size={14} />
          <span>{estimatedDelivery}</span>
        </div>
        
        {promotionText && (
          <div className="promotion-badge">
            {promotionText}
          </div>
        )}
        
        <div className="view-shop-button">
          <span>View Shop</span>
          <ChevronRight size={16} />
        </div>
      </div>
    </div>
  );
};

// Wrapper component with container
const ShopListContainer = ({ shops = [], title = "Popular Shops" }) => {
  return (
    <div className="shop-container">
      <div className="section-header">
        <div className="title-wrapper">
          <Bookmark className="section-icon" size={20} />
          <h2 className="section-title">{title}</h2>
        </div>
        <button className="view-all-button">Explore All</button>
      </div>
      
      <div className="shop-grid">
        {shops.map((shop, index) => (
          <ShopList
            key={shop.id || index}
            {...shop}
            isNew={index === 0 || index === 3} // Example for demonstration
            promotionText={index % 4 === 0 ? "Free Delivery" : null} // Example promotion
          />
        ))}
      </div>
    </div>
  );
};

export default ShopList;