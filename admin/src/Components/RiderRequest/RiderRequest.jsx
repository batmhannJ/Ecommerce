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
    if (!window.confirm("Are you sure you want to approve this rider?"))
      return;

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
        toast.success(
          `Rider ${response.data.rider.name} approved successfully.`
        );
        setRiders(rider.filter((r) => r._id !== id));
        setOriginalRiders(
          originalRiders.filter((r) => r._id !== id)
        );
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
  };

  return (
    <div className="seller-management-container">
      <h1>Manage Rider Requests</h1>
      <SellerSearchBar sellers={originalRiders} onSearch={handleSearch} />
      
      {loading ? (
        <p>Loading pending riders...</p>
      ) : rider.length === 0 ? (
        <p>No pending rider requests.</p>
      ) : (
        <table className="seller-table">
          <thead>
            <tr>
              <th>No.</th>
              <th>Name</th>
              <th>Email</th>
              <th>Address</th>
              <th>Plate Number</th>
              <th>Vehicle Type</th>
              <th>Id Picture</th>
              <th>Vehicle Registration</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rider.map((r, index) => (
              <tr key={r._id}>
                <td>{index + 1}</td>
                <td>{r.name}</td>
                <td>{r.email}</td>
                <td>{r.address}</td>
                <td>{r.plateNumber}</td>
                <td>{r.vehicleType}</td>
                <td>
                  <img
                    src={`http://localhost:4000/upload/images/${r.idPicture}`}
                    alt="ID Picture"
                    style={{ 
                      width: "100px", 
                      height: "auto",
                      cursor: "pointer",
                      transition: "transform 0.2s ease",
                      transformOrigin: "center center"
                    }}
                    className="zoomable-image"
                    onClick={() =>
                      handleImageClick(
                        `http://localhost:4000/upload/images/${r.idPicture}`
                      )
                    }
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  />
                </td>
                <td>
                  <img
                    src={`http://localhost:4000/upload/images/${r.vehicleRegistration}`}
                    alt="Vehicle Registration"
                    style={{ 
                      width: "100px", 
                      height: "auto",
                      cursor: "pointer",
                      transition: "transform 0.2s ease",
                      transformOrigin: "center center"
                    }}
                    className="zoomable-image"
                    onClick={() =>
                      handleImageClick(
                        `http://localhost:4000/upload/images/${r.vehicleRegistration}`
                      )
                    }
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  />
                </td>
                <td>
                  <button
                    className="action-button approve"
                    onClick={() => handleApproveRider(r._id)}
                    disabled={approving}
                  >
                    Accept
                  </button>
                  <button
                    className="action-button delete"
                    onClick={() => handleDeleteRider(r._id)}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalOpen && (
        <ImageModal
          imageUrl={selectedImage}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

export default RiderRequest;