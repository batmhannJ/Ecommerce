// src/Components/SellerRequest/SellerRequest.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import SellerSearchBar from "../SearchBar/SellerSearchBar";
import { toast } from "react-toastify";
import "./SellerRequest.css";
//import "./ViewUserModal.css";

function SellerRequest() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState(null);
  const [originalSellers, setOriginalSellers] = useState([]); // To keep original seller data

  const adminToken = localStorage.getItem("admin_token"); // Ensure the key matches when storing

  useEffect(() => {
    if (!adminToken) {
      toast.error("Admin not authenticated. Please log in.");
      // Optionally, redirect to admin login page
      return;
    }
    fetchPendingSellers();
  }, [adminToken]);

  const fetchPendingSellers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://ip-tienda-han-backend.onrender.com/api/seller/pending",
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );
      const fetchedSellers = Array.isArray(response.data) ? response.data : [];
      setSellers(fetchedSellers);
      setOriginalSellers(fetchedSellers); // Save the original list for filtering
    } catch (error) {
      console.error("Error fetching pending sellers:", error);
      setError("Failed to fetch pending sellers.");
      toast.error("Failed to fetch pending sellers.");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSeller = async (id) => {
    if (!window.confirm("Are you sure you want to approve this seller?"))
      return;

    setApproving(true);
    try {
      const response = await axios.patch(
        `https://ip-tienda-han-backend.onrender.com/api/seller/${id}/approve`, // Ensure this route matches your backend
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
        // Remove the approved seller from the list
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
        `https://ip-tienda-han-backend.onrender.com/api/seller/${id}`,
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

  return (
    <div className="seller-management-container">
      <h1>Manage Seller Requests</h1>
      <SellerSearchBar sellers={originalSellers} onSearch={handleSearch} />{" "}
      {/* Pass sellers and search handler */}
      {loading ? (
        <p>Loading pending sellers...</p>
      ) : sellers.length === 0 ? (
        <p>No pending seller requests.</p>
      ) : (
        <table className="seller-table">
          <thead>
            <tr>
              <th>Id</th>
              <th>Name</th>
              <th>Email</th>
              <th>Valid ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sellers.map((seller) => (
              <tr key={seller._id}>
                <td>{seller._id}</td>
                <td>{seller.name}</td>
                <td>{seller.email}</td>
                <td>
                  <img
                    src={`https://ip-tienda-han-backend.onrender.com/upload/${seller.idPicture}`} // Adjust this path to match your server's setup
                    alt="ID Picture"
                    style={{ width: "100px", height: "auto" }} // You can adjust the size as needed
                  />
                </td>
                {/* Ensure 'idProfile' exists in Seller model */}
                <td>
                  <button
                    className="action-button approve"
                    onClick={() => handleApproveSeller(seller._id)}
                    disabled={approving}
                  >
                    Accept
                  </button>
                  <button
                    className="action-button delete"
                    onClick={() => handleDeleteSeller(seller._id)}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default SellerRequest;
