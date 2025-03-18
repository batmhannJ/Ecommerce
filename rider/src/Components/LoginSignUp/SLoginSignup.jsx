import React, { useState } from 'react';
import { riderLogin } from '../../services/api';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './SLoginSignup.css';
import loginImage from "../../assets/askilogo.png";

const RiderLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const loginData = {
      email: formData.email,
      password: formData.password,
    };

    try {
      const responseData = await riderLogin(loginData);
      if (!responseData.data.success) {
        toast.error(responseData.data.message || 'Login failed. Please try again.');
        return;
      }

      const seller = responseData.data.seller;
      if (!seller) {
        toast.error('Rider account not found.');
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

  return (
    <div className="login-container" style={{
      backgroundImage: `url(${loginImage})`,
    }}>
      <div className="login-box">
        <h1>Rider Login</h1>
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
            <p><span className="link" onClick={() => navigate('/forgot-password')}>Forgot Password?</span></p>
          </div>
          <button type="submit">Login</button>
          {/*<p>Not registered? <span className="link" onClick={() => navigate('/rider-signup')}>Sign up as a <b>Rider</b></span></p>*/}
        </form>
      </div>
    </div>
  );
};

export default RiderLogin;