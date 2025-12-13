import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    console.log('🛡️ ProtectedRoute Check:', { path: location.pathname, isAuthenticated, loading });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-cream-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terracotta-500"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        console.warn('⛔ ProtectedRoute: User not authenticated. Redirecting to /login from', location.pathname);
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
