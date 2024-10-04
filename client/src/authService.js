import axios from 'axios';

// Set base URL for axios requests
axios.defaults.baseURL = 'http://192.168.0.100:3000/api';
axios.defaults.withCredentials = true; // Ensure cookies are included in requests

// Function to get the access token from localStorage
const getToken = () => localStorage.getItem('token');

// Function to set the access token in localStorage
const setToken = (token) => localStorage.setItem('token', token);

// Function to refresh the access token
const refreshToken = async () => {
  try {
    const response = await axios.post('/refresh-token');
    const newAccessToken = response.data.token;
    setToken(newAccessToken);
    return newAccessToken;
  } catch (error) {
    console.error('Unable to refresh token:', error);
    return null;
  }
};

// Axios interceptor to handle token refreshing
axios.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Axios interceptor to refresh the token on 401 errors
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If a 401 Unauthorized error occurs, try to refresh the token
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Prevent infinite loop
      const newToken = await refreshToken();

      if (newToken) {
        // Set the new token in the Authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return axios(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

export { refreshToken };
