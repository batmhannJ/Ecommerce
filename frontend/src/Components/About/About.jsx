<<<<<<< HEAD
import React, { useState, useEffect, useRef } from "react";
=======
import React, { useState, useEffect, useRef} from "react";
import { useNavigate } from "react-router-dom";
>>>>>>> 155078301a5bb4636f3d0cb5093178a839b94d0a
import { FaMapMarkerAlt, FaSearch, FaTimes } from "react-icons/fa";
import "./About.css";

const LocationSelector = () => {
  const [address, setAddress] = useState("");
<<<<<<< HEAD
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
=======
>>>>>>> 155078301a5bb4636f3d0cb5093178a839b94d0a
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const mapRef = useRef(null);
  const [currentLocation, setCurrentLocation] = useState({
    lat: 14.5995, // Default to Philippines (Manila)
    lng: 120.9842
  });
<<<<<<< HEAD
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
=======
  const [municipality, setMunicipality] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState("");
>>>>>>> 155078301a5bb4636f3d0cb5093178a839b94d0a

  // Check if Google Maps API is already loaded on component mount
  useEffect(() => {
    if (window.google && window.google.maps) {
      setGoogleMapsLoaded(true);
    } else {
      // Load the Google Maps API early
      loadGoogleMapsApi();
    }
  }, []);

<<<<<<< HEAD
  // Load Google Maps API function
  const loadGoogleMapsApi = () => {
    if (document.getElementById('google-maps-script')) return;
    
    const script = document.createElement("script");
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCfeMqzu93-w0aWnBTs1TTU62_Od49c9iI&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setGoogleMapsLoaded(true);
    };
    document.head.appendChild(script);
  };

  // Initialize map once Google Maps is loaded and modal is open
=======
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
          extractMunicipality(results[0]);
        }
      });
    });

    setMap(newMap);
    setMarker(newMarker);
  };

  // Extract municipality from geocoding results
  const extractMunicipality = (result) => {
    if (!result) return;
    
    console.log("Geocoding Result:", result); // Debugging line
  
    const addressComponents = result.address_components;
    let city = "";
    
    for (let component of addressComponents) {
      // Look for locality (city) or administrative_area_level_2 (municipality)
      if (component.types.includes("locality") || 
          component.types.includes("administrative_area_level_2")) {
        city = component.long_name;
        break;
      }
    }
    
    console.log("Extracted Municipality:", city); // Debugging line
    setMunicipality(city);
  };
  

>>>>>>> 155078301a5bb4636f3d0cb5093178a839b94d0a
  useEffect(() => {
    if (showModal && googleMapsLoaded && mapRef.current) {
      initMap();
    }
  }, [showModal, googleMapsLoaded]);

  // Update map when address changes
  useEffect(() => {
    if (map && marker && address && googleMapsLoaded) {
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
          extractMunicipality(results[0]);
        }
      });
    }
  }, [address, map, marker, googleMapsLoaded]);

  const initMap = () => {
    if (!mapRef.current || !window.google || !window.google.maps) return;

    try {
      // Create a new map centered on Philippines
      const newMap = new window.google.maps.Map(mapRef.current, {
        center: { lat: currentLocation.lat, lng: currentLocation.lng },
        zoom: 15,
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

      // Initialize places autocomplete for the search input (in modal)
      const input = document.getElementById("modal-address-input");
      if (input) {
        const autocomplete = new window.google.maps.places.Autocomplete(input, {
          componentRestrictions: { country: "ph" } // Restrict to Philippines
        });
        
        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (!place.geometry) return;
          
          // Update map and marker position
          newMap.setCenter(place.geometry.location);
          newMarker.setPosition(place.geometry.location);
          
          setCurrentLocation({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          });
          
          setAddress(place.formatted_address);
        });
      }

      setMap(newMap);
      setMarker(newMarker);
    } catch (error) {
      console.error("Error initializing map:", error);
    }
  };

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
  };

  const handleFindFood = () => {
<<<<<<< HEAD
    if (!address) return;
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setShowModal(true);
      setIsLoading(false);
    }, 500);
=======
    if (!municipality) {
      alert("Please select a valid city or municipality.");
      return;
    }
    
    // Create a complete location object
    const locationData = {
      address: address,
      municipality: municipality,
      coordinates: currentLocation
    };
    
    // Save to localStorage
    localStorage.setItem("userLocation", JSON.stringify(locationData));
    console.log("Saved to localStorage:", JSON.parse(localStorage.getItem("userLocation")));

    // Navigate to shops page
    navigate(`/shoppage?city=${encodeURIComponent(municipality)}`);
>>>>>>> 155078301a5bb4636f3d0cb5093178a839b94d0a
  };
  

  const openLocationDialog = () => {
    setShowPermissionDialog(true);
  };

  // Modified function to properly handle address resolution
  const requestGeolocation = (option) => {
    setShowPermissionDialog(false);
    
    if (option === "never") {
      return;
    }
    
    if (navigator.geolocation) {
      // Show loading state while retrieving location
      setIsLoading(true);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          setCurrentLocation(pos);
          
<<<<<<< HEAD
          // Load Google Maps API if not already loaded
          if (!googleMapsLoaded) {
            loadGoogleMapsApi();
            // Set temporary coordinates while waiting for API to load
            setAddress(`Retrieving address...`);
            
            // Check every 500ms if Google Maps has loaded
            const checkGoogleMapsInterval = setInterval(() => {
              if (window.google && window.google.maps) {
                clearInterval(checkGoogleMapsInterval);
                reverseGeocode(pos);
              }
            }, 500);
            
            // Set timeout to prevent infinite checking
            setTimeout(() => {
              clearInterval(checkGoogleMapsInterval);
              if (!googleMapsLoaded) {
                setAddress(`${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}`);
                setIsLoading(false);
              }
            }, 10000);
          } else {
            // Google Maps already loaded, perform reverse geocoding
            reverseGeocode(pos);
          }
=======
          // Get address from coordinates
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: pos }, (results, status) => {
            if (status === "OK" && results[0]) {
              setAddress(results[0].formatted_address);
              extractMunicipality(results[0]);
            }
          });
