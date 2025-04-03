import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Rider.css';
import rider from "../Assets/banner.png";

const RiderV2 = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('benefits');

  const handleJoinTeamClick = () => {
    navigate('/login-signup');
  };

  const navigateToRidersPage = () => {
    navigate('/riders');
  };

  return (
    <div className="rider-page">

      {/* Split Content Section */}
      <div className="rider-split-section">
        <div className="rider-image-column">
          <div className="rider-image-container">
            <div className="rider-main-image"></div>
            <div className="rider-accent-image"></div>
          </div>
        </div>
        <div className="rider-content-column">
          <div className="rider-content-wrapper">
            <h2>BIZGO Riders</h2>
            <h3>Flexible Hours • Competitive Pay • Join Today</h3>
            <p>
              Become a part of the fastest-growing delivery network in the city. 
              BizGo riders enjoy the freedom to work on their own schedule while 
              earning competitive pay. Whether you're looking for full-time work 
              or just some extra income on the side, BizGo has opportunities for you.
            </p>
            <div className="rider-stats">
              <div className="stat-item">
                <span className="stat-number">****</span>
                <span className="stat-label">Active Riders</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">****</span>
                <span className="stat-label">Daily Deliveries</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">****</span>
                <span className="stat-label">Rider Satisfaction</span>
              </div>
            </div>
          </div>
        </div>
      </div>

       {/* Top Image Banner with Button - ADDED THIS SECTION */}
       <div className="top-banner-container">
        <div className="banner-image"></div>
        <div className="banner-overlay">
          <button 
            className="banner-button primary-button"
            onClick={navigateToRidersPage}
          >
            Join Our Riders Team
          </button>
        </div>
      </div>
    </div>
  );
};

export default RiderV2;