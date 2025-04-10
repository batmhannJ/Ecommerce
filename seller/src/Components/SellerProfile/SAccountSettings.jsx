import React, { useState, useEffect } from "react";
import "./SAccountSettings.css";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import upload_area from "../../assets/upload_area.png";

const SAccountSettings = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    shopName: "",
    businessLocation: "",
    idPicture: "",
    password: "",
  });
  const [image, setImage] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const imageHandler = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setFormData((prev) => ({
      ...prev,
      idPicture: file,
    }));
  };

  const getUserIdFromToken = () => {
    const authToken = localStorage.getItem("admin_token");
    if (authToken) {
      try {
        const payload = JSON.parse(atob(authToken.split(".")[1]));
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
        const response = await axios.get(`http://localhost:4000/api/seller/approved/${userId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        const { name, phone, email, shopName, businessLocation, idPicture } = response.data;
        setFormData({ name, phone, email, shopName, businessLocation, idPicture, password: "" });
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
    if (!formData.shopName) errors.shopName = "Shop Name is required";
    if (!formData.businessLocation) errors.businessLocation = "Business Address is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setFormSubmitted(true);
      const adminId = getUserIdFromToken();

      let formDataUpload = new FormData();
      formDataUpload.append("name", formData.name);
      formDataUpload.append("email", formData.email);
      formDataUpload.append("phone", formData.phone);
      formDataUpload.append("shopName", formData.shopName);
      formDataUpload.append("businessLocation", formData.businessLocation);

      if (image) {
        formDataUpload.append("idPicture", image);
      }

      if (formData.password) {
        formDataUpload.append("password", formData.password);
      }

      try {
        const response = await axios.patch(
          `http://localhost:4000/api/editseller/${adminId}`,
          formDataUpload,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
              "Content-Type": "multipart/form-data",
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
                placeholder="Enter your name"
              />
              {formErrors.name && <span className="account-settings__error">{formErrors.name}</span>}
            </div>

            <div className="account-settings__form-group">
              <label htmlFor="phone">Phone/Mobile <span>*</span></label>
              <input
                type="tel"
                name="phone"
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                onInput={(e) => {
                  let value = e.target.value.replace(/[^0-9]/g, "");
                  if (value.length > 0) {
                    value = "9" + value.slice(1);
                  }
                  e.target.value = value.slice(0, 10);
                }}
                maxLength="10"
                aria-required="true"
                placeholder="9XXXXXXXXX"
              />
              {formErrors.phone && (
                <span className="account-settings__error">{formErrors.phone}</span>
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
                placeholder="Enter your email"
              />
              {formErrors.email && <span className="account-settings__error">{formErrors.email}</span>}
            </div>

            <div className="account-settings__form-group">
              <label htmlFor="shopName">Shop Name <span>*</span></label>
              <input
                type="text"
                name="shopName"
                id="shopName"
                value={formData.shopName}
                onChange={handleChange}
                aria-required="true"
                placeholder="Enter shop name"
              />
              {formErrors.shopName && <span className="account-settings__error">{formErrors.shopName}</span>}
            </div>

            <div className="account-settings__form-group">
              <label htmlFor="businessLocation">Business Address <span>*</span></label>
              <input
                type="text"
                name="businessLocation"
                id="businessLocation"
                value={formData.businessLocation}
                onChange={handleChange}
                aria-required="true"
                placeholder="Enter business address"
              />
              {formErrors.businessLocation && (
                <span className="account-settings__error">{formErrors.businessLocation}</span>
              )}
            </div>

            <div className="account-settings__form-group upload-group">
              <label htmlFor="file-input">ID Picture</label>
              <div className="image-upload-container">
                <label htmlFor="file-input">
                  <img
                    src={image ? URL.createObjectURL(image) : upload_area}
                    className="addproduct-thumbnail-img"
                    alt="ID Picture Preview"
                  />
                </label>
                <input
                  onChange={imageHandler}
                  type="file"
                  name="idPicture"
                  id="file-input"
                  accept="image/*"
                  hidden
                />
              </div>
            </div>

            <div className="account-settings__form-group password-group">
              <label htmlFor="password">Password <span>(optional)</span></label>
              <div className="password-container">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="password-input"
                  placeholder="Enter new password"
                />
                <span
                  className="eye-icon"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {formErrors.password && (
                <span className="account-settings__error">{formErrors.password}</span>
              )}
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