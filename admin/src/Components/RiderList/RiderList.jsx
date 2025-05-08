import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./RiderList.css";

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
    <div className="rm-modern-search-wrapper">
      <div className="rm-modern-search-box">
        <span className="rm-modern-icon">
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
          placeholder="Search riders by name or email..."
          className="rm-modern-input"
        />
        {searchTerm && (
          <button className="rm-modern-clear-btn" onClick={handleClear}>
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
        <button className="rm-modern-search-btn" onClick={handleSearch}>
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

function RiderList() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "" });
  const [viewUser, setViewUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const usersPerPage = 8;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:4000/api/rider");
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching riders:", error);
      toast.error("Failed to fetch riders. Please check the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (index) => {
    const globalIndex = index + (currentPage - 1) * usersPerPage;
    setEditingUser(globalIndex);
    setNewUser({ ...users[globalIndex] });
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
      toast.success("Rider updated successfully.");
    } catch (error) {
      toast.error("Rider update error.");
      console.error(error);
    }
  };

  const handleDeleteUser = async (id, index) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this rider?");
    if (isConfirmed) {
      try {
        await axios.delete(`http://localhost:4000/api/deleterider/${id}`);
        setUsers(users.filter((_, idx) => idx !== index));
        toast.success("Rider deleted successfully.");
      } catch (error) {
        toast.error("Rider delete error.");
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
      console.error("Error searching riders:", error);
      toast.error("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openImageLightbox = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const closeImageLightbox = () => {
    setSelectedImage(null);
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="rm-wrapper">
      <div className="rm-header">
        <div className="rm-header-controls">
          <h1 className="rm-title">Manage Riders</h1>
        </div>
        <div className="rm-search-container">
          <UserSearchBar onSearch={handleSearch} />
        </div>
      </div>

      <div className="rm-table-container">
        <table className="rm-table">
          <thead>
            <tr>
              <th className="rm-th-view">View</th>
              <th className="rm-th-username">Name</th>
              <th className="rm-th-email">Email</th>
              <th className="rm-th-profile">Profile</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="rm-no-users">
                  Loading...
                </td>
              </tr>
            ) : currentUsers.length > 0 ? (
              currentUsers.map((user, index) => (
                <tr key={user._id} className="rm-table-row">
                  <td className="rm-td-view">
                    <button
                      className="rm-view-btn"
                      onClick={() => handleViewUser(index)}
                    >
                      View
                    </button>
                  </td>
                  <td className="rm-td-username">{user.name || "N/A"}</td>
                  <td className="rm-td-email">{user.email || "N/A"}</td>
                  <td className="rm-td-profile">
                    <div className="rm-avatar">
                      {user.imageUrl ? (
                        <img
                          src={user.imageUrl}
                          alt={user.name}
                          className="rm-avatar-img"
                        />
                      ) : (
                        <div className="rm-avatar-placeholder">
                          {user.name ? user.name.charAt(0).toUpperCase() : "R"}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="rm-no-users">
                  No riders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="rm-pagination">
        <div className="rm-pagination-info">
          Displaying {indexOfFirstUser + 1} - {Math.min(indexOfLastUser, users.length)} of {users.length} records
        </div>
        <div className="rm-pagination-buttons">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => paginate(i + 1)}
              className={`rm-page-btn ${currentPage === i + 1 ? 'active' : ''}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {viewUser && (
        <div className="rm-modal-backdrop">
          <div className="rm-modal-content">
            <div className="rm-modal-header">
              <h2>Rider Profile</h2>
              <button
                className="rm-close-button"
                onClick={() => setViewUser(null)}
                aria-label="Close rider details"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="rm-profile-section">
              <div className="rm-avatar-row">
                {viewUser.imageUrl ? (
                  <img
                    src={viewUser.imageUrl}
                    alt={viewUser.name}
                    className="rm-profile-image"
                  />
                ) : (
                  <div className="rm-profile-placeholder">
                    {viewUser.name ? viewUser.name.charAt(0).toUpperCase() : "R"}
                  </div>
                )}
              </div>
              <div className="rm-info-grid">
                <div className="rm-info-row">
                  <span className="rm-info-label">Full Name</span>
                  <span className="rm-info-value">{viewUser.name || "N/A"}</span>
                </div>
                <div className="rm-info-row">
                  <span className="rm-info-label">Email Address</span>
                  <span className="rm-info-value">{viewUser.email || "N/A"}</span>
                </div>
                <div className="rm-info-row">
                  <span className="rm-info-label">Contact Number</span>
                  <span className="rm-info-value">{viewUser.contactNumber || "N/A"}</span>
                </div>
                <div className="rm-info-row">
                  <span className="rm-info-label">Address</span>
                  <span className="rm-info-value">{viewUser.address || "N/A"}</span>
                </div>
                <div className="rm-info-row">
                  <span className="rm-info-label">Plate Number</span>
                  <span className="rm-info-value">{viewUser.plateNumber || "N/A"}</span>
                </div>
                <div className="rm-info-row">
                  <span className="rm-info-label">Vehicle Type</span>
                  <span className="rm-info-value">{viewUser.vehicleType || "N/A"}</span>
                </div>
                <div className="rm-info-row">
                  <span className="rm-info-label">Role</span>
                  <span className="rm-info-value">Rider</span>
                </div>
                <div className="rm-info-row">
                  <span className="rm-info-label">Account Created</span>
                  <span className="rm-info-value">{viewUser.date ? formatDate(viewUser.date) : "N/A"}</span>
                </div>
                <div className="rm-info-row">
                  <span className="rm-info-label">ID Picture</span>
                  <div className="rm-info-image-container">
                    {viewUser.idPicture ? (
                      <img
                        src={`http://localhost:4000/upload/images/${viewUser.idPicture}`}
                        alt="ID Picture"
                        className="rm-info-image"
                        onClick={() => openImageLightbox(`http://localhost:4000/upload/images/${viewUser.idPicture}`)}
                      />
                    ) : (
                      <span className="rm-info-placeholder">No ID Picture</span>
                    )}
                  </div>
                </div>
                <div className="rm-info-row">
                  <span className="rm-info-label">Vehicle Registration</span>
                  <div className="rm-info-image-container">
                    {viewUser.vehicleRegistration ? (
                      <img
                        src={`http://localhost:4000/upload/images/${viewUser.vehicleRegistration}`}
                        alt="Vehicle Registration"
                        className="rm-info-image"
                        onClick={() => openImageLightbox(`http://localhost:4000/upload/images/${viewUser.vehicleRegistration}`)}
                      />
                    ) : (
                      <span className="rm-info-placeholder">No Vehicle Registration</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="rm-modal-actions">
              <button
                className="rm-action-button rm-edit"
                onClick={() =>
                  handleEditUser(users.findIndex((u) => u._id === viewUser._id))
                }
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                View Rider
              </button>
              <button
                className="rm-action-button rm-close"
                onClick={() => setViewUser(null)}
              >
                Close
              </button>
              <button
                className="rm-action-button rm-delete"
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
                Delete Rider
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedImage && (
        <div className="rm-lightbox-backdrop" onClick={closeImageLightbox}>
          <div className="rm-lightbox-content">
            <img
              src={selectedImage}
              alt="Enlarged view"
              className="rm-lightbox-image"
            />
            <button
              className="rm-lightbox-close"
              onClick={closeImageLightbox}
              aria-label="Close image lightbox"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      )}

      {editingUser !== null && (
        <div className="rm-modal-backdrop">
          <div className="rm-modal-content">
            <div className="rm-modal-header">
              <h2>View Rider Profile</h2>
              <button
                className="rm-close-button"
                onClick={resetEditingState}
                aria-label="Close edit modal"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="rm-form-section">
              <div className="rm-form-row">
                <label htmlFor="name" className="rm-form-label">Full Name</label>
                <div className="rm-input-wrapper">
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
                    className="rm-form-input"
                    required
                    readOnly
                  />
                </div>
              </div>
              <div className="rm-form-row">
                <label htmlFor="email" className="rm-form-label">Email Address</label>
                <div className="rm-input-wrapper">
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
                    className="rm-form-input"
                    required
                    readOnly
                  />
                </div>
              </div>
            </form>
            <div className="rm-modal-actions">
              <button
                type="button"
                className="rm-action-button rm-cancel"
                onClick={resetEditingState}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RiderList;