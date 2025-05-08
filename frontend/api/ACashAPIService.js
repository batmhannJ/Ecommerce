// ACashAPIService.js
import axios from "axios";

const API_BASE_URL = "http://localhost:4000/api";

class ACashAPIService {
  // Get authentication token
  static async getToken(email, password) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/getToken`, {
        authuser: email,
        authkey: password
      });
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Verify OTP
  static async verifyOTP(otp, token) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/verifyOTP`,
        { otp },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Resend OTP
  static async resendOTP(token) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/resendOTP`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Process payment
  static async processPayment(paymentData, token) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/payments/process`,
        paymentData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get transaction status
  static async getTransactionStatus(transactionId, token) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/payments/status/${transactionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Handle API errors
  static handleError(error) {
    let errorMessage = "Something went wrong. Please try again.";
    
    if (error.response) {
      // Server responded with an error
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 400:
          errorMessage = data.message || "Invalid request data";
          break;
        case 401:
          errorMessage = "Authentication failed. Please check your credentials.";
          break;
        case 403:
          errorMessage = "You don't have permission to perform this action.";
          break;
        case 404:
          errorMessage = "The requested resource was not found.";
          break;
        case 429:
          errorMessage = "Too many requests. Please try again later.";
          break;
        case 500:
          errorMessage = "Internal server error. Please try again later.";
          break;
        default:
          errorMessage = data.message || "An error occurred processing your request";
      }
    } else if (error.request) {
      // Request was made but no response received
      errorMessage = "Unable to connect to the server. Please check your internet connection.";
    }
    
    return {
      error: true,
      message: errorMessage,
      originalError: error
    };
  }
}

export default ACashAPIService;