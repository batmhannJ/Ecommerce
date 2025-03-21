import React, { useState } from "react";
import { FaMapMarkerAlt, FaSearch, FaMapMarked } from "react-icons/fa";
import "./About.css";

const LocationSelector = () => {
  const [address, setAddress] = useState("");
  const [isLocationConfirmed, setIsLocationConfirmed] = useState(false);

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
  };

  const handleConfirmLocation = () => {
    setIsLocationConfirmed(true);
    // Here you would typically save the address to your app state or backend
    console.log("Location confirmed:", address);
  };

  return (
    <div className="location-container">
      <div className="location-card">
        <div className="location-header">
          <FaMapMarked className="location-icon" />
          <h1>Enter Location</h1>
          <p>Enter your delivery address to find stores nearest you.</p>
        </div>

        <div className="search-container">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search for your address here..."
              value={address}
              onChange={handleAddressChange}
              className="search-input"
            />
            <button className="current-location-btn">
              <FaMapMarkerAlt />
            </button>
          </div>
          <p className="instruction-text">
            Move/drag the map below if the pinned location is incorrect.
          </p>
        </div>

        <div className="map-container">
          {/* Map component would go here - you'll need to integrate with a mapping API */}
          <div className="map-placeholder">
            <p>Map Integration</p>
            <p>Connect with Google Maps, Mapbox, or other mapping services</p>
          </div>
        </div>

        <button 
          className={`confirm-button ${!address ? 'disabled' : ''}`}
          onClick={handleConfirmLocation}
          disabled={!address}
        >
          Confirm Location
        </button>

        {isLocationConfirmed && (
          <div className="confirmation-message">
            <p>Your location has been confirmed! Stores near you will be displayed soon.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationSelector;