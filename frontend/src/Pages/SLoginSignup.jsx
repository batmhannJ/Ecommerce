import React, { useState, useEffect } from 'react';
import { sellerSignup, sellerLogin, requestPasswordReset, verifyOtp, resetPassword } from '../services/api';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './CSS/SellerLoginSignup.css'; // Import your CSS file
import axios from 'axios';
import loginImage from "../Components/Assets/askilogo.png"; 
import { regions, provincesByCode, cities, barangays } from 'select-philippines-address';

const SLoginSignup = () => {
  const [formData, setFormData] = useState({
    name: '',
    shopName: '',
    email: '',
    password: '',
    idPicture: null,
    businessLocation: {
      region: '',
      province: '',
      city: '',
      barangay: ''
    },
  });
  
  // States for Philippines address dropdowns
  const [availableRegions, setAvailableRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [citiesList, setCities] = useState([]);
  const [barangaysList, setBarangays] = useState([]);
  
  const [passwordError, setPasswordError] = useState('');
  const [isLogin, setIsLogin] = useState(false);
  const navigate = useNavigate();
  const [forgotPassword, setForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [otpSent, setOtpSent] = useState(false); 
  const [showPassword, setShowPassword] = useState(false);

  // Fetch regions on component mount
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const data = await regions();
        setAvailableRegions(data);
      } catch (error) {
        console.error("Error fetching regions:", error);
        toast.error("Failed to load regions. Please refresh and try again.");
      }
    };

    fetchRegions();
  }, []);

  // Fetch provinces when region is selected
  useEffect(() => {
    const fetchProvinces = async () => {
      if (formData.businessLocation.region) {
        try {
          const provincesData = await provincesByCode(formData.businessLocation.region);
          setProvinces(provincesData);
        } catch (error) {
          console.error("Error fetching provinces:", error);
          toast.error("Failed to load provinces. Please try again.");
        }
      }
    };

    fetchProvinces();
  }, [formData.businessLocation.region]);

  // Fetch cities when a province is selected
  useEffect(() => {
    const fetchCities = async () => {
      if (formData.businessLocation.province) {
        try {
          const citiesData = await cities(formData.businessLocation.province);
          setCities(citiesData);
        } catch (error) {
          console.error("Error fetching cities:", error);
          toast.error("Failed to load cities. Please try again.");
        }
      }
    };

    fetchCities();
  }, [formData.businessLocation.province]);

  // Fetch barangays when a city is selected
  useEffect(() => {
    const fetchBarangays = async () => {
      if (formData.businessLocation.city) {
        try {
          const barangaysData = await barangays(formData.businessLocation.city);
          setBarangays(barangaysData);
        } catch (error) {
          console.error("Error fetching barangays:", error);
          toast.error("Failed to load barangays. Please try again.");
        }
      }
    };

    fetchBarangays();
  }, [formData.businessLocation.city]);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'idPicture') {
      setFormData({ ...formData, idPicture: files[0] });
    } else if (name === 'region' || name === 'province' || name === 'city' || name === 'barangay') {
      // For location fields, update the nested businessLocation object
      setFormData({
        ...formData,
        businessLocation: {
          ...formData.businessLocation,
          [name]: value
        }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z]).{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const { name, shopName, email, password, idPicture, businessLocation } = formData;

    // Check if all required fields are filled
    if (!name || !shopName || !email || !password || !idPicture) {
      toast.error("Please fill out all basic fields.");
      return;
    }

    // Check if location fields are filled
    if (!businessLocation.region || !businessLocation.province || !businessLocation.city) {
      toast.error("Please select your complete business location.");
      return;
    }

    const regionData = availableRegions.find(r => r.region_code === businessLocation.region) || {};
  const provinceData = provinces.find(p => p.province_code === businessLocation.province) || {};
  const cityData = citiesList.find(c => c.city_code === businessLocation.city) || {};
  const barangayData = businessLocation.barangay ? 
    barangaysList.find(b => b.brgy_code === businessLocation.barangay) || {} : {};

  // Format the business location as a string for the backend
  const formattedLocation = `${regionData.region_name || ''}, ${provinceData.province_name || ''}, ${cityData.city_name || ''}${businessLocation.barangay ? `, ${barangayData.brgy_name || ''}` : ''}`;

  const signupData = new FormData();
  signupData.append('name', name);
  signupData.append('shopName', shopName);
  signupData.append('email', email);
  signupData.append('password', password);
  signupData.append('idPicture', idPicture);
  signupData.append('businessLocation', formattedLocation);
  
  // Add structured location data
  signupData.append('businessLocationDetails', JSON.stringify({
    region: {
      code: businessLocation.region,
      name: regionData.region_name
    },
    province: {
      code: businessLocation.province,
      name: provinceData.province_name
    },
    city: {
      code: businessLocation.city,
      name: cityData.city_name
    },
    barangay: businessLocation.barangay ? {
      code: businessLocation.barangay,
      name: barangayData.brgy_name
    } : undefined
  }));


    try {
      const result = await sellerSignup(signupData);
      toast.success('Sign up successful! Waiting for admin approval.');
      navigate('/');
    } catch (error) {
      const errorMessage = error.response?.data; 
      toast.error(errorMessage);
      console.error('Sign up error:', error.response);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const loginData = {
      email: formData.email,
      password: formData.password,
    };

    try {
      const responseData = await sellerLogin(loginData);
      if (!responseData.data.success) {
        toast.error(responseData.data.message || 'Login failed. Please try again.');
        return;
      }

      const seller = responseData.data.seller;
      if (!seller) {
        toast.error('Seller account not found.');
        return;
      }

      if (!seller.isApproved) {
        toast.error('Your account is pending approval from the admin.');
        return;
      }

      localStorage.setItem('admin_token', responseData.data.token);
      toast.success('Login successful! Redirecting to the dashboard...');
      navigate('/addproduct');
      window.location.reload();
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    console.log("Sending OTP for email:", email);

    try {
      const result = await requestPasswordReset(email);
      setOtpSent(true);
      toast.success(result.message || 'OTP sent successfully.');
    } catch (error) {
      console.error("Error sending OTP:", error);
      setMessage(error.response?.data?.errors || 'Error sending OTP');
      toast.error(setMessage);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    console.log('Verifying OTP with data:', { email, otp, newPassword });
  
    try {
      const response = await axios.post('http://localhost:4000/api/seller/verify-otp-seller', {
        email,
        otp,
        newPassword,
      });
  
      console.log('Server response:', response.data);
  
      if (response.data.success) {
        toast.success(response.data.message);
        navigate('/login');
      } else {
        toast.error(response.data.errors || 'Verification failed. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      console.log('Error response:', error.response?.data);
      toast.error(error.response?.data?.errors || 'Error verifying OTP');
    }
  };
  
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !otp) {
      toast.error("Please enter both OTP and new password.");
      return;
    }

    try {
      const result = await resetPassword(email, otp, newPassword);
      if (result.success) {
        toast.success(result.message);
        navigate('/login');
      } else {
        toast.error(result.errors || 'Error resetting password');
      }
    } catch (error) {
      toast.error(error.response?.data?.errors || 'Error resetting password');
    }
  };

  return (
    <div
      className="login-container"
      style={{
        backgroundImage: `url(${loginImage})`,
      }}
    >
     <div className="logincon">
      <div className="login-box1">
        <h1>{isLogin ? "Seller Login" : "Sign up as Seller"}</h1>
  
        {forgotPassword ? (
          <>
            <form onSubmit={handleForgotPassword}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit">Send OTP</button>
            </form>
  
            {otpSent && (
              <form onSubmit={handleVerifyOtp}>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button type="submit">Reset Password</button>
              </form>
            )}
  
            <p>
              Remembered your password?{" "}
              <span
                className="link"
                onClick={() => {
                  setForgotPassword(false);
                  setIsLogin(true);
                }}
              >
                Click here to <b>Login</b>
              </span>
            </p>
          </>
        ) : isLogin ? (
          <form onSubmit={handleLogin}>
            <div>
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <div className="password-container" style={{ position: "relative" }}>
                <label>Password:</label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <span
                  className="eye-icon"
                  onClick={togglePasswordVisibility}
                  style={{
                    cursor: "pointer",
                    position: "absolute",
                    right: "10px",
                    top: "60%",
                    transform: "translateY(-50%)",
                  }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {passwordError && <p className="password-error">{passwordError}</p>}
              <p>
                <span className="link" onClick={() => setForgotPassword(true)}>
                  Forgot Password?
                </span>
              </p>
            </div>
            <button type="submit">Login</button>
            <p>
              Not registered?{" "}
              <span className="link" onClick={() => setIsLogin(false)}>
                Sign up as a <b>Seller</b>
              </span>
            </p>
          </form>
        ) : (
          <form onSubmit={handleSignup}>
            <div className="signup-form-columns">
              {/* First Column - Basic Info */}
              <div>
                <div>
                  <label>Name:</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label>Shop Name:</label>
                  <input
                    type="text"
                    name="shopName"
                    value={formData.shopName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label>Email:</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <div className="password-container" style={{ position: "relative" }}>
                    <label>Password:</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={(e) => {
                        let password = e.target.value;
                        if (password.length > 20) {
                          password = password.slice(0, 20);
                        }
                        handleChange({ target: { name: "password", value: password } });
                        const isValidPassword = validatePassword(password);
                        if (!isValidPassword) {
                          setPasswordError(
                            "Password must be between 8 and 20 characters and contain at least one uppercase letter."
                          );
                        } else {
                          setPasswordError("");
                        }
                      }}
                      required
                    />
                    <span
                      className="eye-icon"
                      onClick={togglePasswordVisibility}
                      style={{
                        cursor: "pointer",
                        position: "absolute",
                        right: "10px",
                        top: "60%",
                        transform: "translateY(-50%)",
                      }}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                  {passwordError && <p className="password-error">{passwordError}</p>}
                </div>
              </div>
  
              {/* Second Column - Additional Info */}
              <div>
                <div className="file-input-container">
                  <label>Valid ID/GOVERNMENT ISSUED:</label>
                  <input
                    type="file"
                    id="idPicture"
                    name="idPicture"
                    onChange={(e) => {
                      handleChange(e);
                      const label = document.querySelector(".file-input-label");
                      if (e.target.files[0]) {
                        label.textContent = e.target.files[0].name;
                        label.classList.add("uploaded");
                      } else {
                        label.textContent = "Choose a file...";
                        label.classList.remove("uploaded");
                      }
                    }}
                    required
                  />
                  <label htmlFor="idPicture" className="file-input-label">
                    <span>Choose a file...</span>
                    <span className="upload-icon">
                      <i className="fas fa-upload"></i>
                    </span>
                  </label>
                </div>
  
                {/* Business Location Section */}
                <div className="location-section">
                  <label>Business Location:</label>
                  <div className="location-field">
                    <select
                      name="region"
                      value={formData.businessLocation.region}
                      onChange={handleChange}
                      required
                      className="location-dropdown"
                    >
                      <option value="">Select Region</option>
                      {availableRegions.map((region) => (
                        <option key={region.region_code} value={region.region_code}>
                          {region.region_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="location-field">
                    <select
                      name="province"
                      value={formData.businessLocation.province}
                      onChange={handleChange}
                      disabled={!formData.businessLocation.region}
                      required
                      className="location-dropdown"
                    >
                      <option value="">Select Province</option>
                      {provinces.map((province) => (
                        <option key={province.province_code} value={province.province_code}>
                          {province.province_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="location-field">
                    <select
                      name="city"
                      value={formData.businessLocation.city}
                      onChange={handleChange}
                      disabled={!formData.businessLocation.province}
                      required
                      className="location-dropdown"
                    >
                      <option value="">Select City/Municipality</option>
                      {citiesList.map((city) => (
                        <option key={city.city_code} value={city.city_code}>
                          {city.city_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="location-field">
                    <select
                      name="barangay"
                      value={formData.businessLocation.barangay}
                      onChange={handleChange}
                      disabled={!formData.businessLocation.city}
                      className="location-dropdown"
                    >
                      <option value="">Select Barangay (Optional)</option>
                      {barangaysList.map((barangay) => (
                        <option key={barangay.brgy_code} value={barangay.brgy_code}>
                          {barangay.brgy_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
  
            <button type="submit" className="signup-button">
              Sign up
            </button>
            <p>
              Already registered?{" "}
              <span className="link" onClick={() => setIsLogin(true)}>
                Log in as a <b>Seller</b>
              </span>
            </p>
          </form>
        )}
      </div>
    </div>
    </div> 
  );
};

export default SLoginSignup;