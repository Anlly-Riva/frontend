import { useAuth } from '../../context/AuthContext';
import { FiLogOut, FiBell } from 'react-icons/fi';

const Header = () => {
    const { user, logout } = useAuth();

    return (
        <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center z-10">
            <div>
                <h2 className="text-xl font-bold text-coffee-800 font-serif">
                    Panel Administrativo
                </h2>
                <p className="text-sm text-gray-500">
                    {new Date().toLocaleDateString('es-ES', {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    })}
                </p>
            </div>

            <div className="flex items-center gap-4">
                <button className="p-2 text-gray-400 hover:text-terracotta-500 transition relative">
                    <FiBell size={20} />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                <div className="h-8 w-px bg-gray-200"></div>

                <button
                    onClick={logout}
                    className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition px-3 py-2 rounded-lg hover:bg-red-50"
                >
                    <FiLogOut size={18} />
                    <span className="text-sm font-medium">Salir</span>
                </button>
            </div>
        </header>
    );
};

export default Header;
