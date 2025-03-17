import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Items.css";
import { FaCartPlus } from "react-icons/fa";

const Items = (props) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const handleClick = () => {
    window.scrollTo(0, 0);
  };
  
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Add to cart functionality would go here
    console.log("Added to cart:", props.id);
  };

  return (
    <div 
      className={`items ${props.isNew ? 'new' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${props.id}`} className="items-link" onClick={handleClick}>
        <div className="items-image-container">
          <img 
            src={props.image} 
            alt={props.name} 
            className="items-image"
          />
        </div>
      </Link>
      <button 
        className="add-to-cart" 
        onClick={handleAddToCart}
        aria-label="Add to cart"
      >
        <FaCartPlus />
      </button>
      <div className="items-details">
        <p className="items-name">{props.name}</p>
        <div className="items-price">
          <span className="new-price">₱{props.new_price}</span>
        </div>
      </div>
    </div>
  );
};

export default Items;