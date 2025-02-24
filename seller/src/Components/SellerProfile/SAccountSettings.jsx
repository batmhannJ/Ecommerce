import React, { useState, useEffect } from "react";
import "./SAccountSettings.css";
import axios from "axios";
import Navbar from '../Navbar/Navbar'; // Adjust the import path as necessary
import Sidebar from '../Sidebar/Sidebar'; // Adjust the import path as necessary
import { FaEye, FaEyeSlash } from "react-icons/fa";

const SAccountSettings = () => {
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
    const authToken = localStorage.getItem("admin_token");
    if (authToken) {
      try {
        const payload = JSON.parse(atob(authToken.split(".")[1]));
        console.log("Decoded token payload:", payload); // Check the decoded token payload
        return payload.id;
      } catch (error) {
        console.error("Error decoding token:", error);
        return null;
      }
    }
    return null;
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const authToken = localStorage.getItem("admin_token");
      const userId = getUserIdFromToken();

      if (!authToken || !userId) {
        console.error("No token or user ID found");
        return;
      }

      try {
        const response = await axios.get(`https://ip-tienda-han-backend.onrender.com/api/seller/approved/${userId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        console.log("Fetched user data:", response.data);

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
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setFormSubmitted(true);
      const adminId = getUserIdFromToken();

      const updateData = { 
        name: formData.name, 
        email: formData.email, 
        phone: formData.phone,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      try {
        console.log("Outgoing update request data:", updateData); // Check the data before making request
        const response = await axios.patch(
          `https://ip-tienda-han-backend.onrender.com/api/editseller/${adminId}`,
          updateData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
            },
          }
        );
        console.log("User updated successfully:", response.data);
      } catch (error) {
        console.error("Error updating user:", error.response ? error.response.data : error.message);
      }
    }
  };

  return (
    <div className="account-settings">
      <div className="admin-layout">
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
                let value = e.target.value.replace(/[^0-9]/g, ""); // Remove non-numeric characters
                if (value.length > 0) {
                  value = '9' + value.slice(1); // Ensure it starts with 9
                }
                e.target.value = value.slice(0, 10); // Restrict to 10 digits
              }}
              maxLength="10"
              aria-required="true"
              //placeholder="Enter your 11-digit phone number"
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

export default SAccountSettings;
