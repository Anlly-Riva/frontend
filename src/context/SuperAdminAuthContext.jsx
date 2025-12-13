import { createContext, useContext, useState, useEffect } from 'react';
import { superadminApi } from '../services/superadminApi';

const SuperAdminAuthContext = createContext();

export const useSuperAdminAuth = () => {
    const context = useContext(SuperAdminAuthContext);
    if (!context) {
        console.error('⛔ useSuperAdminAuth FAILED: Context is null/undefined!');
        throw new Error('useSuperAdminAuth must be used within a SuperAdminAuthProvider');
    }
    return context;
};

export const SuperAdminAuthProvider = ({ children }) => {
    console.log('🏗️ SuperAdminAuthProvider: Rendering...');

    useEffect(() => {
        console.log('✅ SuperAdminAuthProvider: MOUNTED');
        return () => console.log('❌ SuperAdminAuthProvider: UNMOUNTED');
    }, []);
    const [superAdminUser, setSuperAdminUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('superadminToken');
        const storedUser = localStorage.getItem('superadminUser');

        if (token && storedUser) {
            try {
                setSuperAdminUser(JSON.parse(storedUser));
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Error parsing stored superadmin user:', error);
                logout();
            }
        }
        setLoading(false);
    }, []);

    const loginStep1 = async (email, password) => {
        try {
            return await superadminApi.initiateLogin(email, password);
        } catch (error) {
            throw error;
        }
    };

    const loginStep2 = async (token) => {
        try {
            const response = await superadminApi.loginWithToken(token);
            const data = response.data;

            // Extract token and user data
            // The API response structure from the user request is:
            // { token: "...", idUsuario: 1, nombres: "...", ... }
            const jwtToken = data.token || token;

            // We store the whole object as the user details, excluding the token
            const { token: _, ...userData } = data;

            // Save to localStorage
            localStorage.setItem('superadminToken', jwtToken);
            localStorage.setItem('superadminUser', JSON.stringify(userData));

            // Update state
            setSuperAdminUser(userData);
            setIsAuthenticated(true);

            return true;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('superadminToken');
        localStorage.removeItem('superadminUser');
        setSuperAdminUser(null);
        setIsAuthenticated(false);
    };

    const value = {
        superAdminUser,
        isAuthenticated,
        loading,
        loginStep1,
        loginStep2,
        logout
    };

    return (
        <SuperAdminAuthContext.Provider value={value}>
            {!loading && children}
        </SuperAdminAuthContext.Provider>
    );
};
