import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import "./ShopList.css";
import { ShoppingCart } from 'lucide-react';

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
  idPicture 
}) => {
  const [activeCard, setActiveCard] = useState(false);
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

  // Safe rating display
  const safeRating = rating != null ? rating.toFixed(1) : 'N/A';

  // Safe categories display
  const safeCategories = Array.isArray(categories) 
    ? categories.slice(0, 2).join(' • ') 
    : '';

  // Safe minOrder display
  const safeMinOrder = minOrder != null 
    ? minOrder.toLocaleString() 
    : '0';

  return (
    <div 
      className={`shop-card ${activeCard ? 'shop-card-hovered' : ''}`}
      onMouseEnter={() => setActiveCard(true)}
      onMouseLeave={() => setActiveCard(false)}
      onClick={navigateToShop}
    >
      <div className="shop-image-container">
        <img 
          src={image} 
          alt={shopName} 
          className="shop-image" 
        />
        <div className="shop-image-overlay">
          <div className="shop-rating">
            ⭐ {safeRating}
          </div>
          <button 
            className={`favorite-btn ${favoriteStatus ? 'favorite-active' : ''}`}
            onClick={toggleFavorite}
          >
            <Heart 
              fill={favoriteStatus ? '#FF6B6B' : 'transparent'} 
              stroke={favoriteStatus ? '#FF6B6B' : 'white'}
              strokeWidth={2}
            />
          </button>
        </div>
      </div>
      
      <div className="shop-info">
        <div className="shop-header">
          <h3 className="shop-name">{shopName}</h3>
          <span className="shop-categories">
            {safeCategories}
          </span>
        </div>
        
        <div className="shop-details">
          <div className="shop-location">
            🛒 {businessLocation}
          </div>
          <div className="shop-now">
            <ShoppingCart size={14} /> Shop Now
          </div>
        </div>
      </div>

      {activeCard && (
        <div className="shop-hover-info">
          <div className="hover-content">
            VIEW SHOP 
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopList;