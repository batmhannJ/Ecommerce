import React from "react";
import { useNavigate } from "react-router-dom";
import "./Breadcrum.css";
import arrow_icon from "../Assets/breadcrum_arrow.png";

const Breadcrum = (props) => {
  const { product } = props;
  const navigate = useNavigate();

  if (!product) return null;

  return (
    <div className="breadcrum">
      <div className="cursor">
        <span onClick={() => navigate("/")}>HOME</span>
      </div>
      <img src={arrow_icon} alt="" />
      <div className="cursor">
        <span onClick={() => navigate(`/${product.category}`)}>
          {product.category}
        </span>
      </div>
      <img src={arrow_icon} alt="" />
      <span>{product.name}</span>
    </div>
  );
};

export default Breadcrum;
