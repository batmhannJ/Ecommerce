import React, { useState, useEffect } from "react";
import "./AccountSettings.css";
import axios from "axios";
import Navbar from '../Navbar/Navbar'; // Adjust the import path as necessary
import Sidebar from '../Sidebar/Sidebar'; // Adjust the import path as necessary
import { FaEye, FaEyeSlash } from "react-icons/fa";

const AccountSettings = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };
  const getUserIdFromToken = () => {
    const authToken = localStorage.getItem("admin_token"); // Adjusted to use 'admin_token'
    if (authToken) {
      try {
        const payload = JSON.parse(atob(authToken.split(".")[1]));
        return payload.id; // Ensure this is 'id' in your token's payload
      } catch (error) {
        console.error("Error decoding token:", error);
        return null;
      }
    }
    return null;
  };
  

  useEffect(() => {
    const userId = getUserIdFromToken();
    console.log("User ID from token:", userId); // Log the user ID for debugging

    const fetchUserData = async () => {
      const authToken = localStorage.getItem("admin_token"); // Adjusted to use 'admin_token'
      const userId = getUserIdFromToken(); // Retrieve the userId from the token
    
      if (!authToken || !userId) {
        console.error("No token or user ID found");
        return;
      }
    
      try {
        const response = await axios.get(`https://ip-tienda-han-backend.onrender.com/api/admin/${userId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`, // Adjusted to use the correct token
          },
        });
        const { name, phone, email } = response.data;
        setFormData({ name, phone, email, password: "" });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name) errors.name = "Name is required";
    if (!formData.phone) errors.phone = "Phone is required";
    if (!formData.email) errors.email = "Email is required";
    // Remove password validation as it is now optional
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setFormSubmitted(true);
      const adminId = getUserIdFromToken(); // Use the same function to get admin ID
      console.log("Admin ID for update:", adminId); // Add this line

      const updateData = { 
        name: formData.name, 
        email: formData.email, 
        phone: formData.phone,
      };

      // Only include password if it's provided
      if (formData.password) {
        updateData.password = formData.password;
      }

      try {
        const response = await axios.patch(
          `https://ip-tienda-han-backend.onrender.com/api/editadmin/${adminId}`, // Ensure this is correct
          updateData, // Send only the data we want to update
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth-token")}`, // Include auth token
            }
          }
        );

        console.log("User updated successfully:", response.data);
      } catch (error) {
        console.error("Error updating user:", error);
      }
    }
  };

  return (
    <div className="account-settings">
      <Navbar />
      <div className="admin-layout">
        <Sidebar />
        <div className="account-settings-container">
          <h1 className="account-settings__heading">Personal Information</h1>

          {formSubmitted && (
            <p className="account-settings__success">
              Changes saved successfully!
            </p>
          )}

          <form className="account-settings__form" onSubmit={handleSubmit}>
            <div className="account-settings__form-group">
              <label htmlFor="name">Your Name <span>*</span></label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                aria-required="true"
              />
              {formErrors.name && <span className="account-settings__error">{formErrors.name}</span>}
            </div>

            <div className="account-settings__form-group">
            <label htmlFor="phone">
              Phone/Mobile <span>*</span>
            </label>
            <input
              type="tel"
              name="phone"
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              onInput={(e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
                if (e.target.value.length > 11) {
                  e.target.value = e.target.value.slice(0, 11); // Limit to 11 digits
                }
              }}
              maxLength="11" // Ensures no more than 11 characters can be entered
              pattern="\d{11}" // Matches exactly 11 digits
              aria-required="true"
              placeholder="Enter your 11-digit phone number"
            />
            {formErrors.phone && (
              <span className="account-settings__error">
                {formErrors.phone}
              </span>
            )}
          </div>

            <div className="account-settings__form-group">
              <label htmlFor="email">Email <span>*</span></label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                aria-required="true"
              />
              {formErrors.email && <span className="account-settings__error">{formErrors.email}</span>}
            </div>

            <div className="account-settings__form-group">
              <label htmlFor="password">Password <span>(optional)</span></label>
              <div style={{ position: 'relative' }}>
    <input
      type={showPassword ? "text" : "password"}
      name="password"
      id="password"
      value={formData.password}
      onChange={handleChange}
      style={{ paddingRight: '30px', width: '100%'}} // Add padding to make space for the icon
    />
    <span
      className="eye-icon"
      onClick={togglePasswordVisibility}
      style={{
        cursor: 'pointer',
        position: 'absolute',
        right: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
      }}
    >
      {showPassword ? <FaEyeSlash /> : <FaEye />}
    </span>
  </div>
  {formErrors.password && <span className="account-settings__error">{formErrors.password}</span>}
            </div>

            <button className="account-settings__button" type="submit">
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
