import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "./Item.css";

const Item = (props) => {
  useEffect(() => {
    console.log("Item component props:", props);
    console.log("Image prop type:", typeof props.image);
    console.log("Image prop value:", props.image);
    console.log("Shop name:", props.shopName);
  }, [props]);

  const handleClick = () => {
    window.scrollTo(0, 0);
  };

  return (
    <div className="item">
      <Link to={`/product/${props.id}`} onClick={handleClick}>
        <div className="item_img">
          {/* Image with error handling */}
          {props.image ? (
            <img 
            src={props.image}
            alt={props.name} 
              onError={(e) => {
                console.error("Image failed to load:", props.image);
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/150?text=No+Image";
              }}
              style={{maxWidth: '100%'}}
            />
          ) : (
            <div className="placeholder-image">No Image Available</div>
          )}
        </div>
        <div className="item_content">
          <p className="item_name">{props.name}</p>
          <div className="item_rating">
            <span className="stars">★★★★☆</span>
            <span className="reviews">(24)</span>
          </div>
          <div className="item_prices">
            <div className="item_price_new">₱{props.new_price}</div>
            {props.old_price && (
              <div className="item_price_old">₱{props.old_price}</div>
            )}
          </div>
          <div className="item_discount">
            {props.old_price && (
              <span className="discount_badge">
                {Math.round(((props.old_price - props.new_price) / props.old_price) * 100)}% OFF
              </span>
            )}
          </div>
          <div className="item_shipping">
            <span className="shop-name">{props.shopName || "Shop Name"}</span>
          </div> 
        </div>
      </Link>
    </div>
  );
};

export default Item;