import React, { useState, useEffect } from "react";
import axios from "axios";
import SellerSearchBar from "../SearchBar/SellerSearchBar";
import { toast } from "react-toastify";
import "./SellerRequest.css";
import ImageModal from "../ImageModal/ImageModal"; // Re-added for image enlargement

function SellerRequest() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState(null);
  const [originalSellers, setOriginalSellers] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null); // For modal
  const [modalOpen, setModalOpen] = useState(false); // For modal
  const [expandedCard, setExpandedCard] = useState(null); // For card toggle

  const adminToken = localStorage.getItem("admin_token");

  useEffect(() => {
    if (!adminToken) {
      toast.error("Admin not authenticated. Please log in.");
      return;
    }
    fetchPendingSellers();
  }, [adminToken]);

  const fetchPendingSellers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:4000/api/seller/pending",
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );
      const fetchedSellers = Array.isArray(response.data) ? response.data : [];
      setSellers(fetchedSellers);
      setOriginalSellers(fetchedSellers);
    } catch (error) {
      console.error("Error fetching pending sellers:", error);
      setError("Failed to fetch pending sellers.");
      toast.error("Failed to fetch pending sellers.");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSeller = async (id) => {
    if (!window.confirm("Are you sure you want to approve this seller?")) return;

    setApproving(true);
    try {
      const response = await axios.patch(
        `http://localhost:4000/api/seller/${id}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      if (response.data.success) {
        toast.success(
          `Seller ${response.data.seller.name} approved successfully.`
        );
        setSellers(sellers.filter((seller) => seller._id !== id));
        setOriginalSellers(
          originalSellers.filter((seller) => seller._id !== id)
        );
      } else {
        toast.error("Failed to approve seller.");
      }
    } catch (error) {
      console.error("Error approving seller:", error);
      toast.error("Error approving seller.");
    } finally {
      setApproving(false);
    }
  };

  const handleDeleteSeller = async (id) => {
    if (!window.confirm("Are you sure you want to delete this seller?")) return;

    try {
      const response = await axios.delete(
        `http://localhost:4000/api/seller/${id}`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Seller deleted successfully.");
        fetchPendingSellers();
      } else {
        toast.error("Failed to delete seller.");
      }
    } catch (error) {
      console.error("Error deleting seller:", error);
      toast.error("Error deleting seller.");
    }
  };

  const handleSearch = (filteredSellers) => {
    setSellers(filteredSellers);
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
    <div className="seller-request-container">
      <h1>Manage Seller Requests</h1>
      <div className="search-bar-container">
        <SellerSearchBar sellers={originalSellers} onSearch={handleSearch} />
      </div>

        <div className="seller-card-grid">
          {sellers.map((seller, index) => (
            <div
              key={seller._id}
              className={`seller-card ${expandedCard === seller._id ? "expanded" : ""}`}
            >
              <div className="card-header">
                <span className="card-number">{index + 1}</span>
                <h3>{seller.name}</h3>
                <button
                  className="toggle-button"
                  onClick={() => toggleCard(seller._id)}
                >
                  {expandedCard === seller._id ? "Hide Details" : "Show Details"}
                </button>
              </div>
              <div className="card-content">
                <div className="card-info">
                  <p>
                    <strong>Email:</strong> {seller.email}
                  </p>
                  {expandedCard === seller._id && (
                    <>
                      <p>
                        <strong>Shop Name:</strong> {seller.shopName}
                      </p>
                      <p>
                        <strong>Business Location:</strong> {seller.businessLocation}
                      </p>
                    </>
                  )}
                </div>
                <div className="card-images">
                  <div className="image-wrapper">
                    <img
                      src={`http://localhost:4000/upload/${seller.idPicture}`}
                      alt="ID Picture"
                      className="seller-image"
                      onClick={() =>
                        handleImageClick(
                          `http://localhost:4000/upload/${seller.idPicture}`
                        )
                      }
                    />
                    <span className="image-label">ID Picture</span>
                  </div>
                </div>
              </div>
              <div className="card-actions">
                <button
                  className="action-button approve"
                  onClick={() => handleApproveSeller(seller._id)}
                  disabled={approving}
                >
                  Accept
                </button>
                <button
                  className="action-button reject"
                  onClick={() => handleDeleteSeller(seller._id)}
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

export default SellerRequest;