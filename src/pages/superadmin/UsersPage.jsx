import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaUserPlus, FaEdit, FaTrash, FaSearch, FaUserShield, FaKey, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { superadminApi } from '../../services/superadminApi';
import { Card } from '../../components/superadmin/DashboardComponents';

const UsersPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const queryClient = useQueryClient();

    // Fetch Users
    const { data: users = [], isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: superadminApi.getUsuarios
    });

    // Fetch Roles for selector
    const { data: roles = [], isLoading: isLoadingRoles } = useQuery({
        queryKey: ['roles'],
        queryFn: superadminApi.getRoles
    });

    // Create/Update Mutation
    const mutation = useMutation({
        mutationFn: (userData) => {
            return editingUser
                ? superadminApi.updateUsuario(userData)
                : superadminApi.createUsuario(userData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            setIsModalOpen(false);
            setEditingUser(null);
            toast.success(editingUser ? 'Usuario actualizado' : 'Usuario creado');
        },
        onError: (error) => {
            toast.error('Error al guardar usuario: ' + error.message);
        }
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: superadminApi.deleteUsuario,
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            toast.success('Usuario eliminado');
        },
        onError: (error) => {
            toast.error('Error al eliminar usuario: ' + error.message);
        }
    });

    // Toggle Estado Mutation
    const toggleEstadoMutation = useMutation({
        mutationFn: async (user) => {
            const nuevoEstado = user.estado === 1 ? 0 : 1;
            return superadminApi.updateUsuario({
                ...user,
                idUsuario: user.idUsuario,
                estado: nuevoEstado
            });
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(['users']);
            const nuevoEstado = variables.estado === 1 ? 0 : 1;
            toast.success(`Usuario ${nuevoEstado === 1 ? 'activado' : 'desactivado'} correctamente`);
        },
        onError: (error) => {
            toast.error('Error al cambiar estado: ' + error.message);
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        if (editingUser) {
            data.idUsuario = editingUser.idUsuario;
        }

        mutation.mutate(data);
    };

    const filteredUsers = users.filter(user =>
        user.nombreUsuario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.nombreUsuarioLogin?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
                    <p className="text-gray-500">Administra los usuarios y sus accesos al sistema.</p>
                </div>
                <button
                    onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <FaUserPlus /> Nuevo Usuario
                </button>
            </div>

            <Card className="p-4">
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 mb-4 w-full md:w-96">
                    <FaSearch className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o usuario..."
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
                                <th className="p-4 font-medium">Rol</th>
                                <th className="p-4 font-medium">Estado</th>
                                <th className="p-4 font-medium text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr><td colSpan="5" className="p-4 text-center">Cargando...</td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan="5" className="p-4 text-center text-gray-500">No se encontraron usuarios</td></tr>
                            ) : filteredUsers.map((user) => (
                                <tr key={user.idUsuario} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs">
                                                {user.nombreUsuarioLogin?.substring(0, 2).toUpperCase() || 'U'}
                                            </div>
                                            <span className="font-medium text-gray-900">{user.nombreUsuarioLogin}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-600">{user.nombreUsuario} {user.apellidos}</td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium border border-blue-100">
                                            {roles.find(r => r.idPerfil === user.rolId)?.nombrePerfil || 'Sin Rol'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium border ${user.estado === 1
                                            ? 'bg-green-50 text-green-700 border-green-100'
                                            : 'bg-gray-100 text-gray-600 border-gray-200'
                                            }`}>
                                            {user.estado === 1 ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => toggleEstadoMutation.mutate(user)}
                                                className={`p-2 hover:bg-gray-100 rounded transition-colors ${user.estado === 1 ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-gray-600'
                                                    }`}
                                                title={user.estado === 1 ? 'Desactivar' : 'Activar'}
                                                disabled={toggleEstadoMutation.isPending}
                                            >
                                                {user.estado === 1 ? <FaToggleOn size={20} /> : <FaToggleOff size={20} />}
                                            </button>
                                            <button
                                                onClick={() => { setEditingUser(user); setIsModalOpen(true); }}
                                                className="p-2 hover:bg-gray-100 rounded text-gray-500 hover:text-blue-600 transition-colors"
                                                title="Editar"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
                                                        deleteMutation.mutate(user.idUsuario);
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

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg m-4 overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-lg font-bold text-gray-900">
                                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                    <input name="nombreUsuario" defaultValue={editingUser?.nombreUsuario} required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
                                    <input name="apellidos" defaultValue={editingUser?.apellidos} required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">DNI</label>
                                    <input name="dniUsuario" defaultValue={editingUser?.dniUsuario} required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                    <input name="telefono" defaultValue={editingUser?.telefono} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Usuario (Login)</label>
                                <input name="nombreUsuarioLogin" defaultValue={editingUser?.nombreUsuarioLogin} required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" />
                            </div>

                            {!editingUser && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                                    <div className="relative">
                                        <FaKey className="absolute left-3 top-3 text-gray-400" />
                                        <input type="password" name="contrasena" required className="w-full p-2 pl-10 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" placeholder="••••••••" />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                                <div className="relative">
                                    <FaUserShield className="absolute left-3 top-3 text-gray-400" />
                                    <select name="rolId" defaultValue={editingUser?.rolId || ''} required className="w-full p-2 pl-10 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white">
                                        <option value="">Seleccionar Rol...</option>
                                        {isLoadingRoles ? (
                                            <option disabled>Cargando roles...</option>
                                        ) : roles.length === 0 ? (
                                            <option disabled>No hay roles disponibles</option>
                                        ) : (
                                            roles.map(role => (
                                                <option key={role.idPerfil} value={role.idPerfil}>{role.nombrePerfil}</option>
                                            ))
                                        )}
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
                                <button
                                    type="submit"
                                    disabled={mutation.isPending}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
                                >
                                    {mutation.isPending ? 'Guardando...' : (editingUser ? 'Guardar Cambios' : 'Crear Usuario')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersPage;