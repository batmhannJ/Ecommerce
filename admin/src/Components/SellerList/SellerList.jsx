import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./SellerList.css";

const UserSearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    onSearch("");
  };

  return (
    <div className="um-modern-search-wrapper">
      <div className="um-modern-search-box">
        <span className="um-modern-icon">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Search sellers by name or email..."
          className="um-modern-input"
        />
        {searchTerm && (
          <button className="um-modern-clear-btn" onClick={handleClear}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
        <button className="um-modern-search-btn" onClick={handleSearch}>
          Search
        </button>
      </div>
    </div>
  );
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return "N/A";
  }
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function SellerList() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "" });
  const [viewUser, setViewUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 8;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:4000/api/sellers");
      const userData = Array.isArray(response.data) ? response.data : [];
      setUsers(userData);
    } catch (error) {
      console.error("Error fetching sellers:", error);
      toast.error("Failed to fetch sellers. Please check the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (index) => {
    setEditingUser(index);
    setNewUser({ ...users[index] });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    const { name, email } = newUser;

    if (!name || !email) {
      toast.error("Name and email are required.");
      return;
    }

    try {
      const response = await axios.patch(
        `http://localhost:4000/api/edituser/${users[editingUser]._id}`,
        { name, email }
      );
      setUsers(
        users.map((user, idx) => (idx === editingUser ? response.data : user))
      );
      resetEditingState();
      toast.success("Seller updated successfully.");
    } catch (error) {
      toast.error("Seller update error.");
      console.error(error);
    }
  };

  const handleDeleteUser = async (id, index) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this seller?");
    if (isConfirmed) {
      try {
        await axios.delete(`http://localhost:4000/api/deleteseller/${id}`);
        setUsers(users.filter((_, idx) => idx !== index));
        toast.success("Seller deleted successfully.");
      } catch (error) {
        toast.error("Seller delete error.");
        console.error(error);
      }
    }
  };

  const handleViewUser = (index) => {
    const globalIndex = index + (currentPage - 1) * usersPerPage;
    setViewUser(users[globalIndex]);
  };

  const resetEditingState = () => {
    setEditingUser(null);
    setNewUser({ name: "", email: "", password: "" });
  };

  const handleSearch = async (searchTerm) => {
    if (!searchTerm.trim()) {
      fetchUsers();
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:4000/api/users/search?term=${encodeURIComponent(searchTerm)}`);
      setUsers(Array.isArray(response.data) ? response.data : []);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error searching sellers:", error);
      toast.error("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="um-wrapper">
      <div className="um-header">
        <div className="um-header-controls">
          <h1 className="um-title">Seller List</h1>
        </div>
        <div className="um-search-container">
          <UserSearchBar onSearch={handleSearch} />
        </div>
      </div>

      <div className="um-table-container">
        <table className="um-table">
          <thead>
            <tr>
              <th className="um-th-view">View</th>
              <th className="um-th-username">Shop Name</th>
              <th className="um-th-status">Email</th>
              <th className="um-th-profile">Profile</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="um-no-users">
                  Loading...
                </td>
              </tr>
            ) : currentUsers.length > 0 ? (
              currentUsers.map((user, index) => (
                <tr key={user._id} className="um-table-row">
                  <td className="um-td-view">
                    <button
                      className="um-view-btn"
                      onClick={() => handleViewUser(index)}
                    >
                      View
                    </button>
                  </td>
                  <td className="um-td-username">{user.shopName || "N/A"}</td>
                  <td className="um-td-status">{user.email}</td>
                  <td className="um-td-profile">
                    <div className="um-avatar">
                      {user.imageUrl ? (
                        <img
                          src={user.imageUrl}
                          alt={user.name}
                          className="um-avatar-img"
                        />
                      ) : (
                        <div className="um-avatar-placeholder">
                          {user.name ? user.name.charAt(0).toUpperCase() : "S"}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="um-no-users">
                  No sellers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="um-pagination">
        <div className="um-pagination-info">
          Displaying {indexOfFirstUser + 1} - {Math.min(indexOfLastUser, users.length)} of {users.length} records
        </div>
        <div className="um-pagination-buttons">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => paginate(i + 1)}
              className={`um-page-btn ${currentPage === i + 1 ? 'active' : ''}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {viewUser && (
        <div className="um-modal-backdrop">
          <div className="um-modal-content">
            <div className="um-modal-header">
              <h2>Seller Profile</h2>
              <button
                className="um-close-button"
                onClick={() => setViewUser(null)}
                aria-label="Close seller details"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="um-profile-section">
              <div className="um-avatar-row">
                {viewUser.imageUrl ? (
                  <img
                    src={viewUser.imageUrl}
                    alt={viewUser.name}
                    className="um-profile-image"
                  />
                ) : (
                  <div className="um-profile-placeholder">
                    {viewUser.name ? viewUser.name.charAt(0).toUpperCase() : "S"}
                  </div>
                )}
              </div>
              <div className="um-info-row">
                <span className="um-info-label">Full Name</span>
                <span className="um-info-value">{viewUser.name || "N/A"}</span>
              </div>
              <div className="um-info-row">
                <span className="um-info-label">Shop Name</span>
                <span className="um-info-value">{viewUser.shopName || "N/A"}</span>
              </div>
              <div className="um-info-row">
                <span className="um-info-label">Email Address</span>
                <span className="um-info-value">{viewUser.email || "N/A"}</span>
              </div>
              <div className="um-info-row">
                <span className="um-info-label">Contact Number</span>
                <span className="um-info-value">{viewUser.phone || "N/A"}</span>
              </div>
              <div className="um-info-row">
                <span className="um-info-label">Role</span>
                <span className="um-info-value">Seller</span>
              </div>
              <div className="um-info-row">
                <span className="um-info-label">Account Created</span>
                <span className="um-info-value">
                  {viewUser.date ? formatDate(viewUser.date) : "N/A"}
                </span>
              </div>
            </div>
            <div className="um-modal-actions">
              <button
                className="um-action-button um-edit"
                onClick={() =>
                  handleEditUser(users.findIndex((u) => u._id === viewUser._id))
                }
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Edit Seller
              </button>
              <button
                className="um-action-button um-close"
                onClick={() => setViewUser(null)}
              >
                Close
              </button>
              <button
                className="um-action-button um-delete"
                onClick={() =>
                  handleDeleteUser(
                    viewUser._id,
                    users.findIndex((u) => u._id === viewUser._id)
                  )
                }
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                Delete Seller
              </button>
            </div>
          </div>
        </div>
      )}

      {editingUser !== null && (
        <div className="um-modal-backdrop">
          <div className="um-modal-content">
            <div className="um-modal-header">
              <h2>Edit Seller Profile</h2>
              <button
                className="um-close-button"
                onClick={resetEditingState}
                aria-label="Close edit modal"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="um-form-section">
              <div className="um-form-row">
                <label htmlFor="name" className="um-form-label">Full Name</label>
                <div className="um-input-wrapper">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <input
                    id="name"
                    type="text"
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                    placeholder="Enter full name"
                    className="um-form-input"
                    required
                  />
                </div>
              </div>
              <div className="um-form-row">
                <label htmlFor="email" className="um-form-label">Email Address</label>
                <div className="um-input-wrapper">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    placeholder="Enter email address"
                    className="um-form-input"
                    required
                  />
                </div>
              </div>
              <div className="um-form-row">
                <label htmlFor="password" className="um-form-label">Password</label>
                <div className="um-input-wrapper">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0110 0v4"></path>
                  </svg>
                  <input
                    id="password"
                    type="password"
                    value={newUser.password}
                    readOnly
                    placeholder="Password (unchanged)"
                    className="um-form-input"
                  />
                </div>
              </div>
            </form>
            <div className="um-modal-actions">
              <button
                type="submit"
                className="um-action-button um-update"
                onClick={handleUpdateUser}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                Save Changes
              </button>
              <button
                type="button"
                className="um-action-button um-cancel"
                onClick={resetEditingState}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SellerList;