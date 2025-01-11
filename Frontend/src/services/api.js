import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/auth';

export const signup = async (username, password) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/signup`, { username, password });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const signin = async (username, password) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/signin`, { username, password });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
