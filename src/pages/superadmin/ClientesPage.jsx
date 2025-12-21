import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaUserPlus, FaEdit, FaTrash, FaSearch, FaUser, FaKey, FaSave } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { superadminApi } from '../../services/superadminApi';
import { Card } from '../../components/superadmin/DashboardComponents';

const ClientesPage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const queryClient = useQueryClient();

    // Fetch Usuarios (Clients/Administrators)
    const { data: usuarios = [], isLoading, error } = useQuery({
        queryKey: ['usuarios'],
        queryFn: superadminApi.getUsuarios
    });

    // Update Mutation
    const updateMutation = useMutation({
        mutationFn: (userData) => superadminApi.updateUsuario(userData.idUsuario, userData),
        onSuccess: () => {
            queryClient.invalidateQueries(['usuarios']);
            setIsModalOpen(false);
            setEditingUser(null);
            toast.success('Cliente actualizado correctamente');
        },
        onError: (error) => {
            toast.error('Error al actualizar: ' + error.message);
        }
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

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        // Validate passwords match
        if (data.newPassword && data.newPassword !== data.confirmPassword) {
            toast.error('Las contraseñas no coinciden');
            return;
        }

        // If new password provided, use it
        if (data.newPassword) {
            data.contrasenaUsuario = data.newPassword;
        }

        // Remove temp fields
        delete data.newPassword;
        delete data.confirmPassword;

        // Add the ID
        data.idUsuario = editingUser.idUsuario || editingUser.id_usuario;

        updateMutation.mutate(data);
    };

    const openEditModal = (usuario) => {
        setEditingUser(usuario);
        setIsModalOpen(true);
    };

    // Filter by name, login, or DNI
    const filteredUsuarios = usuarios.filter(u =>
        u.nombreUsuario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.nombreUsuarioLogin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.dniUsuario?.includes(searchTerm) ||
        u.apellidoUsuario?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Format date
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        try {
            return new Date(dateStr).toLocaleDateString('es-PE');
        } catch {
            return dateStr;
        }
    };

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="bg-red-50 p-6 rounded-lg inline-block">
                    <p className="text-red-600 font-medium mb-2">Error al cargar clientes</p>
                    <p className="text-red-500 text-sm">{error.message}</p>
                    <p className="text-gray-500 text-xs mt-4">
                        Verifica que tu backend tenga el endpoint:<br />
                        <code className="bg-gray-100 px-2 py-1 rounded">GET /restful/superadmin/usuarios</code>
                    </p>
                </div>
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
                                <th className="p-4 font-medium">ID</th>
                                <th className="p-4 font-medium">Usuario</th>
                                <th className="p-4 font-medium">Nombre Completo</th>
                                <th className="p-4 font-medium">DNI</th>
                                <th className="p-4 font-medium">Sucursal ID</th>
                                <th className="p-4 font-medium">Fecha Creación</th>
                                <th className="p-4 font-medium">Estado</th>
                                <th className="p-4 font-medium text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr><td colSpan="8" className="p-4 text-center">Cargando...</td></tr>
                            ) : filteredUsuarios.length === 0 ? (
                                <tr><td colSpan="8" className="p-4 text-center text-gray-500">No se encontraron clientes</td></tr>
                            ) : filteredUsuarios.map((usuario) => (
                                <tr key={usuario.idUsuario || usuario.id_usuario} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-gray-500 text-sm">
                                        #{usuario.idUsuario || usuario.id_usuario}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                                <FaUser />
                                            </div>
                                            <span className="font-medium text-gray-900">{usuario.nombreUsuarioLogin}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        {usuario.nombreUsuario} {usuario.apellidoUsuario || usuario.apellidos}
                                    </td>
                                    <td className="p-4 text-gray-600">{usuario.dniUsuario || '-'}</td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                            {usuario.idSucursal || usuario.id_sucursal || '-'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-600 text-sm">
                                        {formatDate(usuario.fechaCreacion || usuario.fecha_creacion)}
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
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(usuario)}
                                                className="p-2 hover:bg-gray-100 rounded text-gray-500 hover:text-blue-600 transition-colors"
                                                title="Editar"
                                            >
                                                <FaEdit />
                                            </button>
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
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Edit Modal */}
            {isModalOpen && editingUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg m-4 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-lg font-bold text-gray-900">Editar Cliente</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ID Usuario</label>
                                    <input
                                        value={editingUser.idUsuario || editingUser.id_usuario}
                                        disabled
                                        className="w-full p-2 border rounded-lg bg-gray-100 text-gray-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ID Sucursal</label>
                                    <input
                                        name="idSucursal"
                                        defaultValue={editingUser.idSucursal || editingUser.id_sucursal}
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                <input
                                    name="nombreUsuario"
                                    defaultValue={editingUser.nombreUsuario}
                                    required
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Usuario (Login)</label>
                                <input
                                    name="nombreUsuarioLogin"
                                    defaultValue={editingUser.nombreUsuarioLogin}
                                    required
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nueva Contraseña (dejar vacío para mantener)
                                </label>
                                <div className="relative">
                                    <FaKey className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="password"
                                        name="newPassword"
                                        className="w-full p-2 pl-10 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirmar Contraseña
                                </label>
                                <div className="relative">
                                    <FaKey className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        className="w-full p-2 pl-10 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={updateMutation.isPending}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                                >
                                    <FaSave />
                                    {updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientesPage;
