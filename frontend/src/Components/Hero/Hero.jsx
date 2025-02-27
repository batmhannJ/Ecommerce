import React from "react";
import "./Hero.css";
import cover from "../Assets/cover.png";

const Hero = () => {
  const scrollTo = () => {
    const element = document.getElementById("popular");
    if (element) {
      window.scrollTo({
        top: element.offsetTop,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="hero">
      <img src={cover} alt="Banner" onClick={scrollTo} />
    </div>
  );
};

export default Hero;
