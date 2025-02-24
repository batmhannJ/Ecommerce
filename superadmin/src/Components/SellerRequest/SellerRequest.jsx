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
        "https://ip-tienda-han-backend.onrender.com/api/superadmin/pending",
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
      console.error("Error fetching pending admin:", error);
      setError("Failed to fetch pending admin.");
      toast.error("Failed to fetch pending admin.");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSeller = async (id) => {
    if (!window.confirm("Are you sure you want to approve this admin?"))
      return;

    setApproving(true);
      const response = await axios.patch(
        `https://ip-tienda-han-backend.onrender.com/api/superadmin/${id}/approve`, // Ensure this route matches your backend
        {},
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );
      
      toast.success(
        `Admin ${response.data.admin.name} approved successfully.`
      );
      // Remove the approved seller from the list
      setSellers(sellers.filter((seller) => seller._id !== id));
      setOriginalSellers(
        originalSellers.filter((seller) => seller._id !== id)
      );
    
  };

  const handleDeleteSeller = async (id) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;

    try {
      const response = await axios.delete(
        `https://ip-tienda-han-backend.onrender.com/api/admin/${id}`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Admin deleted successfully.");
        fetchPendingSellers();
      } else {
        toast.error("Failed to delete admin.");
      }
    } catch (error) {
      console.error("Error deleting admin:", error);
      toast.error("Error deleting admin.");
    }
  };

  const handleSearch = (filteredSellers) => {
    setSellers(filteredSellers);
  };

  return (
    <div className="seller-management-container">
      <h1>Manage Admin Requests</h1>
      {/*<SellerSearchBar sellers={originalSellers} onSearch={handleSearch} />{" "}*/}
      {/* Pass sellers and search handler */}
      {loading ? (
        <p>Loading pending admins...</p>
      ) : sellers.length === 0 ? (
        <p>No pending admin requests.</p>
      ) : (
        <table className="seller-table">
          <thead>
            <tr>
              <th>Id</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sellers.map((seller) => (
              <tr key={seller._id}>
                <td>{seller._id}</td>
                {/*<td>{seller.name}</td>*/}
                <td>{seller.email}</td>
                {/*<td>
                  <img
                    src={`http://localhost:4000/upload/${seller.idPicture}`} // Adjust this path to match your server's setup
                    alt="ID Picture"
                    style={{ width: "100px", height: "auto" }} // You can adjust the size as needed
                  />
                </td>*/}
                {/* Ensure 'idProfile' exists in Seller model */}
                <td>
                  <button
                    className="action-button approve"
                    onClick={() => handleApproveSeller(seller._id)}
                    disabled={approving}
                  >
                    Approve
                  </button>
                  <button
                    className="action-button delete"
                    onClick={() => handleDeleteSeller(seller._id)}
                  >
                    Decline
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
