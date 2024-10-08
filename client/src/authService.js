import axios from 'axios';
import baseUrl from './getBaseUrl';

// Set base URL for axios requests
axios.defaults.baseURL = `http://${baseUrl}:3000/api`;
axios.defaults.withCredentials = true; // Ensure cookies are included in requests

// Function to get the access token from localStorage
const getToken = () => localStorage.getItem('token');

// Function to set the access token in localStorage
const setToken = (token) => localStorage.setItem('token', token);

// Function to clear the access token and redirect to login
const handleLogout = () => {
  localStorage.removeItem('token');
  document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  window.location.href = '/login';
  alert('You have been logged out.');
};

const refreshToken = async () => {
  try {
    console.log('Refreshing token...');

    const response = await axios.post('/refresh-token', {}, { withCredentials: true });
    const newAccessToken = response.data.token;
    setToken(newAccessToken);
    window.dispatchEvent(new Event('tokenRefreshed'));
    return newAccessToken;
  } catch (error) {
    console.error('Unable to refresh token:', error);
    handleLogout();
    return null;
  }
};

// Axios interceptor to add access token to request headers
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

// Flag to prevent multiple refresh attempts simultaneously
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Axios interceptor to handle 401 errors and refresh token
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log('Error interceptor:', error);
    const originalRequest = error.config;

    // If the error status is 401 and it's not a retry attempt
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Queue requests while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return axios(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const newToken = await refreshToken();
        processQueue(null, newToken);

        // Retry the original request with the new token
        if (newToken) {
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return axios(originalRequest);
        } else {
          throw new Error('Failed to refresh token');
        }
      } catch (err) {
        processQueue(err, null);
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export { refreshToken };
