import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Rider.css';

const Rider = () => {
  const navigate = useNavigate();

  const handleJoinTeamClick = () => {
    navigate('/login-signup');
  };

  return (
    <div className="bizgo-hero">
      <div className="bizgo-hero-content">
        <h1>Find the Job You'll Love</h1>
        <h2>Ready to Ride and Earn?</h2>
        <p>
          Hungry for opportunity? There's a spot for you at <span className="highlight">BizGo</span>! 
          Join our team of <span className="highlight">dedicated delivery riders</span> and be part 
          of a growing network that connects people, businesses, and fast deliveries.
        </p>
        <button className="bizgo-cta-button" onClick={handleJoinTeamClick}>
          Join Our Team
        </button>
      </div>
    </div>
  );
};

export default Rider;