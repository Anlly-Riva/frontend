import axios from 'axios';

// Use environment variable or default to the provided API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:8081';


//const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://comidas.spring.informaticapp.com:2030';



const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000
});

// Request interceptor to add the auth token header to requests
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('superadminToken') || localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle 401 Unauthorized responses
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Clear local storage and redirect to login
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
