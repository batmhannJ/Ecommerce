import axios from 'axios';

const API_URL = 'https://ip-tienda-han-backend.onrender.com/api/admin';

export const adminSignup = async (data) => {
  const response = await axios.post(`${API_URL}/signup`, data);
  return response.data;
};

export const adminLogin = async (data) => {
  const response = await axios.post(`${API_URL}/login`, data);
  return response.data;
};

export const sendOtp = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/send-otp`, data);
    return response.data;
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};

export const verifyOtp = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/verify-otp`, data);
    return response.data;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};