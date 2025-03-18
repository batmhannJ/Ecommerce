import axios from 'axios';

const API_URL = 'http://localhost:4000/api/seller';
const RIDER_URL = 'http://localhost:4000/api/raider';

export const sellerSignup = async (data) => {
  const response = await axios.post(`${API_URL}/signup`, data);
  return response.data;
};

export const sellerLogin = async (loginData) => {
  try {
    const response = await axios.post('http://localhost:4000/api/seller/login', loginData, {
      headers: {
        'Content-Type': 'application/json', // Ensure data is sent as JSON
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const requestPasswordReset = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/forgot-password-seller`, { email });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network error');
  }
};

export const verifyOtp = async (email, otp, newPassword) => {
  try {
      const response = await axios.post(`${API_URL}/verify-otp-seller`, {
          email,  // Make sure this matches the expected field in the backend
          otp,    // Make sure 'otp' is being sent correctly
          newPassword // Ensure the new password field is named properly
      });
      return response.data;
  } catch (error) {
      throw error;
  }
};


export const resetPassword = async (email, otp, newPassword) => {
  try {
    const response = await axios.post(`${API_URL}/reset-password-seller`, { email, otp, newPassword });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network error');
  }
};

// Add these functions to your existing services/api.js file

export const riderSignup = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/signup`, formData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const riderLogin = async (loginData) => {
  try {
    const response = await axios.post(`${API_URL}/login`, loginData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const requestRiderPasswordReset = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/request-password-reset`, { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const verifyRiderOtp = async (email, otp, newPassword) => {
  try {
    const response = await axios.post(`${API_URL}/verify-otp-rider`, { 
      email, 
      otp,
      newPassword 
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const resetRiderPassword = async (email, otp, newPassword) => {
  try {
    const response = await axios.post(`${API_URL}/reset-password`, {
      email,
      otp,
      newPassword
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};