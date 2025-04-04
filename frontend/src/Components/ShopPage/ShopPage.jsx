import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import "./ShopPage.css";

const ShopsPage = () => {
  const [shops, setShops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const city = queryParams.get("city") || "";
  const municipality = userLocation?.municipality || "";
  const navigate = useNavigate();

  useEffect(() => {
    console.log("ShopsPage mounted, checking localStorage");
    const storedLocation = localStorage.getItem("userLocation");
    console.log("Raw localStorage data:", storedLocation);
  
    if (storedLocation) {
      try {
        const parsed = JSON.parse(storedLocation);
        console.log("Parsed location data:", parsed);
        setUserLocation(parsed);
  
        const municipality = parsed.municipality;
        console.log("Municipality extracted:", municipality);
        
        if (!municipality) {
          console.error("Municipality is missing.");
          setIsLoading(false);
          setError("Location information is incomplete. Please select your location again.");
          return;
        }
  
        console.log("About to fetch shops for:", municipality);
        const fetchShops = async () => {
            const url = `http://localhost:4000/api/page?municipality=${encodeURIComponent(municipality)}`;
            console.log("API request URL:", url);
            
            try {
              console.log("Sending API request...");
              const token = localStorage.getItem('authToken'); // Or wherever you store your auth token
            const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
            });
              console.log("API response received:", response);
              
              setShops(response.data);
            } catch (error) {
              console.error("Error fetching shops:", error);
              console.error("Error details:", error.response ? error.response.data : "No response data");
              setError("Failed to fetch shops. Please try again.");
            } finally {
              setIsLoading(false);
            }
          };
  
        fetchShops();
      } catch (parseError) {
        console.error("Error parsing location data from localStorage:", parseError);
        setIsLoading(false);
        setError("There was a problem with your location data. Please try selecting your location again.");
      }
    } else {
      console.warn("No location found in localStorage, redirecting...");
      setIsLoading(false);
      navigate("/");
    }
  }, [navigate]);
  
  const handleBackToLocation = () => {
    navigate("/");
  };

  return (
    <div className="shops-page">
      <div className="shops-page-header">
        <button className="back-button" onClick={handleBackToLocation}>
          <FaArrowLeft /> Back
        </button>
        <h1>Shops Near You</h1>
      </div>

      {userLocation && (
        <div className="current-location-banner">
          <FaMapMarkerAlt className="location-icon" />
          <div className="location-details">
            <p className="location-address">{userLocation.address}</p>
            <p className="location-municipality">
              Municipality: {userLocation.municipality || municipality}
            </p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Finding shops near you...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p>{error}</p>
          <button className="retry-button" onClick={() => window.location.reload()}>
            Try Again
          </button>
          {error.includes("Not authorized") && (
            <button className="login-button" onClick={() => navigate('/login')}>
              Login
            </button>
          )}
        </div>
      ) : shops.length === 0 ? (
        <div className="no-shops-container">
          <p>No shops found in your area.</p>
          <button className="change-location-button" onClick={handleBackToLocation}>
            Change Location
          </button>
        </div>
      ) : (
        <div className="shops-grid">
            {Array.isArray(shops) && shops.map((shop) => (
            <div className="shop-card" key={shop.id || shop._id}>
              <img src={shop.image || "/placeholder-shop.jpg"} alt={shop.shopName} className="shop-image" />
              <div className="shop-info">
                <h2 className="shop-name">{shop.shopName}</h2>
                <p className="shop-location">{shop.businessLocation}</p>
                <p className="shop-rating">
                  ⭐ {shop.rating || "N/A"} ({shop.reviewCount || 0} reviews)
                </p>
                <p className="shop-min-order">Min Order: ₱{shop.minOrder || "N/A"}</p>
                {shop.freeDeliveryMinimum && (
                  <p className="free-delivery">
                    Free Delivery for orders above ₱{shop.freeDeliveryMinimum}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopsPage;