import React from "react";
import "./Hero.css";
import hero_image from "../Assets/hero_image.png";

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
      <img src={hero_image} alt="Banner" onClick={scrollTo} />
    </div>
  );
};

export default Hero;
