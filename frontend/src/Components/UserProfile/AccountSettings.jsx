import React, { useState, useEffect } from "react";
import "./AccountSettings.css";
import axios from "axios";

const AccountSettings = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  const getUserIdFromToken = () => {
    const authToken = localStorage.getItem("auth-token");
    if (authToken) {
      const payload = JSON.parse(atob(authToken.split(".")[1]));
      return payload.user.id; // Ensure the structure matches your token
    }
    return null;
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const authToken = localStorage.getItem("auth-token");
      const userId = getUserIdFromToken();

      if (!authToken || !userId) {
        console.error("No token or user ID found");
        return;
      }

      try {
        // Fetch user data for the currently logged-in user
        const response = await fetch(
          `https://ip-tienda-han-backend.onrender.com/api/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Fetched user data:", data); // Log fetched data

        // Assuming the API returns user data with name, phone, email fields
        setFormData({
          name: data.name || "",
          phone: data.phone || "",
          email: data.email || "",
        });
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
      const userId = getUserIdFromToken();
      try {
        const response = await axios.patch(
          `https://ip-tienda-han-backend.onrender.com/api/edituser/${userId}`,
          { name: formData.name, email: formData.email, phone: formData.phone }
        );
        console.log("User updated successfully:", response.data);
      } catch (error) {
        console.error("Error updating user:", error);
      }
    }
  };

  return (
    <div className="account-settings">
      <div className="account-settings-container">
        <h1 className="account-settings__heading">Personal Information</h1>

        {formSubmitted && (
          <p className="account-settings__success">
            Changes saved successfully!
          </p>
        )}

        <form className="account-settings__form" onSubmit={handleSubmit}>
          <div className="account-settings__form-group">
            <label htmlFor="name">
              Your Name <span>*</span>
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              aria-required="true"
            />
            {formErrors.name && (
              <span className="account-settings__error">{formErrors.name}</span>
            )}
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
            <label htmlFor="email">
              Email <span>*</span>
            </label>
            <input
              type="email" // Change to email type
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              aria-required="true"
            />
            {formErrors.email && (
              <span className="account-settings__error">
                {formErrors.email}
              </span>
            )}
          </div>

          <button className="account-settings__button" type="submit">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default AccountSettings;
