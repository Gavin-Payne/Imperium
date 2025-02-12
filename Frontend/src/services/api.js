import axios from 'axios';

// The base URL of the backend API (adjust if necessary)
const API_BASE_URL = 'http://localhost:5000/api/auth';

// Signup function
export const signup = async (username, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/signup`, { username, password });
    return response.data;  // Ensure the backend returns { token: 'some-jwt-token' }
  } catch (error) {
    console.error("Error in signup:", error); // Log errors for debugging
    throw error.response?.data || error.message;
  }
};

// Signin function
export const signin = async (username, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/signin`, { username, password });
    console.log("Signin response data:", response.data);  // Log the response to see token and data
    return response.data;  // Ensure response contains { token: 'some-jwt-token' }
  } catch (error) {
    console.error("Error in signin:", error); // Log errors for debugging
    throw error.response?.data || error.message;
  }
};
