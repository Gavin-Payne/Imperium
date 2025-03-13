import api from './api';

export const authService = {
  signup: async (username, password) => {
    try {
      const response = await api.post('/auth/signup', { 
        username, 
        password,
        email: `${username}@example.com` // Add email as required by your User model
      });
      return response.data;
    } catch (error) {
      console.error("Error in signup:", error);
      throw error.response?.data || error.message;
    }
  },

  signin: async (username, password) => {
    try {
      const response = await api.post('/auth/signin', { username, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error("Error in signin:", error);
      throw error.response?.data || error.message;
    }
  },

  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      localStorage.removeItem('token');
      return response.data;
    } catch (error) {
      console.error("Error in logout:", error);
      // Still remove token even if API call fails
      localStorage.removeItem('token');
      throw error.response?.data || error.message;
    }
  },

  googleSignin: async (credential) => {
    try {
      const response = await api.post('/google-signin', { credential });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error("Error in Google signin:", error);
      throw error.response?.data || error.message;
    }
  }
};