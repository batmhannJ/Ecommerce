import React from "react";
import "./Offers.css";
import offer_image from "../Assets/offer_image.png";

const Offers = () => {
  const scrollTo = () => {
    const element = document.getElementById("new-collections");
    if (element) {
      window.scrollTo({
        top: element.offsetTop,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="offers">
      <img onClick={scrollTo} src={offer_image} alt="Offer" />
    </div>
  );
};

export default Offers;
