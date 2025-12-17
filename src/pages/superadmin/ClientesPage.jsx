import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaUserPlus, FaTrash, FaSearch, FaStore, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { superadminApi } from '../../services/superadminApi';
import { Card } from '../../components/superadmin/DashboardComponents';

const ClientesPage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const queryClient = useQueryClient();

    // Fetch Usuarios (Clients/Administrators)
    const { data: usuarios = [], isLoading, error } = useQuery({
        queryKey: ['usuarios'],
        queryFn: superadminApi.getUsuarios
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: superadminApi.deleteUsuario,
        onSuccess: () => {
            queryClient.invalidateQueries(['usuarios']);
            toast.success('Cliente eliminado correctamente');
        },
        onError: (error) => {
            toast.error('Error al eliminar cliente: ' + error.message);
        }
    });

    // Filter by name, login, or DNI
    const filteredUsuarios = usuarios.filter(u =>
        u.nombreUsuario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.nombreUsuarioLogin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.dniUsuario?.includes(searchTerm) ||
        u.apellidos?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500">Error al cargar clientes: {error.message}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Clientes (Administradores)</h1>
                    <p className="text-gray-500">Lista de usuarios administradores de restaurantes.</p>
                </div>
                <button
                    onClick={() => navigate('/superadmin/crear-cliente')}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <FaUserPlus /> Nuevo Cliente
                </button>
            </div>

            <Card className="p-4">
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 mb-4 w-full md:w-96">
                    <FaSearch className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, usuario o DNI..."
                        className="bg-transparent border-none outline-none w-full text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 text-gray-500 text-sm">
                                <th className="p-4 font-medium">Usuario</th>
                                <th className="p-4 font-medium">Nombre Completo</th>
                                <th className="p-4 font-medium">DNI</th>
                                <th className="p-4 font-medium">Teléfono</th>
                                <th className="p-4 font-medium">Sucursal ID</th>
                                <th className="p-4 font-medium">Estado</th>
                                <th className="p-4 font-medium text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr><td colSpan="7" className="p-4 text-center">Cargando...</td></tr>
                            ) : filteredUsuarios.length === 0 ? (
                                <tr><td colSpan="7" className="p-4 text-center text-gray-500">No se encontraron clientes</td></tr>
                            ) : filteredUsuarios.map((usuario) => (
                                <tr key={usuario.idUsuario || usuario.id_usuario} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                                <FaUser />
                                            </div>
                                            <span className="font-medium text-gray-900">{usuario.nombreUsuarioLogin}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        {usuario.nombreUsuario} {usuario.apellidos}
                                    </td>
                                    <td className="p-4 text-gray-600">{usuario.dniUsuario || '-'}</td>
                                    <td className="p-4 text-gray-600">{usuario.telefono || '-'}</td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                            {usuario.idSucursal || usuario.id_sucursal || '-'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium border ${usuario.estado === 1
                                                ? 'bg-green-50 text-green-700 border-green-100'
                                                : 'bg-gray-100 text-gray-600 border-gray-200'
                                            }`}>
                                            {usuario.estado === 1 ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => {
                                                if (window.confirm('¿Estás seguro de eliminar este cliente?')) {
                                                    deleteMutation.mutate(usuario.idUsuario || usuario.id_usuario);
                                                }
                                            }}
                                            className="p-2 hover:bg-gray-100 rounded text-gray-500 hover:text-red-600 transition-colors"
                                            title="Eliminar"
                                        >
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default ClientesPage;
