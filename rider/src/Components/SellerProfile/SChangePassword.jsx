import React, { useState, useEffect } from "react";
import "./ChangePassword.css";

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const initialPassword = localStorage.getItem("password");
  }, []);

  const handleSaveChanges = () => {
    const storedPassword = localStorage.getItem("password") || "";

    if (oldPassword === storedPassword) {
      localStorage.setItem("password", newPassword);
      setMessage("Password change successful!");
    } else {
      setMessage("Old password is incorrect.");
    }
  };

  return (
    <div className="change-password">
      <div className="change-password-container">
        <h1 className="change-password__heading">Change Password</h1>

        <form
          className="change-password__form"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="change-password__form-group">
            <label htmlFor="oldpass">
              Old Password <span>*</span>
            </label>
            <input
              type="password"
              id="oldpass"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              aria-required="true"
            />
          </div>

          <div className="change-password__form-group">
            <label htmlFor="newpass">
              New Password <span>*</span>
            </label>
            <input
              type="password"
              id="newpass"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              aria-required="true"
            />
          </div>

          <button
            className="change-password__button"
            onClick={handleSaveChanges}
          >
            Save Changes
          </button>
        </form>

        {message && <p className="change-password__message">{message}</p>}
      </div>
    </div>
  );
};

export default ChangePassword;
