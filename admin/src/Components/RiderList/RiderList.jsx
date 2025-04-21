import React, { useState, useEffect } from "react";
import axios from "axios";
import UserSearchBar from "../SearchBar/SearchBar";
import { toast } from "react-toastify";
import "./RiderList.css";

function RiderList() {
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
        await axios.delete(`http://localhost:4000/api/deleteseller/${id}`);
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

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="user-management-wrapper">
      <div className="user-management-header">
        <div className="header-controls">
          <h1>Manage Riders</h1>
        </div>
        <div className="search-bar-container">
          <UserSearchBar onSearch={handleSearch} />
        </div>
      </div>

      <div className="user-list-container">
        <div className="user-list">
          <div className="user-list-header">
            <div className="view-column">VIEW</div>
            <div className="rider-name-column">NAME</div>
            <div className="email-column">EMAIL</div>
            <div className="assignee-column">PROFILE</div>
          </div>

          {currentUsers.length > 0 ? (
            currentUsers.map((user, index) => (
              <div key={user._id} className="user-list-item">
                <div className="view-column">
                  <button
                    className="view-btn"
                    onClick={() => handleViewUser(index)}
                  >
                    View
                  </button>
                </div>
                <div className="rider-name-column">{user.name || "N/A"}</div>
                <div className="email-column">{user.email || "N/A"}</div>
                <div className="assignee-column">
                  <div className="user-avatar">
                    <div className="avatar-placeholder">
                      {user.name ? user.name.charAt(0).toUpperCase() : "R"}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-users">No riders found.</div>
          )}
        </div>
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => paginate(i + 1)}
              className={currentPage === i + 1 ? "active" : ""}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="user-details-container">
        {viewUser ? (
          <div className="user-details-panel">
            <div className="panel-header">
              <button
                className="back-btn"
                onClick={() => setViewUser(null)}
                aria-label="Go back to rider list"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="back-icon"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back
              </button>
              <button
                className="closer-btn"
                onClick={() => setViewUser(null)}
                aria-label="Close rider details"
              >
                ×
              </button>
            </div>

            <div className="user-profile-card">
              <div className="user-avatar-container">
                <div className="avatar-placeholder">
                  {viewUser.name ? viewUser.name.charAt(0).toUpperCase() : "R"}
                </div>
              </div>
              <h2 className="user-name">{viewUser.name || "N/A"}</h2>
              <p className="user-email">{viewUser.email || "N/A"}</p>
            </div>

            <div className="user-stats-section">
              <h3 className="section-title">Rider Details</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-label">Contact Number</span>
                  <span className="stat-value">{viewUser.contactNumber || "N/A"}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Address</span>
                  <span className="stat-value">{viewUser.address || "N/A"}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Plate Number</span>
                  <span className="stat-value">{viewUser.plateNumber || "N/A"}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Vehicle Type</span>
                  <span className="stat-value">{viewUser.vehicleType || "N/A"}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">ID Picture</span>
                  <span className="stat-value">
                    {viewUser.idPicture ? (
                      <img
                        src={`http://localhost:4000/upload/images/${viewUser.idPicture}`}
                        alt="ID Picture"
                        style={{ width: "100px", height: "auto" }}
                      />
                    ) : (
                      "N/A"
                    )}
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Vehicle Registration</span>
                  <span className="stat-value">
                    {viewUser.vehicleRegistration ? (
                      <img
                        src={`http://localhost:4000/upload/images/${viewUser.vehicleRegistration}`}
                        alt="Vehicle Registration"
                        style={{ width: "100px", height: "auto" }}
                      />
                    ) : (
                      "N/A"
                    )}
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Role</span>
                  <span className="stat-value">Rider</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Account Created</span>
                  <span className="stat-value">
                    {viewUser.date
                      ? new Date(viewUser.date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div className="user-actions-section">
              <button
                className="action-btn edit-btn"
                onClick={() =>
                  handleEditUser(users.findIndex((u) => u._id === viewUser._id))
                }
              >
                View Rider
              </button>
            </div>
          </div>
        ) : (
          <div className="user-details-placeholder">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="placeholder-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.82-2.164-1.949-2.33a48.152 48.152 0 0 0-3.301-.051M12 12h.75M12 15h.75M12 18h.75m-8.25-5.25a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm18 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
            <h3 className="placeholder-title">No Rider Selected</h3>
            <p className="placeholder-text">
              Click the "View" button on a rider to display their details here.
            </p>
          </div>
        )}
      </div>

      {editingUser !== null && (
        <div className="modal-overlay">
          <div className="edit-modal">
            <div className="modal-header">
              <h2>View Rider Profile</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={resetEditingState}
                aria-label="Close edit modal"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateUser}>
              <div className="form-field">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  placeholder="Enter full name"
                  required
                  readOnly
                />
              </div>
              <div className="form-field">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  placeholder="Enter email address"
                  required
                  readOnly
                />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RiderList;