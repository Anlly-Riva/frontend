import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    FiHome, FiUsers, FiShield, FiGrid, FiLock,
    FiChevronLeft, FiChevronRight
} from 'react-icons/fi';

const Sidebar = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    // TODO: Fetch allowed modules from API
    const menuItems = [
        { path: '/', icon: FiHome, label: 'Dashboard' },
        { path: '/usuarios', icon: FiUsers, label: 'Usuarios' },
        { path: '/perfiles', icon: FiShield, label: 'Perfiles' },
        { path: '/modulos', icon: FiGrid, label: 'Módulos' },
        { path: '/accesos', icon: FiLock, label: 'Accesos' },
    ];

    return (
        <aside
            className={`bg-coffee-900 text-cream-100 transition-all duration-300 flex flex-col ${collapsed ? 'w-20' : 'w-64'
                }`}
        >
            {/* Logo */}
            <div className="p-4 border-b border-coffee-800 flex items-center justify-between">
                {!collapsed && (
                    <h1 className="font-serif font-bold text-lg truncate">
                        Comidas Regionales
                    </h1>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 hover:bg-coffee-800 rounded-lg transition"
                >
                    {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4">
                <ul className="space-y-1 px-2">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition duration-200 ${isActive
                                            ? 'bg-terracotta-500 text-white shadow-md'
                                            : 'hover:bg-coffee-800 text-cream-200'
                                        }`}
                                    title={collapsed ? item.label : ''}
                                >
                                    <item.icon size={20} />
                                    {!collapsed && <span>{item.label}</span>}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-coffee-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-terracotta-600 flex items-center justify-center text-white font-bold">
                        {user?.nombreUsuario?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    {!collapsed && (
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium truncate">{user?.nombreUsuario}</p>
                            <p className="text-xs text-cream-200 truncate">{user?.nombrePerfil || 'Usuario'}</p>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
