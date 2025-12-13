import { Navigate, useLocation } from 'react-router-dom';
import { useSuperAdminAuth } from '../../context/SuperAdminAuthContext';

const ProtectedSuperAdminRoute = ({ children }) => {
    const { isAuthenticated, loading } = useSuperAdminAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        console.warn('⛔ ProtectedSuperAdminRoute: Access Denied. User is NOT authenticated. Redirecting to /superadmin/login');
        console.log('Debug State:', { isAuthenticated, loading });
        // Redirect to the login page, but save the current location they were trying to go to
        return <Navigate to="/superadmin/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedSuperAdminRoute;
