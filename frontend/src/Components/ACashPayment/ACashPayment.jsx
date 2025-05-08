import React, { useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./ACashPayment.css";
import { ShopContext } from "../../Context/ShopContext";

const secureApi = axios.create({
  baseURL: "https://acashapi.isynergiesinc.online",
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Function to generate ACash token and properly set up axios interceptors
const generateACashToken = async () => {
  try {
    // Direct API call without the interceptor to avoid circular dependency
    const response = await axios.post(
      "https://acashapi.isynergiesinc.online/auth/getToken", 
      {
        authuser: "userbizgo",
        authkey: "bizgo2025"
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data && response.data.token) {
      // Extract the actual token value (remove 'Bearer ' prefix if present)
      const tokenValue = response.data.token.startsWith('Bearer ') 
        ? response.data.token.substring(7) 
        : response.data.token;
      
      // Store the token value only (without Bearer prefix)
      sessionStorage.setItem("acash_token", tokenValue);
      localStorage.setItem("acash_token", tokenValue);
      
      console.log("ACash token generated successfully");
      
      // Set up the interceptor with the new token
      setupInterceptors();
      
      return tokenValue;
    } else {
      console.error("Failed to generate ACash token - no token in response");
      return null;
    }
  } catch (error) {
    console.error("Error generating ACash token:", error.response?.data || error.message);
    return null;
  }
};

// Set up axios interceptors separately to avoid initialization issues
const setupInterceptors = () => {
  // Clear existing interceptors if any
  secureApi.interceptors.request.handlers = [];
  
  // Add the request interceptor
  secureApi.interceptors.request.use(
    (config) => {
      const token = sessionStorage.getItem("acash_token") || localStorage.getItem("acash_token");
      if (token) {
        // Add Bearer prefix here when sending in header
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
};

// Initialize interceptors when module loads
setupInterceptors();

const ACashPayment = () => {
  const [currentStep, setCurrentStep] = useState("login");
  const [email, setEmail] = useState(""); // Changed username to email
  const [password, setPassword] = useState(""); 
  const [otp, setOtp] = useState("");
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(120); // 2 minute countdown
  const [resendDisabled, setResendDisabled] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  
  const { getTotalCartAmount, all_product, cartItems, clearCart } =
      useContext(ShopContext);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const amount = queryParams.get("amount") || 0;
  const referenceNumber = queryParams.get("reference") || "";
  
  const cartDetails = JSON.parse(localStorage.getItem("cartDetails") || "[]");
  const deliveryFee = localStorage.getItem("deliveryFee") || 0;
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");

  // Function to request OTP with token
  const requestOTPWithToken = async () => {
    try {
      console.log("Requesting OTP with token...");
      
      // Log the authorization header that will be sent (for debugging)
      const token = sessionStorage.getItem("acash_token") || localStorage.getItem("acash_token");
      console.log("Using token for request:", token);
      
      // Request OTP with the token and user's email and password
      const response = await secureApi.post("/acash/requestOTP", {
        "Email": email,  // Use the email from input field
        "Password": password  // Use the password from input field
      });
      
      console.log("OTP request response:", response.data);
      
      // If success is true OR message indicates OTP was sent, proceed to OTP verification
      if ((response.data && response.data.success) || 
          (response.data && response.data.message && response.data.message.includes("OTP has been sent"))) {
        console.log("OTP requested successfully");
        toast.success("OTP has been sent to your email");
        setCurrentStep("otp");
        setCountdown(120);
        setResendDisabled(true);
        return true;
      } else {
        console.error("Failed to request OTP:", response.data);
        toast.error("Failed to request OTP. Please try again.");
        return false;
      }
    } catch (error) {
      console.error("Error requesting OTP:", error.response?.data || error.message);
      
      // Check if the error is due to missing required fields
      if (error.response?.data?.required_fields) {
        toast.error(`Missing required fields: ${error.response.data.required_fields}`);
      } else {
        toast.error(`Error: ${error.response?.data?.message || "Failed to request OTP"}`);
      }
      return false;
    }
  };
  
  // Initialize countdown timer
  useEffect(() => {
    let timer;
    if (currentStep === "otp" && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [currentStep, countdown]);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
        toast.error("Please enter both email and password");
        return;
    }

    setLoading(true);

    try {
        // Use the generateACashToken function to get and store the token
        const token = await generateACashToken();
        
        if (!token) {
            toast.error("Failed to authenticate. Please try again.");
            setLoading(false);
            return;
        }
        
        // Request OTP directly using the form-entered values
        try {
          console.log("Requesting OTP after login...");
          const response = await secureApi.post("/acash/requestOTP", {
            "Email": email,  // Use the email from input field
            "Password": password  // Use the password from input field
          });
          
          console.log("OTP Response after login:", response.data);
          
          // If success is true OR message indicates OTP was sent, proceed to OTP verification
          if ((response.data && response.data.success) || 
              (response.data && response.data.message && response.data.message.includes("OTP has been sent"))) {
              toast.success("Login successful! OTP has been sent to your email.");
              setCurrentStep("otp");
              setCountdown(120);
              setResendDisabled(true);
          } else {
              toast.error("Failed to request OTP. Please try again.");
          }
        } catch (otpError) {
          console.error("OTP request error:", otpError.response?.data || otpError.message);
          
          // Check if the error is due to missing required fields
          if (otpError.response?.data?.required_fields) {
            toast.error(`Missing required fields: ${otpError.response.data.required_fields}`);
          }
          // If we get 401 Unauthorized, try refreshing the token and trying again
          else if (otpError.response && otpError.response.status === 401) {
            toast.warning("Session expired. Refreshing authentication...");
            
            // Try generating a new token and requesting OTP again
            const newToken = await generateACashToken();
            if (newToken) {
              try {
                const retryResponse = await secureApi.post("/acash/requestOTP", {
                  "Email": email,  // Use the email from input field
                  "Password": password  // Use the password from input field
                });
                // If success is true OR message indicates OTP was sent, proceed to OTP verification
                if ((retryResponse.data && retryResponse.data.success) || 
                    (retryResponse.data && retryResponse.data.message && retryResponse.data.message.includes("OTP has been sent"))) {
                  toast.success("Login successful! OTP has been sent to your email.");
                  setCurrentStep("otp");
                  setCountdown(120);
                  setResendDisabled(true);
                } else {
                  toast.error("Authentication failed. Please try again later.");
                }
              } catch (retryError) {
                console.error("Retry OTP error:", retryError.response?.data || retryError.message);
                toast.error("Could not request OTP. Please try again later.");
              }
            } else {
              toast.error("Authentication failed. Please try again later.");
            }
          } else {
            toast.error(`Error: ${otpError.response?.data?.message || "Failed to request OTP"}`);
          }
        }
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      if (error.response) {
        if (error.response.status === 401) {
          toast.error("Invalid credentials. Please try again.");
        } else {
          toast.error(`Error: ${error.response.data.message || "Failed to login"}`);
        }
      } else {
        toast.error("Network error. Please check your connection.");
      }
    } finally {
        setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await secureApi.post("/acash/verifyOTP", {
        Email: email,
        OTP: otp
      });
      
      console.log("Verify OTP response:", response.data);
      
      // Check for success - directly checking the response.data.status property
      if (response.data && 
          (response.data.status === "success" || response.data.success === true)) {
        toast.success("OTP verified successfully!");
        
        // Set to payment confirmation step
        setCurrentStep("payment-confirm");
      } else {
        // This block should not be reached with your sample response
        toast.error("Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("OTP verification error:", error.response?.data || error.message);
      
      if (error.response) {
        if (error.response.status === 401) {
          toast.error("Invalid or expired OTP. Please try again.");
        } else {
          toast.error(`Error: ${error.response.data.message || "Failed to verify OTP"}`);
        }
      } else {
        toast.error("Network error. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };
  const processPayment = async () => {
    setLoading(true);
    setPaymentProcessing(true);
    
    try {
      const items = cartDetails.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        size: item.size || "N/A"
      }));
      
      items.push({
        name: "Delivery Fee",
        quantity: 1,
        price: parseFloat(deliveryFee),
        size: "N/A"
      });
      
      const totalAmount = cartDetails.reduce(
        (sum, item) => sum + item.price * item.quantity, 
        0
      ) + parseFloat(deliveryFee);
      
      const backendApi = axios.create({
        baseURL: process.env.REACT_APP_API_URL || "https://api.bizgo.com",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem("acash_token")}`
        }
      });
      
      const paymentData = {
        referenceNumber: referenceNumber,
        amount: totalAmount,
        customerName: `${userData.firstName} ${userData.lastName}`,
        customerEmail: userData.email,
        customerPhone: userData.phone,
        items: items,
        deliveryAddress: `${userData.street}, ${userData.city}, ${userData.state}, ${userData.zipcode}`
      };
      
      console.log("Processing payment with data:", paymentData);
      
      const response = await backendApi.post(
        "/api/payments/process",
        paymentData
      );
      
      if (response.data && response.data.success) {
        setTransactionDetails({
          transactionId: response.data.transactionId || referenceNumber,
          date: new Date().toLocaleString(),
          status: "Completed",
          amount: totalAmount,
          items: items
        });
        
        const userId = localStorage.getItem("userId");
        const transactionData = {
          transactionId: response.data.transactionId || referenceNumber,
          date: new Date(),
          name: `${userData.firstName} ${userData.lastName}`,
          contact: userData.phone,
          email: userData.email,
          item: items.map(item => item.name).join(", "),
          quantity: items.reduce((sum, item) => sum + item.quantity, 0),
          amount: totalAmount,
          deliveryFee: parseFloat(deliveryFee),
          address: `${userData.street}, ${userData.city}, ${userData.state}, ${userData.zipcode}`,
          status: "Payment Completed",
          userId: userId,
          riderId: localStorage.getItem("riderId") || "unassigned",
          markupValue: cartDetails.reduce(
            (sum, item) => sum + (item.markup_value || 0) * item.quantity,
            0
          ),
          deliveryComm: parseFloat(deliveryFee) * 0.2,
          paymentMethod: "ACash"
        };
        
        console.log("Saving transaction data:", transactionData);
        
        await backendApi.post(
          "/api/transactions",
          transactionData
        );
        
        await backendApi.post("/api/updateStock", {
          updates: cartDetails.map((item) => ({
            id: item.id.toString(),
            size: item.size,
            quantity: item.quantity,
          })),
        });
        
        localStorage.removeItem("cartDetails");
        if (typeof clearCart === 'function') {
          clearCart();
        }
        
        // Clean up tokens
        sessionStorage.removeItem("acash_token");
        localStorage.removeItem("acash_token");
        
        setCurrentStep("success");
        toast.success("Payment successful!");
      } else {
        toast.error("Payment processing failed. Please try again.");
        setPaymentProcessing(false);
      }
    } catch (error) {
      console.error("Payment processing error:", error.response?.data || error.message);
      
      if (error.response) {
        toast.error(`Error: ${error.response.data.message || "Payment failed"}`);
      } else {
        toast.error("Network error. Please check your connection.");
      }
      setPaymentProcessing(false);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendDisabled) return;
    
    setLoading(true);
    setResendDisabled(true);
    
    try {
      // Refresh token before requesting OTP again
      const newToken = await generateACashToken();
      
      if (!newToken) {
        toast.error("Failed to refresh authentication. Please try logging in again.");
        setLoading(false);
        setResendDisabled(false);
        return;
      }
      
      const response = await secureApi.post("/acash/requestOTP", {
        "Email": email,  // Use the email from input field
        "Password": password  // Use the password from input field
      });
      
      console.log("Resend OTP response:", response.data);
      
      // If success is true OR message indicates OTP was sent, consider it successful
      if ((response.data && response.data.success) || 
          (response.data && response.data.message && response.data.message.includes("OTP has been sent"))) {
        toast.success("OTP has been resent to your email.");
        setCountdown(120);
      } else {
        toast.error("Failed to resend OTP. Please try logging in again.");
        setResendDisabled(false);
      }
    } catch (error) {
      console.error("Resend OTP error:", error.response?.data || error.message);
      toast.error("Failed to resend OTP. Please try logging in again.");
      setResendDisabled(false);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    navigate("/myorders");
  };
  
  const handleCancel = () => {
    sessionStorage.removeItem("acash_token");
    localStorage.removeItem("acash_token");
    navigate("/cart");
  };

  return (
    <div className="acash-payment-container">
      <div className="acash-payment-card">
        <div className="acash-payment-header">
          <h2>BizGo Payment</h2>
          <div className="acash-payment-steps">
            <div className={`step ${currentStep === "login" ? "active" : ""} ${currentStep === "otp" || currentStep === "payment-confirm" || currentStep === "success" ? "completed" : ""}`}>
              <div className="step-number">1</div>
              <span>Login</span>
            </div>
            <div className="step-connector"></div>
            <div className={`step ${currentStep === "otp" ? "active" : ""} ${currentStep === "payment-confirm" || currentStep === "success" ? "completed" : ""}`}>
              <div className="step-number">2</div>
              <span>Verify OTP</span>
            </div>
            <div className="step-connector"></div>
            <div className={`step ${currentStep === "payment-confirm" ? "active" : ""} ${currentStep === "success" ? "completed" : ""}`}>
              <div className="step-number">3</div>
              <span>Payment</span>
            </div>
            <div className="step-connector"></div>
            <div className={`step ${currentStep === "success" ? "active" : ""}`}>
              <div className="step-number">4</div>
              <span>Complete</span>
            </div>
          </div>
        </div>

        <div className="acash-payment-body">
          {currentStep === "login" && (
            <form onSubmit={handleLogin} className="acash-login-form">
              <div className="payment-info">
                <h3>Payment Amount</h3>
                <p className="payment-amount">₱ {parseFloat(amount).toFixed(2)}</p>
                <p className="payment-reference">Order: {referenceNumber}</p>
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
              
              <div className="acash-payment-actions">
                <button 
                  type="button" 
                  onClick={handleCancel} 
                  className="cancel-button"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="login-button"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Login"}
                </button>
              </div>
            </form>
          )}
          
          {currentStep === "otp" && (
            <form onSubmit={handleVerifyOTP} className="acash-otp-form">
              <div className="payment-info">
                <h3>Payment Amount</h3>
                <p className="payment-amount">₱ {parseFloat(amount).toFixed(2)}</p>
                <p className="payment-reference">Order: {referenceNumber}</p>
              </div>
              
              <div className="form-group">
                <label htmlFor="otp">Enter OTP</label>
                <div className="otp-description">
                  A 6-digit code has been sent to your email address
                </div>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  required
                />
                <div className="otp-timer">
                  Time remaining: {formatTime(countdown)}
                </div>
                <div className="resend-otp-container">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className={`resend-otp-button ${resendDisabled ? 'disabled' : ''}`}
                    disabled={resendDisabled}
                  >
                    Resend OTP
                  </button>
                </div>
              </div>
              
              <div className="acash-payment-actions">
                <button 
                  type="button" 
                  onClick={handleCancel} 
                  className="cancel-button"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="verify-button"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Verify OTP"}
                </button>
              </div>
            </form>
          )}
          
          {/* New payment confirmation step */}
          {currentStep === "payment-confirm" && (
            <div className="acash-payment-confirm">
              <div className="payment-info">
                <h3>Confirm Payment</h3>
                <p className="payment-amount">₱ {parseFloat(amount).toFixed(2)}</p>
                <p className="payment-reference">Order: {referenceNumber}</p>
              </div>
              
              <div className="order-summary">
                <h4>Order Summary</h4>
                <div className="order-items">
                  {cartDetails.map((item, index) => (
                    <div key={index} className="item-row">
                      <div className="item-details">
                        <span className="item-name">{item.name}</span>
                        {item.size && <span className="item-size">Size: {item.size}</span>}
                      </div>
                      <div className="item-quantity-price">
                        <span>{item.quantity} x ₱{parseFloat(item.price).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                  <div className="item-row delivery-fee">
                    <div className="item-details">
                      <span className="item-name">Delivery Fee</span>
                    </div>
                    <div className="item-price">
                      <span>₱{parseFloat(deliveryFee).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="order-total">
                  <span>Total:</span>
                  <span>₱ {parseFloat(amount).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="customer-details">
                <h4>Delivery Details</h4>
                <div className="detail-row">
                  <span>Name:</span>
                  <span>{userData.firstName} {userData.lastName}</span>
                </div>
                <div className="detail-row">
                  <span>Contact:</span>
                  <span>{userData.phone}</span>
                </div>
                <div className="detail-row">
                  <span>Address:</span>
                  <span>{userData.street}, {userData.city}, {userData.state}, {userData.zipcode}</span>
                </div>
              </div>
              
              <div className="acash-payment-actions">
                <button 
                  type="button" 
                  onClick={handleCancel} 
                  className="cancel-button"
                  disabled={loading || paymentProcessing}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={processPayment} 
                  className="confirm-button"
                  disabled={loading || paymentProcessing}
                >
                  {loading || paymentProcessing ? "Processing..." : "Confirm Payment"}
                </button>
              </div>
            </div>
          )}
          
          {currentStep === "success" && transactionDetails && (
            <div className="acash-success">
              <div className="success-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              
              <h3>Payment Successful!</h3>
              
              <div className="transaction-details">
                <div className="detail-row">
                  <span>Transaction ID:</span>
                  <span>{transactionDetails.transactionId}</span>
                </div>
                <div className="detail-row">
                  <span>Date:</span>
                  <span>{transactionDetails.date}</span>
                </div>
                <div className="detail-row">
                  <span>Amount:</span>
                  <span>₱ {parseFloat(transactionDetails.amount).toFixed(2)}</span>
                </div>
                <div className="detail-row">
                  <span>Status:</span>
                  <span className="status-completed">{transactionDetails.status}</span>
                </div>
              </div>
              
              <h4>Items</h4>
              <div className="transaction-items">
                {transactionDetails.items.map((item, index) => (
                  <div key={index} className="item-row">
                    <div className="item-details">
                      <span className="item-name">{item.name}</span>
                      {item.name !== "Delivery Fee" && (
                        <span className="item-size">Size: {item.size}</span>
                      )}
                    </div>
                    <div className="item-quantity-price">
                      <span>{item.quantity} x ₱{parseFloat(item.price).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="acash-payment-actions">
                <button 
                  type="button" 
                  onClick={handleFinish} 
                  className="finish-button"
                >
                  View My Orders
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ACashPayment;