import axios from 'axios';

const API_URL = 'https://ip-tienda-han-backend.onrender.com/api/superadmin';

export const superadminSignup = async (data) => {
  const response = await axios.post(`${API_URL}/signup`, data);
  return response.data;
};

export const superadminLogin = async (data) => {
  const response = await axios.post(`${API_URL}/login`, data);
  return response.data;
};
