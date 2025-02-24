import React, { useState } from "react";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import ReCAPTCHA from "react-google-recaptcha";
import "./CSS/LoginSignup.css";

const LoginSignup = () => {
  const [recaptchaToken, setRecaptchaToken] = useState(null); // State to store reCAPTCHA token

  // Handler for when reCAPTCHA is completed
  const onRecaptchaChange = (token) => {
    setRecaptchaToken(token);
  };

  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [emailForReset, setEmailForReset] = useState(""); // For forgot password
  const [otpSentForReset, setOtpSentForReset] = useState(false); // Flag to show OTP field for reset password
  const [resetPasswordForm, setResetPasswordForm] = useState({
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [state, setState] = useState("Login");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    phone: "", // Add phone to formData
    otp: "",
    newPassword: "",
    confirmPassword: "",
    agreed: false,
    recaptchaToken: "",
  });

  const [otpSent, setOtpSent] = useState(false);

  // New state variables for error messages
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // New state variable to handle password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () => {
    console.log("Toggling password visibility");
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    console.log("Toggling password visibility");
    setShowConfirmPassword((prev) => !prev);
  };

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const checkboxHandler = () => {
    setFormData({ ...formData, agreed: !formData.agreed });
  };

  // Send OTP to user's email
  const sendOtp = async () => {
    if (!formData.email) {
      toast.error("Please enter your email address.");
      return;
    }

    try {
      const response = await fetch("https://ip-tienda-han-backend.onrender.com/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("OTP sent to your email.");
        setOtpSent(true); // Show the OTP input field
        setEmailError(""); // Clear any previous errors
      } else {
        toast.error(data.errors);
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Failed to send OTP.");
    }
  };

  const verifyOtp = async () => {
    if (!formData.otp) {
      toast.error("Please enter the OTP.");
      return;
    }

    try {
      const response = await fetch("https://ip-tienda-han-backend.onrender.com/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp,
          phone: formData.phone,
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Signup successful! Please log in.");
        setState("Login"); // Switch to login state
        setOtpSent(false); // Reset OTP sent state when switching to login
      } else {
        toast.error(data.errors);
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Failed to verify OTP.");
    }
  };

  const verifyOtpAndResetPassword = async () => {
    const { otp, newPassword, confirmPassword } = resetPasswordForm;

    if (!otp || !newPassword || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch("https://ip-tienda-han-backend.onrender.com/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailForReset,
          otp,
          newPassword,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Password successfully changed!");
        //localStorage.setItem("auth-token", data.token);
        console.log("Before setState:", state);
        setState("Login");
        console.log("Navigating to Login...");
        // Redirect explicitly if needed
        window.location.replace("/login");
        console.log("After setState:", state);
      } else {
        toast.error(data.errors);
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("Failed to reset password.");
    }
  };

  // Send OTP for password reset
  const sendPasswordResetEmail = async () => {
    if (!emailForReset) {
      toast.error("Please enter your email address.");
      return;
    }

    try {
      const response = await fetch("https://ip-tienda-han-backend.onrender.com/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailForReset }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success("OTP sent to your email.");
          setOtpSentForReset(true); // Show OTP input field for reset password
        } else {
          toast.error(data.errors);
        }
      } else {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        toast.error("Failed to send password reset email.");
      }
    } catch (error) {
      console.error("Error sending reset password email:", error);
      toast.error("Failed to send password reset email.");
    }
  };

  const handleResetPasswordFormChange = (e) => {
    setResetPasswordForm({
      ...resetPasswordForm,
      [e.target.name]: e.target.value,
    });
  };

  const login = async () => {
    if (!formData.agreed) {
      toast.error("Please agree to the terms of use & privacy policy.", {
        position: "top-left",
      });
      return;
    }

    if (!recaptchaToken) {
      toast.error("Please complete the CAPTCHA.", {
        position: "top-left",
      });
      return;
    }

    try {
      const response = await fetch("https://ip-tienda-han-backend.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          recaptchaToken: recaptchaToken,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        toast.error(data.errors);
      } else {
        toast.success("Login successful!");
        localStorage.setItem("auth-token", data.token); // Store token
        localStorage.setItem("userId", data.userId); // Store user ID
        window.location.replace("/");
      }
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  const signup = async () => {
    if (!formData.agreed) {
      toast.error("Please agree to the terms of use & privacy policy.", {
        position: "top-left",
      });
      return;
    }

    console.log("Signup Function Executed", formData);
    let responseData;
    await fetch("https://ip-tienda-han-backend.onrender.com/signup", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => (responseData = data));

    if (responseData.success) {
      toast.success("Signup successful! Please log in.");
      setState("Login"); // Switch to login state
    } else {
      toast.error(responseData.errors, {
        position: "top-left",
      });
    }
  };

  return (
    <div className="loginsignup">
      <div className="loginsignup-container">
        <h1>{forgotPasswordMode ? "Forgot Password" : state}</h1>
        {forgotPasswordMode ? (
          <div className="loginsignup-fields">
            {!otpSentForReset ? (
              <>
                <input
                  name="emailForReset"
                  value={emailForReset}
                  onChange={(e) => setEmailForReset(e.target.value)}
                  type="email"
                  placeholder="Email Address"
                />
                {emailError && <p className="error-message">{emailError}</p>}
                <button onClick={sendPasswordResetEmail}>Send OTP</button>
              </>
            ) : (
              <>
                <input
                  name="otp"
                  value={resetPasswordForm.otp}
                  onChange={handleResetPasswordFormChange}
                  type="text"
                  placeholder="Enter OTP"
                />
                <div
                  className="password-container"
                  style={{ position: "relative" }}
                >
                  <input
                    name="newPassword"
                    value={resetPasswordForm.newPassword}
                    onChange={handleResetPasswordFormChange}
                    //type={showPassword ? "text" : "password"}
                    placeholder="New Password"
                  />
                  <span
                    className="eye-icon"
                    onClick={togglePasswordVisibility}
                    style={{
                      cursor: "pointer",
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}{" "}
                    {/* Toggle eye icon */}
                  </span>
                </div>
                {/* Confirm Password Input */}
                <div
                  className="password-container"
                  style={{ position: "relative" }}
                >
                  <input
                    name="confirmPassword"
                    value={resetPasswordForm.confirmPassword}
                    onChange={handleResetPasswordFormChange}
                    //type={showPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                  />
                  <span
                    className="eye-icon"
                    onClick={toggleConfirmPasswordVisibility}
                    style={{
                      cursor: "pointer",
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
                <button onClick={verifyOtpAndResetPassword}>
                  Reset Password
                </button>
              </>
            )}
            <p
              onClick={() => setForgotPasswordMode(false)}
              className="loginsignup-login"
            >
              Back to Login
            </p>
          </div>
        ) : (
          <>
            <div className="loginsignup-fields">
              {state === "Sign Up" ? (
                <input
                  name="username"
                  value={formData.username}
                  onChange={changeHandler}
                  type="text"
                  placeholder="Your Name"
                />
              ) : null}
              <input
                name="email"
                value={formData.email}
                onChange={changeHandler}
                type="email"
                placeholder="Email Address"
              />
              {/* Phone number input field */}
              {/* Phone number input field */}
{state === "Sign Up" && (
  <div className="phone-number-container">
    <span className="country-code">+63</span>
    <input
      name="phone"
      value={formData.phone}
      onChange={changeHandler}
      onInput={(e) => {
        // Remove non-numeric characters
        e.target.value = e.target.value.replace(/[^0-9]/g, '');

        // Ensure the phone number starts with '9' and is 10 digits long (excluding country code)
        if (e.target.value.length > 10) {
          e.target.value = e.target.value.slice(0, 10);
        }
        if (e.target.value && e.target.value[0] !== '9') {
          e.target.value = '9' + e.target.value.slice(1);
        }
      }}
      type="tel"
      placeholder="Phone Number"
      maxLength="10"
      aria-required="true"
    />
  </div>
)}

              <div
                className="password-container"
                style={{ position: "relative" }}
              >
                <input
                  name="password"
                  value={formData.password}
                  onChange={changeHandler}
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                />
                <span
                  className="eye-icon"
                  onClick={togglePasswordVisibility}
                  style={{
                    cursor: "pointer",
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              {otpSent && (
                <input
                  name="otp"
                  value={formData.otp}
                  onChange={changeHandler}
                  type="text"
                  placeholder="Enter OTP"
                />
              )}
            </div>
            {state === "Login" && (
              <>
                <div className="recaptcha-container">
                  <div className="recaptcha-description">
                    Please verify you are human
                  </div>
                  <ReCAPTCHA
                    sitekey="6LcCKEcqAAAAAF8ervh2kGqovSNLl1B9L02UZBhD"
                    onChange={onRecaptchaChange}
                  />
                </div>

                <p
                  className="forgot-password"
                  onClick={() => setForgotPasswordMode(true)}
                >
                  Forgot Password?
                </p>
              </>
            )}

            <button
              onClick={() => {
                if (state === "Sign Up" && !formData.agreed) {
                  alert("Please agree to the terms of use & privacy policy before continuing.");
                  return; // Prevent sending OTP if checkbox is unchecked
                }
                state === "Login"
                  ? login() // Only CAPTCHA verification for Login
                  : otpSent
                  ? verifyOtp()
                  : sendOtp(); // OTP verification for Sign Up
              }}
            >
              Continue
            </button>
            {state === "Sign Up" ? (
              <p className="loginsignup-login">
                Already have an account?{" "}
                <span
                  onClick={() => {
                    setState("Login");
                  }}
                >
                  Login
                </span>
              </p>
            ) : (
              <p className="loginsignup-login">
                Create an account?{" "}
                <span
                  onClick={() => {
                    setState("Sign Up");
                  }}
                >
                  Sign Up
                </span>
              </p>
            )}
            <div className="loginsignup-agree">
              <input
                type="checkbox"
                name="agreed"
                checked={formData.agreed}
                onChange={checkboxHandler}
              />
              <p>By continuing I agree to the <a href="Terms">terms of use & privacy policy</a></p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginSignup;
