import React, { useState } from 'react';
import { superadminLogin } from '../../services/api';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './LoginSignup.css'; // Import your CSS file

const LoginSignup = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();


    // New state variable to handle password visibility
   const [showPassword, setShowPassword] = useState(false);

   const togglePasswordVisibility = () => {
    console.log("Toggling password visibility");
    setShowPassword((prev) => !prev);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z]).{8,}$/;
    return passwordRegex.test(password);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePassword(formData.password)) {
      setPasswordError('Password must be at least 8 characters long and include at least one capital letter.');
      return;
    } else {
      setPasswordError('');
    }
    
    try {
      const responseData = await superadminLogin(formData);
      
      console.log('Login Response:', responseData); // Log the response
  
      // Check if response contains both token and adminId
      if (responseData.token && responseData.adminId) {
        localStorage.setItem('admin_token', responseData.token);
        localStorage.setItem('admin_userId', responseData.adminId); // Store adminId in localStorage
        
        console.log('Stored token and adminId');
        navigate('/superadmin/usermanagement');
        window.location.reload();
      } else {
        console.error('No adminId or token found in response');
      }
    } catch (error) {
      console.error("Frontend Error:", error.response?.data || error.message);
      toast.error(error.response?.data?.errors || 'An error occurred. Please try again.');
    }
  };
  
  

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Admin Login</h1>
        <form onSubmit={onSubmit}>
          <div>
            <label>Email:</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
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
                    {showPassword ? <FaEyeSlash /> : <FaEye />} {/* Toggle eye icon */}
                </span>
            </div>
            {passwordError && <p className="password-error">{passwordError}</p>}
          </div>
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default LoginSignup;