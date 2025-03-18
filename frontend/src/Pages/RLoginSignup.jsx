import React, { useState } from 'react';
import { sellerSignup, sellerLogin, requestPasswordReset, verifyOtp, resetPassword } from '../services/api';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './CSS/RiderLoginSignup.css'; // Import your CSS file
import axios from 'axios';
import loginImage from "../Components/Assets/askilogo.png"; 


const RLoginSignup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    contactNumber: '',
    idPicture: null,
    driverLicense: null,
    vehicleType: '',
    plateNumber: '',
    vehicleRegistration: null,
    address: '',
  });
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

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'idPicture' || name === 'driverLicense' || name === 'vehicleRegistration') {
      setFormData({ ...formData, [name]: files[0] });
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
    const { 
      name, 
      email, 
      password, 
      contactNumber, 
      idPicture, 
      driverLicense, 
      vehicleType, 
      plateNumber, 
      vehicleRegistration,
      address 
    } = formData;

    if (!name || !email || !password || !contactNumber || !idPicture || !driverLicense || !vehicleType || !plateNumber || !vehicleRegistration || !address) {
      toast.error("Please fill out all fields.");
      return;
    }

    const signUpData = new FormData();
    signUpData.append('name', name);
    signUpData.append('email', email);
    signUpData.append('password', password);
    signUpData.append('contactNumber', contactNumber);
    signUpData.append('address', address);
    signUpData.append('vehicleType', vehicleType);
    signUpData.append('plateNumber', plateNumber);
    
    // Make sure these file input references exist
    signUpData.append('idPicture', idPicture);
    signUpData.append('driverLicense', driverLicense);
    signUpData.append('vehicleRegistration', vehicleRegistration);

    try {
      // Using axios directly until you add the riderSignup function to your api.js
      const response = await axios.post(
        'http://localhost:4000/api/rider/signup', 
        signUpData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'  // This is critical for file uploads
          }
        }
      );
        toast.success('Sign up successful! Waiting for admin approval.');
      navigate('/');
    } catch (error) {
      const errorMessage = error.response?.data?.errors?.[0] || error.response?.data || error.message; 
  
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
      // Using axios directly until you add the riderLogin function to your api.js
      const response = await axios.post('http://localhost:4000/api/rider/login', loginData);
      const responseData = response.data;
      
      if (!responseData.success) {
        toast.error(responseData.message || 'Login failed. Please try again.');
        return;
      }

      const rider = responseData.rider;
      if (!rider) {
        toast.error('Rider account not found.');
        return;
      }

      if (!rider.isApproved) {
        toast.error('Your account is pending approval from the admin.');
        return;
      }

      localStorage.setItem('rider_token', responseData.token);
      toast.success('Login successful! Redirecting to the dashboard...');
      navigate('/rider-dashboard');
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
      // Using the same requestPasswordReset function but with a different endpoint
      const result = await axios.post('http://localhost:4000/api/rider/request-password-reset', { email });
      setOtpSent(true);
      toast.success(result.data.message || 'OTP sent successfully.');
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
      const response = await axios.post('http://localhost:4000/api/rider/verify-otp-rider', {
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
        const result = await axios.post('http://localhost:4000/api/rider/reset-password', {
          email,
          otp,
          newPassword
        });
        
        if (result.data.success) {
            toast.success(result.data.message);
            navigate('/login');
        } else {
            toast.error(result.data.errors || 'Error resetting password');
        }
    } catch (error) {
        toast.error(error.response?.data?.errors || 'Error resetting password');
    }
  };


  return (
    <div className="login-container" style={{
      backgroundImage: `url(${loginImage})`,
    }}>
      <div className="login-box">
        <h1>{isLogin ? 'Rider Login' : 'Sign up as Rider'}</h1>

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

            <p>Remembered your password? <span className="link" onClick={() => { setForgotPassword(false); setIsLogin(true); }}>Click here to <b>Login</b></span></p>
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
              <div className="password-container" style={{ position: 'relative' }}>
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
                    cursor: 'pointer',
                    position: 'absolute',
                    right: '10px',
                    top: '60%',
                    transform: 'translateY(-50%)',
                  }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {passwordError && <p className="password-error">{passwordError}</p>}
              <p><span className="link" onClick={() => setForgotPassword(true)}>Forgot Password?</span></p>
            </div>
            <button type="submit">Login</button>
            <p>Not registered? <span className="link" onClick={() => setIsLogin(false)}>Sign up as a <b>Rider</b></span></p>
          </form>
        ) : (
          <form onSubmit={handleSignup}>
            <div>
              <label>Full Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
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
              <label>Contact Number:</label>
              <input
                type="text"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <div className="password-container" style={{ position: 'relative' }}>
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

                    handleChange({ target: { name: 'password', value: password } });

                    const isValidPassword = validatePassword(password);
                    if (!isValidPassword) {
                      setPasswordError('Password must be between 8 and 20 characters and contain at least one uppercase letter.');
                    } else {
                      setPasswordError(''); 
                    }
                  }}
                  required
                />
                <span
                  className="eye-icon"
                  onClick={togglePasswordVisibility}
                  style={{
                    cursor: 'pointer',
                    position: 'absolute',
                    right: '10px',
                    top: '60%',
                    transform: 'translateY(-50%)',
                  }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {passwordError && <p className="password-error">{passwordError}</p>}
            </div>
            <div>
              <label>Complete Address:</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Valid ID/Government Issued:</label>
              <input
                type="file"
                name="idPicture"
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Driver's License:</label>
              <input
                type="file"
                name="driverLicense"
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Vehicle Type:</label>
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                required
              >
                <option value="">Select Vehicle Type</option>
                <option value="motorcycle">Motorcycle</option>
                <option value="bicycle">Bicycle</option>
                <option value="car">Car</option>
                <option value="van">Van</option>
              </select>
            </div>
            <div>
              <label>Plate Number:</label>
              <input
                type="text"
                name="plateNumber"
                value={formData.plateNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Vehicle Registration:</label>
              <input
                type="file"
                name="vehicleRegistration"
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit">Sign up</button>
            <p>Already registered? <span className="link" onClick={() => setIsLogin(true)}>Log in as a <b>Rider</b></span></p>
          </form>
        )}
      </div>
    </div>
  );
};

export default RLoginSignup;