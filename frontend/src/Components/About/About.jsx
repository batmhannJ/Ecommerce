import React from "react";
import { FaStore, FaMotorcycle, FaHandshake } from "react-icons/fa";
import "./About.css";

const About = () => {
  return (
    <div className="about-container">
      {/* Header Section */}
      <div className="about-header">
        <h1>About Us</h1>
        <p>Connecting small businesses with customers through seamless delivery.</p>
      </div>

      {/* Card Section */}
      <div className="about-cards">
        {/* Business Growth */}
        <div className="about-card">
          <FaStore className="about-icon" />
          <h2>Empowering Small Businesses</h2>
          <p>We give small businesses a platform to thrive and reach new customers.</p>
        </div>

        {/* Delivery Service */}
        <div className="about-card">
          <FaMotorcycle className="about-icon" />
          <h2>Fast & Reliable Delivery</h2>
          <p>Our riders ensure quick and hassle-free deliveries to keep customers satisfied.</p>
        </div>

        {/* Community Connection */}
        <div className="about-card">
          <FaHandshake className="about-icon" />
          <h2>Building a Strong Community</h2>
          <p>We connect businesses, customers, and riders to create a strong support system.</p>
        </div>
      </div>
    </div>
  );
};

export default About;