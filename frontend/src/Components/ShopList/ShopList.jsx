import React from "react";
import { Link } from "react-router-dom";
import "./ShopList.css";

const ShopList = (props) => {
  const handleClick = () => {
    window.scrollTo(0, 0);
  };

  return (
    <div className="item">
      <Link to={`/product/${props.id}`}>
        <img onClick={handleClick} src={props.image} alt="" />
      </Link>
      <p>{props.shopName}</p>
      <div className="item-prices">
        <div className="item-price-new">{props.businessLocation}</div>
      </div>
    </div>
  );
};

export default ShopList;
