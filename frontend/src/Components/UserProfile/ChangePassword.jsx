import React, { useState, useEffect } from "react";
import "./ChangePassword.css";
import axios from "axios";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  let fetchedUser = null;
  let oldPasswordCheck = false;
  const toggleShowPassword = (field) => {
    setShowPasswords((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };
  const getUserIdFromToken = () => {
    const authToken = localStorage.getItem("auth-token");
    if (authToken) {
      const payload = JSON.parse(atob(authToken.split(".")[1]));
      return payload.user.id;
    }
    return null;
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();

    const userId = getUserIdFromToken();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const userResponse = await fetch(
        `https://ip-tienda-han-backend.onrender.com/fetchuser/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const fetchedUser = await userResponse.json();

      if (oldPassword !== fetchedUser.password) {
        toast.error("Incorrect password");
        return;
      }
      toast.success("Password changed successfully");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      const updateResponse = await fetch(
        `https://ip-tienda-han-backend.onrender.com/updatepassword/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password: newPassword }),
        }
      );

      if (updateResponse.ok) {
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const errorData = await updateResponse.json();
        toast.error(errorData.message);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred while changing the password.");
    }
  };

  return (
    <div className="change-password">
      <div className="change-password-container">
        <h1 className="change-password__heading">Change Password</h1>

        <form className="change-password__form" onSubmit={handleSaveChanges}>
          {/* Old Password */}
          <div className="change-password__form-group">
            <input
              type={showPasswords.oldPassword ? "text" : "password"}
              id="oldpass"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Old Password"
              aria-required="true"
            />
            <span
              className="password-toggle-icon"
              onClick={() => toggleShowPassword("oldPassword")}
            >
              {showPasswords.oldPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* New Password */}
          <div className="change-password__form-group">
            <input
              type={showPasswords.newPassword ? "text" : "password"}
              id="newpass"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
              aria-required="true"
            />
            <span
              className="password-toggle-icon"
              onClick={() => toggleShowPassword("newPassword")}
            >
              {showPasswords.newPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Confirm Password */}
          <div className="change-password__form-group">
            <input
              type={showPasswords.confirmPassword ? "text" : "password"}
              id="confirmpass"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              aria-required="true"
            />
            <span
              className="password-toggle-icon"
              onClick={() => toggleShowPassword("confirmPassword")}
            >
              {showPasswords.confirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button className="change-password__button" type="submit">
            Save Changes
          </button>
        </form>

        {message && <p className="change-password__message">{message}</p>}
      </div>
    </div>
  );
};

export default ChangePassword;