>>>>>>> 155078301a5bb4636f3d0cb5093178a839b94d0a

          // Option to remember user preference
          if (option === "always") {
            // In a real app, you might set this in localStorage
            console.log("User allowed location access permanently");
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert("Error: Unable to retrieve your location.");
          setIsLoading(false);
        }
      );
    } else {
      alert("Error: Your browser doesn't support geolocation.");
    }
  };
  
  // Separate function for reverse geocoding
  const reverseGeocode = (position) => {
    const geocoder = new window.google.maps.Geocoder();
    
    geocoder.geocode({ location: position }, (results, status) => {
      setIsLoading(false);
      if (status === "OK" && results[0]) {
        setAddress(results[0].formatted_address);
      } else {
        setAddress(`${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`);
        console.error("Geocoder failed due to: " + status);
      }
    });
  };

  const closeMapModal = () => {
    setShowModal(false);
  };

  const confirmLocation = () => {
    setShowModal(false);
    
    // Create a complete location object
    const locationData = {
      address: address,
      municipality: municipality,
      coordinates: currentLocation
<<<<<<< HEAD
    });
    // Navigate to next page or perform action
=======
    };
    
    // Save to localStorage
    localStorage.setItem("userLocation", JSON.stringify(locationData));
    
    // Set the user location for display
    setUserLocation(address);
    
    console.log("Location confirmed:", locationData);
>>>>>>> 155078301a5bb4636f3d0cb5093178a839b94d0a
  };

  // Initialize Places Autocomplete on main search input
  useEffect(() => {
    if (googleMapsLoaded && !showModal) {
      const mainInput = document.getElementById("main-address-input");
      if (mainInput) {
        try {
          const autocomplete = new window.google.maps.places.Autocomplete(mainInput, {
            componentRestrictions: { country: "ph" } // Restrict to Philippines
          });
          
          autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (!place.geometry) return;
            
            setCurrentLocation({
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            });
            
            setAddress(place.formatted_address);
          });
        } catch (error) {
          console.error("Error initializing autocomplete:", error);
        }
      }
    }
  }, [googleMapsLoaded, showModal]);

  return (
    <div className="food-delivery-container">
      <div className="hero-section">
        <h1>It's the food and groceries you love, delivered</h1>
        
        <div className="address-input-card">
          <div className="address-search-container">
            <input
              id="main-address-input"
              type="text"
              placeholder="Enter your address"
              value={address}
              onChange={handleAddressChange}
              className="address-input"
            />
            <div className="location-icon-container" onClick={openLocationDialog}>
              <FaMapMarkerAlt className="location-icon" />
            </div>
          </div>
          
          <button 
            className={`find-food-button ${!address ? 'disabled' : ''}`}
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
      </div>

      {/* Permission Dialog */}
      {showPermissionDialog && (
        <div className="permission-dialog-overlay">
          <div className="permission-dialog">
            <div className="permission-header">
              <h3>www.Bizgo.ph wants to</h3>
              <button className="close-button" onClick={() => setShowPermissionDialog(false)}>
                ×
              </button>
            </div>
            
            <div className="permission-content">
              <div className="location-icon-wrapper">
                <FaMapMarkerAlt className="location-permission-icon" />
              </div>
              <p>Know your location</p>
            </div>
            
            <div className="permission-actions">
              <button 
                className="permission-option"
                onClick={() => requestGeolocation("always")}
              >
                Allow while visiting the site
              </button>
              
              <button 
                className="permission-option"
                onClick={() => requestGeolocation("once")}
              >
                Allow this time
              </button>
              
              <button 
                className="permission-option"
                onClick={() => requestGeolocation("never")}
              >
                Never allow
              </button>
            </div>
          </div>
        </div>
<<<<<<< HEAD
      )}
=======
        
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
            "Find Shop"
          )}
        </button>
      </div>
>>>>>>> 155078301a5bb4636f3d0cb5093178a839b94d0a

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
                id="modal-address-input"
                type="text"
                placeholder="Search for your address in Philippines..."
                value={address}
                onChange={handleAddressChange}
                className="modal-search-input"
              />
              <button 
                className="current-location-btn"
                onClick={() => requestGeolocation("once")}
              >
                <FaMapMarkerAlt />
              </button>
            </div>
            
            <p className="instruction-text">
              Move/drag the pin on the map below if the location is incorrect.
            </p>
            
            <div className="modal-map-container">
              {!googleMapsLoaded ? (
                <div className="map-loading">Loading map...</div>
              ) : (
                <div 
                  ref={mapRef} 
                  className="google-map" 
                ></div>
              )}
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
                onClick={confirmLocation}
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