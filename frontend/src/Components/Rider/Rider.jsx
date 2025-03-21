import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Rider.css';
import rider from "../Assets/rider.mp4";


const RiderV2 = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('benefits');

  const handleJoinTeamClick = () => {
    navigate('/login-signup');
  };

  return (
    <div className="rider-page">
      {/* Header Banner */}
      <div className="rider-header">
      <video className="background-video" autoPlay loop muted playsInline quality="high">
          <source src={rider} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="rider-header-content">
          <h1>Join the <span className="accent-text">BizGo</span> DELIVERY RIDERS</h1>
          <div className="rider-header-buttons">
            <button className="primary-button" onClick={handleJoinTeamClick}>
              Apply Now
            </button>
            <button className="secondary-button" onClick={() => document.getElementById('info-section').scrollIntoView({ behavior: 'smooth' })}>
              Learn More
            </button>
          </div>
        </div>
      </div>

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
                <span className="stat-number">1,000+</span>
                <span className="stat-label">Active Riders</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">15K+</span>
                <span className="stat-label">Daily Deliveries</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">95%</span>
                <span className="stat-label">Rider Satisfaction</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Information Tabs Section */}
      <div id="info-section" className="rider-info-section">
        <div className="rider-info-tabs">
          <button 
            className={`tab-button ${activeTab === 'benefits' ? 'active' : ''}`}
            onClick={() => setActiveTab('benefits')}
          >
            Benefits
          </button>
          <button 
            className={`tab-button ${activeTab === 'requirements' ? 'active' : ''}`}
            onClick={() => setActiveTab('requirements')}
          >
            Requirements
          </button>
          
        </div>
        
        <div className="rider-info-content">
          {activeTab === 'benefits' && (
            <div className="info-content-panel">
              <div className="benefit-grid">
                <div className="benefit-card">
                  <div className="benefit-icon earnings-icon"></div>
                  <h4>Competitive Earnings</h4>
                  <p>Earn per delivery plus tips and bonuses during peak hours</p>
                </div>
                <div className="benefit-card">
                  <div className="benefit-icon schedule-icon"></div>
                  <h4>Flexible Schedule</h4>
                  <p>Choose when you work with our convenient app</p>
                </div>
                <div className="benefit-card">
                  <div className="benefit-icon support-icon"></div>
                  <h4>Rider Support</h4>
                  <p>24/7 support team to help you with any issues</p>
                </div>
                <div className="benefit-card">
                  <div className="benefit-icon growth-icon"></div>
                  <h4>Career Growth</h4>
                  <p>Opportunities for advancement within our company</p>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'requirements' && (
            <div className="info-content-panel">
              <div className="requirements-list">
                <div className="requirement-item">
                  <div className="requirement-icon"></div>
                  <div className="requirement-detail">
                    <h4>Valid ID</h4>
                    <p>Government-issued identification</p>
                  </div>
                </div>
                <div className="requirement-item">
                  <div className="requirement-icon"></div>
                  <div className="requirement-detail">
                    <h4>Vehicle</h4>
                    <p>Motorcycle, bicycle, or car in good condition</p>
                  </div>
                </div>
                <div className="requirement-item">
                  <div className="requirement-icon"></div>
                  <div className="requirement-detail">
                    <h4>Smartphone</h4>
                    <p>Android or iOS device with data plan</p>
                  </div>
                </div>
                <div className="requirement-item">
                  <div className="requirement-icon"></div>
                  <div className="requirement-detail">
                    <h4>Background Check</h4>
                    <p>Clean driving record and background check</p>
                  </div>
                </div>
              </div>
            </div>
          )}
       
        </div>
      </div>

    
    </div>
  );
};

export default RiderV2;