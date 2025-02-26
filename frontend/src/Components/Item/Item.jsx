import React from "react";
import { Link } from "react-router-dom";
import "./Item.css";

const Item = (props) => {
  console.log("Received props in Item:", props); // Check received props

  const handleClick = () => {
    window.scrollTo(0, 0);
  };

  return (
    <div className="item">
      <Link to={`/product/${props.id}`}>
        <img 
          onClick={handleClick} 
          src={props.image} 
          alt={props.name}
        />
      </Link>
      <p>{props.name}</p>
      <div className="item-prices">
        <div className="item-price-new">₱{props.new_price}</div>
      </div>
    </div>
  );
};

export default Item;
