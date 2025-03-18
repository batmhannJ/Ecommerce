import React, { useState, useEffect } from "react";
import axios from "axios";
import UserSearchBar from "../SearchBar/SearchBar";
import { toast } from "react-toastify";
import "./RiderList.css";
//import "./ViewUserModal.css";

function SellerList() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "" });
  const [viewUser, setViewUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/rider");
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching users:", error);
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
      toast.success("User updated successfully.");
    } catch (error) {
      toast.error("User update error.");
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
    setViewUser(users[index]);
  };

  const resetEditingState = () => {
    setEditingUser(null);
    setNewUser({ name: "", email: "", password: "" });
  };

  const handleSearch = async (searchTerm) => {
    try {
      const response = await axios.get(`http://localhost:4000/api/users/search?term=${searchTerm}`);
      setUsers(response.data);  // Update users state with search results
    } catch (error) {
      console.error("Error fetching data: ", error);
      toast.error("Search failed. Please try again.");
    }
  };
  
  return (
    <div className="user-management-container">
      <h1>Manage Riders</h1>
      <UserSearchBar onSearch={handleSearch} />
      <table className="user-table">
        <thead>
          <tr>
            <th>No.</th>
            <th>Name</th>
            <th>Email</th>
            <th>Contact</th>
            <th>Address</th>
            <th>Plate Number</th>
            <th>Vehicle Type</th>
            <th>Id Picture</th>
            <th>Vehicle Registration</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user._id}>
              <td>{index + 1}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.contactNumber}</td>
              <td>{user.address}</td>
              <td>{user.plateNumber}</td>
              <td>{user.vehicleType}</td>
              <td><img
                    src={`http://localhost:4000/upload/images/${user.vehicleRegistration}`} // Adjust this path to match your server's setup
                    alt="ID Picture"
                    style={{ width: "100px", height: "auto" }} // You can adjust the size as needed
                  />
                </td>
                <td>
                  <img
                    src={`http://localhost:4000/upload/images/${user.idPicture}`} // Adjust this path to match your server's setup
                    alt="ID Picture"
                    style={{ width: "100px", height: "auto" }} // You can adjust the size as needed
                  />
                </td>
              <td>
                <button
                  className="action-button view"
                  onClick={() => handleViewUser(index)}
                >
                  View
                </button>
                <button
                  className="action-button delete"
                  onClick={() => handleDeleteUser(user._id, index)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingUser !== null && (
        <div className="edit-form-overlay">
          <form className="edit-form" onSubmit={handleUpdateUser}>
            <h2>Edit User</h2>
            <button
              type="button"
              className="close-button"
              onClick={resetEditingState}
            >
              X
            </button>
            <div className="form-group">
              <label htmlFor="name">Name:</label>
              <input
                id="name"
                type="text"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser({ ...newUser, name: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                id="password"
                type="password"
                value={newUser.password}
                readOnly
              />
            </div>
            <button type="submit" className="submit-button">
              Update User
            </button>
          </form>
        </div>
      )}

      {viewUser && (
        <div className="view-user-overlay">
          <div className="view-user-details">
            <h2>View User</h2>
            <button
              type="button"
              className="close-button"
              onClick={() => setViewUser(null)}
            >
              X
            </button>
            <div className="user-detail">
              <strong>Name:</strong> {viewUser.name}
            </div>
            <div className="user-detail">
              <strong>Email:</strong> {viewUser.email}
            </div>
            <div className="user-detail">
              <strong>Password:</strong> {viewUser.password && '*'.repeat(viewUser.password.length)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SellerList;
