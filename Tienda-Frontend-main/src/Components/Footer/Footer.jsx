import React from "react";
import "./Footer.css";
import world_icon from "../Assets/world_icon.png";
import facebook_icon from "../Assets/facebook_icon.png";
import twitter_icon from "../Assets/t.png"; // Add Twitter icon
import linkedin_icon from "../Assets/in.png"; // Add LinkedIn icon
import paymaya_logo from "../Assets/maya.jpg";
import visa_logo from "../Assets/visa.jpg";
import mastercard_logo from "../Assets/mc.jpg";
import flash_express_logo from "../Assets/2.png";
import jt_logo from "../Assets/3.png";
import two_go_express_logo from "../Assets/1.png";
import spx_logo from "../Assets/4.png";

const Footer = () => {
  return (
    <div className="footer">
      <div className="footer-sections">
        <div className="footer-column">
          <h3>TIENDA</h3>
          <ul>
            <li>
              Bridging tradition and
            </li>
            <li>
              innovation, empowering
            </li>
            <li>
              indigenous artisans with
            </li>
            <li>
              integrity and community.
            </li>
          </ul>
          </div>
        <div className="footer-column">
          <h3>About</h3>
          <ul>
            <li>
              <a href="about">About Us</a>
            </li>
            <li>
              <a href="Offices">Our Offices</a>
            </li>
            <li>
              <a href="Terms">Terms of Service</a>
            </li>
          </ul>
        </div>
        <div className="footer-column">
          <h3>Payment</h3>
          <div className="footer-payment">
            <img src={paymaya_logo} alt="PayMaya" />
            <img src={visa_logo} alt="Visa" />
            <img src={mastercard_logo} alt="MasterCard" />
          </div>
          <div className="footer-logistics">
            <h3>Logistics</h3>
            <div className="footer-logistics-logos">
              <div className="footer-logistics-item">
                <img src={flash_express_logo} alt="Flash Express" />
                <img src={jt_logo} alt="J&T Express" />
              </div>
              <div className="footer-logistics-item">
                <img src={two_go_express_logo} alt="2GO Express" />
                <img src={spx_logo} alt="SPX" />
              </div>
            </div>
          </div>
        </div>
        <div className="footer-column">
          <h3>Follow Us</h3>
          <div className="footer-social-links">
            <div className="footer-social-link">
              <img src={world_icon} alt="World Icon" />
              <span>World</span>
            </div>
            <div className="footer-social-link">
              <img src={facebook_icon} alt="Facebook Icon" />
              <span>Facebook</span>
            </div>
            <div className="footer-social-link">
              <img src={twitter_icon} alt="Twitter Icon" />
              <span>Twitter</span>
            </div>
            <div className="footer-social-link">
              <img src={linkedin_icon} alt="LinkedIn Icon" />
              <span>LinkedIn</span>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-copyright">
        <hr />
        <p>Copyright @ 2024 - All Rights Reserved</p>
      </div>
    </div>
  );
};

export default Footer;
