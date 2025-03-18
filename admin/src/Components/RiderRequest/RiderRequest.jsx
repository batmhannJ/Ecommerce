// src/Components/SellerRequest/SellerRequest.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import SellerSearchBar from "../SearchBar/SellerSearchBar";
import { toast } from "react-toastify";
import "./RiderRequest.css";
//import "./ViewUserModal.css";

function RiderRequest() {
  const [rider, setSellers] = useState([]);
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
        "http://localhost:4000/api/rider/pending",
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
    if (!window.confirm("Are you sure you want to approve this rider?"))
      return;

    setApproving(true);
    try {
      const response = await axios.patch(
        `http://localhost:4000/api/rider/${id}/approve`, // Ensure this route matches your backend
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
        // Remove the approved seller from the list
        setSellers(rider.filter((rider) => rider._id !== id));
        setOriginalSellers(
          originalSellers.filter((rider) => rider._id !== id)
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

  const handleDeleteSeller = async (id) => {
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
        toast.success("Seller deleted successfully.");
        fetchPendingSellers();
      } else {
        toast.error("Failed to delete rider.");
      }
    } catch (error) {
      console.error("Error deleting rider:", error);
      toast.error("Error deleting rider.");
    }
  };

  const handleSearch = (filteredSellers) => {
    setSellers(filteredSellers);
  };

  return (
    <div className="seller-management-container">
      <h1>Manage Rider Requests</h1>
      <SellerSearchBar sellers={originalSellers} onSearch={handleSearch} />{" "}
      {/* Pass sellers and search handler */}
      {loading ? (
        <p>Loading pending rider...</p>
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
            {rider.map((rider, index) => (
              <tr key={rider._id}>
                <td>{index + 1}</td>
                <td>{rider.name}</td>
                <td>{rider.email}</td>
                <td>{rider.address}</td>
                <td>{rider.plateNumber}</td>
                <td>{rider.vehicleType}</td>
                <td><img
                    src={`http://localhost:4000/upload/images/${rider.vehicleRegistration}`} // Adjust this path to match your server's setup
                    alt="ID Picture"
                    style={{ width: "100px", height: "auto" }} // You can adjust the size as needed
                  />
                </td>
                <td>
                  <img
                    src={`http://localhost:4000/upload/images/${rider.idPicture}`} // Adjust this path to match your server's setup
                    alt="ID Picture"
                    style={{ width: "100px", height: "auto" }} // You can adjust the size as needed
                  />
                </td>
                {/* Ensure 'idProfile' exists in Seller model */}
                <td>
                  <button
                    className="action-button approve"
                    onClick={() => handleApproveSeller(rider._id)}
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

export default RiderRequest;
