import axios from 'axios';

// Use environment variable or default to the provided API URL
//const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9090';


const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://comidas.spring.informaticapp.com:2074';



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
        // STRICT TOKEN SEPARATION LOGIC
        // If URL contains '/superadmin/' -> Use superadminToken
        // Else -> Use authToken

        let token = null;
        const isSuperAdminRequest = config.url?.includes('/superadmin/');

        if (isSuperAdminRequest) {
            token = localStorage.getItem('superadminToken');
            // Debug for SuperAdmin requests
            console.log('🛡️ SUPERADMIN REQUEST:', config.url);
        } else {
            token = localStorage.getItem('authToken');
        }

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
        const isSuperAdminRequest = error.config?.url?.includes('/superadmin/');

        // NO redirigir si estamos en endpoints de autenticación de SuperAdmin (para que el UI muestre el error)
        const isSuperAdminAuth = error.config?.url?.includes('/superadmin/auth/');

        if (error.response && error.response.status === 401) {
            console.error('🚨 UNAUTHORIZED (401) DETECTED');
            console.error('URL:', error.config?.url);
            console.error('Is SuperAdmin Request:', isSuperAdminRequest);

            if (isSuperAdminRequest) {
                if (!isSuperAdminAuth) {
                    console.warn('⚠️ SuperAdmin Session Expired');
                    localStorage.removeItem('superadminToken');
                    localStorage.removeItem('superadminUser');
                    window.location.href = '/superadmin/login';
                }
            } else {
                // Regular user 401
                console.warn('⚠️ User Session Expired - Redirecting to /login');
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
