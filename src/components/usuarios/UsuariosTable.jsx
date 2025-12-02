import { useState } from 'react';
import { FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const UsuariosTable = ({ usuarios, onEdit, onDelete }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const totalPages = Math.ceil(usuarios.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentUsuarios = usuarios.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-coffee-900 text-cream-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Usuario</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">DNI / Teléfono</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Perfil</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Último Login</th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentUsuarios.map((usuario) => (
                            <tr key={usuario.idUsuario} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 rounded-full bg-terracotta-100 flex items-center justify-center text-terracotta-600 font-bold">
                                            {usuario.nombreUsuario.charAt(0)}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {usuario.nombreUsuario} {usuario.apellidos}
                                            </div>
                                            <div className="text-sm text-gray-500">@{usuario.nombreUsuarioLogin}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{usuario.dniUsuario}</div>
                                    <div className="text-sm text-gray-500">{usuario.telefono}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                        {usuario.nombrePerfil || 'Sin Perfil'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${usuario.estado === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {usuario.estado === 1 ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {usuario.ultimoLogin ? new Date(usuario.ultimoLogin).toLocaleString() : 'Nunca'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => onEdit(usuario)}
                                        className="text-terracotta-600 hover:text-terracotta-900 mr-4 transition"
                                    >
                                        <FiEdit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => onDelete(usuario)}
                                        className="text-red-600 hover:text-red-900 transition"
                                    >
                                        <FiTrash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">
                            Mostrando <span className="font-medium">{startIndex + 1}</span> a <span className="font-medium">{Math.min(startIndex + itemsPerPage, usuarios.length)}</span> de <span className="font-medium">{usuarios.length}</span> resultados
                        </p>
                    </div>
                    <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                <FiChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                <FiChevronRight className="h-5 w-5" />
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UsuariosTable;
