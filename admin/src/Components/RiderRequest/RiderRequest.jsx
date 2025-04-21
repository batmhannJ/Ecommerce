import React, { useState, useEffect } from "react";
import axios from "axios";
import SellerSearchBar from "../SearchBar/SellerSearchBar";
import { toast } from "react-toastify";
import "./RiderRequest.css";
import ImageModal from "../ImageModal/ImageModal";

function RiderRequest() {
  const [rider, setRiders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState(null);
  const [originalRiders, setOriginalRiders] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);

  const adminToken = localStorage.getItem("admin_token");

  useEffect(() => {
    if (!adminToken) {
      toast.error("Admin not authenticated. Please log in.");
      return;
    }
    fetchPendingRiders();
  }, [adminToken]);

  const fetchPendingRiders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:4000/api/rider/pending",
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );
      const fetchedRiders = Array.isArray(response.data) ? response.data : [];
      setRiders(fetchedRiders);
      setOriginalRiders(fetchedRiders);
    } catch (error) {
      console.error("Error fetching pending riders:", error);
      setError("Failed to fetch pending riders.");
      toast.error("Failed to fetch pending riders.");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRider = async (id) => {
    if (!window.confirm("Are you sure you want to approve this rider?")) return;

    setApproving(true);
    try {
      const response = await axios.patch(
        `http://localhost:4000/api/rider/${id}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      if (response.data.success) {
        toast.success(`Rider ${response.data.rider.name} approved successfully.`);
        setRiders(rider.filter((r) => r._id !== id));
        setOriginalRiders(originalRiders.filter((r) => r._id !== id));
      } else {
        toast.error("Failed to approve rider.");
      }
    } catch (error) {
      console.error("Error approving rider:", error);
      toast.error("Error approving rider.");
    } finally {
      setApproving(false);
    }
  };

  const handleDeleteRider = async (id) => {
    if (!window.confirm("Are you sure you want to delete this rider?")) return;

    try {
      const response = await axios.delete(
        `http://localhost:4000/api/rider/${id}`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Rider deleted successfully.");
        fetchPendingRiders();
      } else {
        toast.error("Failed to delete rider.");
      }
    } catch (error) {
      console.error("Error deleting rider:", error);
      toast.error("Error deleting rider.");
    }
  };

  const handleSearch = (filteredRiders) => {
    setRiders(filteredRiders);
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedImage(null);
  };

  const toggleCard = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  return (
    <div className="rider-request-container">
      <h1>Manage Rider Requests</h1>
      <div className="search-bar-container">
        <SellerSearchBar sellers={originalRiders} onSearch={handleSearch} />
      </div>

        <div className="rider-card-grid">
          {rider.map((r, index) => (
            <div
              key={r._id}
              className={`rider-card ${expandedCard === r._id ? "expanded" : ""}`}
            >
              <div className="card-header">
                <span className="card-number">{index + 1}</span>
                <h3>{r.name}</h3>
                <button
                  className="toggle-button"
                  onClick={() => toggleCard(r._id)}
                >
                  {expandedCard === r._id ? "Hide Details" : "Show Details"}
                </button>
              </div>
              <div className="card-content">
                <div className="card-info">
                  <p>
                    <strong>Email:</strong> {r.email}
                  </p>
                  {expandedCard === r._id && (
                    <>
                      <p>
                        <strong>Address:</strong> {r.address}
                      </p>
                      <p>
                        <strong>Plate Number:</strong> {r.plateNumber}
                      </p>
                      <p>
                        <strong>Vehicle Type:</strong> {r.vehicleType}
                      </p>
                    </>
                  )}
                </div>
                <div className="card-images">
                  <div className="image-wrapper">
                    <img
                      src={`http://localhost:4000/upload/images/${r.idPicture}`}
                      alt="ID Picture"
                      className="rider-image"
                      onClick={() =>
                        handleImageClick(
                          `http://localhost:4000/upload/images/${r.idPicture}`
                        )
                      }
                    />
                    <span className="image-label">ID Picture</span>
                  </div>
                  <div className="image-wrapper">
                    <img
                      src={`http://localhost:4000/upload/images/${r.vehicleRegistration}`}
                      alt="Vehicle Registration"
                      className="rider-image"
                      onClick={() =>
                        handleImageClick(
                          `http://localhost:4000/upload/images/${r.vehicleRegistration}`
                        )
                      }
                    />
                    <span className="image-label">Vehicle Registration</span>
                  </div>
                </div>
              </div>
              <div className="card-actions">
                <button
                  className="action-button approve"
                  onClick={() => handleApproveRider(r._id)}
                  disabled={approving}
                >
                  Accept
                </button>
                <button
                  className="action-button reject"
                  onClick={() => handleDeleteRider(r._id)}
                 >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
    

      {modalOpen && (
        <ImageModal imageUrl={selectedImage} onClose={closeModal} />
      )}
    </div>
  );
}

export default RiderRequest;