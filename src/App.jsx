import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsuariosPage from './pages/UsuariosPage';
import PerfilesPage from './pages/PerfilesPage';
import ModulosPage from './pages/ModulosPage';
import AccesosPage from './pages/AccesosPage';
import ProtectedRoute from './components/ProtectedRoute';

// SuperAdmin imports
import LoginSuperAdminPage from './pages/superadmin/LoginSuperAdminPage';
import LayoutSuperAdmin from './components/superadmin/LayoutSuperAdmin';
import DashboardSuperAdminPage from './pages/superadmin/DashboardSuperAdminPage';
import RolesPage from './pages/superadmin/RolesPage';
import PermisosPage from './pages/superadmin/PermisosPage';
import UsersPage from './pages/superadmin/UsersPage';
import RestaurantesPage from './pages/superadmin/RestaurantesPage';
import SubscriptionsPage from './pages/superadmin/SubscriptionsPage';
import CrearRestaurantePage from './pages/superadmin/CrearRestaurantePage';
import CrearClientePage from './pages/superadmin/CrearClientePage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* SuperAdmin Routes */}
            <Route path="/superadmin/login" element={<LoginSuperAdminPage />} />
            <Route path="/superadmin" element={<LayoutSuperAdmin />}>
              <Route index element={<DashboardSuperAdminPage />} />
              <Route path="roles" element={<RolesPage />} />
              <Route path="permisos" element={<PermisosPage />} />
              <Route path="usuarios" element={<UsersPage />} />
              <Route path="restaurantes" element={<RestaurantesPage />} />
              <Route path="suscripciones" element={<SubscriptionsPage />} />
              <Route path="crear-restaurante" element={<CrearRestaurantePage />} />
              <Route path="crear-cliente" element={<CrearClientePage />} />
            </Route>

            {/* Normal Admin Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<DashboardPage />} />
              <Route path="usuarios" element={<UsuariosPage />} />
              <Route path="perfiles" element={<PerfilesPage />} />
              <Route path="modulos" element={<ModulosPage />} />
              <Route path="accesos" element={<AccesosPage />} />
            </Route>

            {/* Redirect /login to /superadmin/login */}
            <Route path="/login" element={<Navigate to="/superadmin/login" replace />} />
            
            {/* Catch all - redirect to home or superadmin login based on auth */}
            <Route path="*" element={<Navigate to="/superadmin/login" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
