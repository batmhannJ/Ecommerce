import React, { useState, useEffect, useRef } from "react";
import { FaMapMarkerAlt, FaSearch, FaMapMarked, FaTimes } from "react-icons/fa";
import "./About.css";

const LocationSelector = () => {
  const [address, setAddress] = useState("");
  const [isLocationConfirmed, setIsLocationConfirmed] = useState(false);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const mapRef = useRef(null);
  const [currentLocation, setCurrentLocation] = useState({
    lat: 14.5995, // Default to Philippines (Manila)
    lng: 120.9842
  });
  const [isLoading, setIsLoading] = useState(false);

  // Initialize the map when modal is shown
  useEffect(() => {
    if (showModal) {
      if (window.google && window.google.maps) {
        initMap();
      } else {
        // Load Google Maps API script if not already loaded
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCfeMqzu93-w0aWnBTs1TTU62_Od49c9iI&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = initMap;
        document.head.appendChild(script);
      }
    }
  }, [showModal]);

  const initMap = () => {
    if (!mapRef.current) return;

    // Create a new map centered on Philippines
    const newMap = new window.google.maps.Map(mapRef.current, {
      center: { lat: currentLocation.lat, lng: currentLocation.lng },
      zoom: 10,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    });

    // Add a marker at the center position
    const newMarker = new window.google.maps.Marker({
      position: { lat: currentLocation.lat, lng: currentLocation.lng },
      map: newMap,
      draggable: true,
      animation: window.google.maps.Animation.DROP
    });

    // Update address when marker is dragged
    window.google.maps.event.addListener(newMarker, "dragend", function() {
      const position = newMarker.getPosition();
      setCurrentLocation({
        lat: position.lat(),
        lng: position.lng()
      });
      
      // Get address from coordinates (reverse geocoding)
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: position }, (results, status) => {
        if (status === "OK" && results[0]) {
          setAddress(results[0].formatted_address);
        }
      });
    });

    setMap(newMap);
    setMarker(newMarker);
  };

  useEffect(() => {
    // This will handle updating the map when the address changes
    if (map && marker && address) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: address }, (results, status) => {
        if (status === "OK" && results[0]) {
          const location = results[0].geometry.location;
          map.setCenter(location);
          marker.setPosition(location);
          setCurrentLocation({
            lat: location.lat(),
            lng: location.lng()
          });
        }
      });
    }
  }, [address, map, marker]);

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
  };

  const handleFindFood = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLocationConfirmed(true);
      setIsLoading(false);
    }, 1000);
  };

  const openMapModal = () => {
    setShowModal(true);
  };

  const closeMapModal = () => {
    setShowModal(false);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          setCurrentLocation(pos);
          
          // Get address from coordinates
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: pos }, (results, status) => {
            if (status === "OK" && results[0]) {
              setAddress(results[0].formatted_address);
            }
          });

          // Update map and marker if map is visible
          if (map && marker) {
            map.setCenter(pos);
            marker.setPosition(pos);
          }
        },
        () => {
          alert("Error: The Geolocation service failed.");
        }
      );
    } else {
      alert("Error: Your browser doesn't support geolocation.");
    }
  };

  const confirmFromMapModal = () => {
    setShowModal(false);
    // Here you would typically save the address and coordinates to your app state or backend
    console.log("Location confirmed:", {
      address: address,
      coordinates: currentLocation
    });
  };

  return (
    <div className="location-selector-container">
      <div className="address-input-card">
        <div className="address-search-container">
          <input
            type="text"
            placeholder="Enter your address"
            value={address}
            onChange={handleAddressChange}
            className="address-input"
          />
          <div className="icon-container" onClick={openMapModal}>
            <FaMapMarkerAlt className="map-icon" />
          </div>
        </div>
        
        <button 
          className="find-food-button"
          onClick={handleFindFood}
          disabled={!address || isLoading}
        >
          {isLoading ? (
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          ) : (
            "Find food"
          )}
        </button>
      </div>

      {/* Map Modal */}
      {showModal && (
        <div className="map-modal-overlay">
          <div className="map-modal">
            <div className="modal-header">
              <h2>Select Your Location</h2>
              <button className="close-button" onClick={closeMapModal}>
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search for your address in Philippines..."
                value={address}
                onChange={handleAddressChange}
                className="modal-search-input"
              />
              <button 
                className="current-location-btn"
                onClick={getCurrentLocation}
              >
                <FaMapMarkerAlt />
              </button>
            </div>
            
            <p className="instruction-text">
              Move/drag the pin on the map below if the location is incorrect.
            </p>
            
            <div className="modal-map-container">
              <div 
                ref={mapRef} 
                className="google-map" 
                style={{ width: "100%", height: "300px" }}
              ></div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="cancel-button"
                onClick={closeMapModal}
              >
                Cancel
              </button>
              <button 
                className="confirm-location-button"
                onClick={confirmFromMapModal}
                disabled={!address}
              >
                Confirm Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;