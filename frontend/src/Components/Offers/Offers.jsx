import React, { useEffect, useState, useRef } from "react";
import "./Offers.css";

const PartnerStores = () => {
  const carouselRef = useRef(null);
  const [partnerStores, setPartnerStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:4000/partner-stores")
      .then((response) => response.json())
      .then((data) => {
        setPartnerStores(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching partner stores:", error);
        setIsLoading(false);
      });
  }, []);

  const scroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="partner-stores-container">
      <div className="partner-stores-header">
        <div className="title-container">
          <h2 className="partner-stores-title">Featured Partners</h2>
          <span className="title-accent"></span>
        </div>
        <div className="navigation-buttons">
          <button className="nav-button prev-button" onClick={() => scroll('left')} aria-label="Previous partners">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button className="nav-button next-button" onClick={() => scroll('right')} aria-label="Next partners">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="partner-stores-carousel-container">
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading partners...</p>
          </div>
        ) : (
          <div className="partner-stores-carousel" ref={carouselRef}>
            {partnerStores.map((store, index) => (
              <div className="partner-store-card" key={store._id || index}>
                <div className="partner-store-logo-container">
                  <img src={store.idPicture} alt={store.shopName} className="partner-store-logo" loading="lazy" />
                  <span className="store-badge">Partner</span>
                </div>
                <div className="partner-store-info">
                  <h3 className="partner-store-name">{store.shopName}</h3>
                  <div className="delivery-info">
                    <svg className="location-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 21C16 17 20 13.4183 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 13.4183 8 17 12 21Z" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p className="partner-store-location" title={store.businessLocation}>
                      {store.businessLocation || "Location not available"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerStores;