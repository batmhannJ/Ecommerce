import React from "react";
import "./About.css";

const About = () => {
  return (
    <div className="about-container">
      <h1>Read our inspiring story</h1>

      <div className="about-sections">
        <section className="about-section">
          <h2>Tradition and Innovation</h2>
          <p>
            Tienda is a global online marketplace where Indigenous people come
            together to make, sell, and buy unique and authentic items. Our
            mission is to preserve and promote Indigenous culture through their
            products while fostering a community of support and positive change
            for small businesses, artisans, and the environment. Here’s how
            we’re making a difference together:
          </p>
        </section>

        <section className="about-section">
          <h2>Indigenous Empowerment</h2>
          <p>
            At Tienda, there are no warehouses – just a diverse community of
            people sharing their heritage through the products they love. We
            simplify the process, helping you connect directly with Indigenous
            makers to find something truly extraordinary and meaningful.
          </p>
        </section>

        <section className="about-section">
          <h2>Trust and integrity</h2>
          <p>
            Your privacy and security are our top priorities. Our dedicated team
            ensures your information is protected. If you ever need assistance,
            we are always ready to support you.
          </p>
        </section>
      </div>
    </div>
  );
};

export default About;
