import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import UserSearchBar from "../SearchBar/SearchBar";
import { toast } from "react-toastify";
import "./UserManagement.css";

// Utility function to format the date
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

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "" });
  const [viewUser, setViewUser] = useState(null);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false); // For small/medium screens only
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 8;
  const usersRef = useRef([]);

  useEffect(() => {
    usersRef.current = users;
  }, [users]);

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(() => {
      updateWorkingTimesLocally();
      if (Date.now() % 10000 < 1000) {
        updateWorkingTimesFromServer();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync isPanelExpanded with viewUser changes for small/medium screens
  useEffect(() => {
    if (viewUser) {
      setIsPanelExpanded(true); // Expand panel when a user is viewed
    } else {
      setIsPanelExpanded(false); // Collapse panel when no user is viewed
    }
  }, [viewUser]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/users");
      const userData = Array.isArray(response.data) ? response.data : [];
      const enhancedUsers = userData.map((user) => ({
        ...user,
        status: user.status || "Offline",
        workingTime: "00:00:00",
        lastLogin: user.lastLogin || null,
        totalWorkingSeconds: 0,
        currentSessionSeconds: user.currentSessionSeconds || 0,
        lastUpdateTime: Date.now(),
      }));
      setUsers(enhancedUsers);
      updateWorkingTimesFromServer(enhancedUsers);
    } catch (error) {
      toast.error("Failed to fetch users. Please check the server.");
    }
  };

  const updateWorkingTimesLocally = () => {
    if (!usersRef.current.length) return;
    const now = Date.now();
    const updatedUsers = usersRef.current.map((user) => {
      if (user.status === "Active" && user.sessionStart) {
        const sessionStartTime = new Date(user.sessionStart).getTime();
        const currentSessionSeconds = Math.floor((now - sessionStartTime) / 1000);
        const hours = Math.floor(currentSessionSeconds / 3600);
        const minutes = Math.floor((currentSessionSeconds % 3600) / 60);
        const seconds = Math.floor(currentSessionSeconds % 60);
        const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
        return {
          ...user,
          currentSessionSeconds,
          workingTime: formattedTime,
          lastUpdateTime: now,
        };
      }
      return user;
    });
    setUsers(updatedUsers);
  };

  const getWorkingTimePercentage = (user) => {
    const eightHoursInSeconds = 8 * 60 * 60;
    const percentage = ((user.currentSessionSeconds || 0) / eightHoursInSeconds) * 100;
    return Math.min(percentage, 100);
  };

  const updateWorkingTimesFromServer = async (userList = null) => {
    try {
      const currentUsers = userList || usersRef.current;
      if (!currentUsers.length) return;
      const activeUsers = currentUsers.filter((user) => user.status === "Active");
      if (!activeUsers.length) return;
      const updatedUsers = [...currentUsers];
      await Promise.all(
        activeUsers.map(async (user) => {
          try {
            const response = await axios.get(
              `http://localhost:4000/api/users/${user._id}/working-time`
            );
            const userIndex = updatedUsers.findIndex((u) => u._id === user._id);
            if (userIndex !== -1) {
              updatedUsers[userIndex] = {
                ...updatedUsers[userIndex],
                workingTime: response.data.formattedTime,
                currentSessionSeconds: response.data.totalSeconds,
                lastUpdateTime: Date.now(),
              };
            }
          } catch (err) {}
        })
      );
      if (updatedUsers.length > 0) setUsers(updatedUsers);
    } catch (error) {}
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
      toast.success("User updated successfully.");
    } catch (error) {
      toast.error("Failed to update user. Please try again.");
    }
  };

  const handleDeleteUser = async (id, index) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this user?");
    if (isConfirmed) {
      try {
        await axios.delete(`http://localhost:4000/api/deleteuser/${id}`);
        setUsers(users.filter((_, idx) => idx !== index));
        toast.success("User deleted successfully.");
      } catch (error) {
        toast.error("Failed to delete user. Please try again.");
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
    try {
      const response = await axios.get(
        `http://localhost:4000/api/users/search?term=${encodeURIComponent(searchTerm)}`
      );
      const userData = Array.isArray(response.data) ? response.data : [];
      const enhancedUsers = userData.map((user) => ({
        ...user,
        status: user.status || "Offline",
        workingTime: "00:00:00",
        lastLogin: user.lastLogin || null,
        totalWorkingSeconds: 0,
        lastUpdateTime: Date.now(),
      }));
      setUsers(enhancedUsers);
      setCurrentPage(1);
      updateWorkingTimesFromServer(enhancedUsers);
    } catch (error) {
      toast.error("Search failed. Please check the server and try again.");
    }
  };

  const togglePanel = () => {
    setIsPanelExpanded(!isPanelExpanded);
  };

  const handleClosePanel = () => {
    setViewUser(null);
    setIsPanelExpanded(false); // Ensure panel collapses when closed
  };

  const getStatusClass = (status) => {
    return status === "Active" ? "status-active" : "status-offline";
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="user-management-wrapper">
      <div className="user-management-header">
        <div className="header-controls">
          <h1>User List</h1>
        </div>
        <div className="search-bar-container">
          <UserSearchBar onSearch={handleSearch} />
        </div>
      </div>

      <div className="user-list-container">
        <div className="user-list">
          <div className="user-list-header">
            <div className="view-column">VIEW</div>
            <div className="username-column">USERNAME</div>
            <div className="status-column">STATUS</div>
            <div className="working-time-column">USAGE TIME</div>
            <div className="assignee-column">PROFILE</div>
          </div>

          {currentUsers.length > 0 ? (
            currentUsers.map((user, index) => (
              <div key={user._id} className="user-list-item">
                <div className="view-column">
                  <button className="view-btn" onClick={() => handleViewUser(index)}>
                    View
                  </button>
                </div>
                <div className="username-column">{user.name}</div>
                <div className="status-column">
                  <span className={getStatusClass(user.status)}>{user.status}</span>
                </div>
                <div className="working-time-column">
                  <div className="time-progress">
                    <div
                      className="time-bar"
                      style={{ width: `${getWorkingTimePercentage(user)}%` }}
                    ></div>
                  </div>
                  <span>{user.workingTime || "00:00:00"}</span>
                </div>
                <div className="assignee-column">
                  <div className="user-avatar">
                    {user.imageUrl ? (
                      <img
                        src={user.imageUrl}
                        alt={user.name}
                        className="user-avatar-img"
                      />
                    ) : (
                      <div className="avatar-placeholder">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-users">No users found.</div>
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
          <div className={`user-details-panel ${isPanelExpanded ? 'expanded' : 'collapsed'}`}>
            <button
              className="toggle-panel-btn"
              onClick={togglePanel}
              aria-label="Toggle user details panel"
              aria-expanded={isPanelExpanded}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="toggle-icon"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isPanelExpanded ? "M19 9l-7 7-7-7" : "M5 15l7-7 7 7"}
                />
              </svg>
            </button>
            <div className="panel-header">
              <button
                className="back-btn"
                onClick={handleClosePanel}
                aria-label="Go back to user list"
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
                className="close-btn"
                onClick={handleClosePanel}
                aria-label="Close user details"
              >
                ×
              </button>
            </div>

            <div className="user-profile-card">
              <div className="user-avatar-container">
                {viewUser.imageUrl ? (
                  <img
                    src={viewUser.imageUrl}
                    alt={viewUser.name}
                    className="user-avatar-img"
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {viewUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <h2 className="user-name">{viewUser.name || "N/A"}</h2>
              <p className="user-email">{viewUser.email || "N/A"}</p>
            </div>

            <div className="user-stats-section">
              <h3 className="section-title">User Details</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-label">Role</span>
                  <span className="stat-value">{viewUser.role || "User"}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Last Login</span>
                  <span className="stat-value">
                    {viewUser.lastLogin ? formatDate(viewUser.lastLogin) : "N/A"}
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Account Created</span>
                  <span className="stat-value">
                    {viewUser.date ? formatDate(viewUser.date) : "N/A"}
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Status</span>
                  <span className="stat-value">{viewUser.status || "N/A"}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Usage Time</span>
                  <span className="stat-value">
                    {viewUser.workingTime || "00:00:00"}
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
                Edit User
              </button>
            </div>
          </div>
        ) : (
          <div className={`user-details-placeholder ${isPanelExpanded ? 'expanded' : 'collapsed'}`}>
            <button
              className="toggle-panel-btn"
              onClick={togglePanel}
              aria-label="Toggle user details panel"
              aria-expanded={isPanelExpanded}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="toggle-icon"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isPanelExpanded ? "M19 9l-7 7-7-7" : "M5 15l7-7 7 7"}
                />
              </svg>
            </button>
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
                d="M9 5h6a2 2 0 012 2v10a2 2 0 01-2 2H9a2 2 0 01-2-2V7a2 2 0 012-2zm3 7v2m0 0v2m0-2h-2m2 0h2"
              />
            </svg>
            <h3 className="placeholder-title">No User Selected</h3>
            <p className="placeholder-text">
              Click the "View" button on a user to display their details here.
            </p>
          </div>
        )}
      </div>

      {editingUser !== null && (
        <div className="modal-overlay">
          <div className="edit-modal">
            <div className="modal-header">
              <h2>Edit User Profile</h2>
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
                />
              </div>
              <div className="form-field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={newUser.password}
                  readOnly
                  placeholder="Password (unchanged)"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  Save Changes
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={resetEditingState}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;