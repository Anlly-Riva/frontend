import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { FaShieldAlt, FaUserShield, FaCubes, FaStore, FaSignOutAlt, FaHome } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useSuperAdminAuth } from '../../context/SuperAdminAuthContext';

const LayoutSuperAdmin = () => {
    const navigate = useNavigate();
    const { logout } = useSuperAdminAuth();

    const handleLogout = () => {
        logout();
        toast.success('Sesión cerrada');
        navigate('/superadmin/login');
    };

    const menuItems = [
        { path: '/superadmin', icon: FaHome, label: 'Dashboard', exact: true },
        { path: '/superadmin/usuarios', icon: FaUserShield, label: 'SuperAdmins' },
        { path: '/superadmin/clientes', icon: FaUserShield, label: 'Clientes' },
        { path: '/superadmin/suscripciones', icon: FaStore, label: 'Suscripciones' },
        { path: '/superadmin/restaurantes', icon: FaStore, label: 'Restaurantes' },
        { path: '/superadmin/roles', icon: FaUserShield, label: 'Roles' },
        { path: '/superadmin/permisos', icon: FaCubes, label: 'Permisos' },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-gradient-to-b from-red-900 to-red-800 text-white flex flex-col shadow-2xl">
                {/* Logo */}
                <div className="p-6 border-b border-red-700">
                    <div className="flex items-center space-x-3">
                        <FaShieldAlt className="text-4xl text-yellow-300" />
                        <div>
                            <h1 className="text-xl font-bold">SuperAdmin</h1>
                            <p className="text-xs text-red-200">Panel de Control</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.exact}
                            className={({ isActive }) =>
                                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                    ? 'bg-red-700 text-white shadow-lg'
                                    : 'text-red-100 hover:bg-red-700/50 hover:text-white'
                                }`
                            }
                        >
                            <item.icon className="text-xl" />
                            <span className="font-medium">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-red-700 space-y-2">
                    <NavLink
                        to="/"
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-100 hover:bg-red-700/50 hover:text-white transition-all duration-200"
                    >
                        <FaHome className="text-xl" />
                        <span className="font-medium">Panel Normal</span>
                    </NavLink>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-100 hover:bg-red-700 hover:text-white transition-all duration-200"
                    >
                        <FaSignOutAlt className="text-xl" />
                        <span className="font-medium">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {/* Top Bar */}
                <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">
                                Sistema de Gestión SuperAdmin
                            </h2>
                            <p className="text-sm text-gray-500">
                                Control total del sistema multi-tenant
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="px-4 py-2 bg-red-100 text-red-800 rounded-lg font-semibold text-sm">
                                🔐 Modo SuperAdmin
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default LayoutSuperAdmin;
