import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usuariosAPI, perfilesAPI } from '../../services/api';
import { FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const UsuarioModal = ({ usuario, onClose }) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        nombreUsuario: '',
        apellidos: '',
        dniUsuario: '',
        telefono: '',
        nombreUsuarioLogin: '',
        contrasena: '',
        rolId: '',
        estado: 1,
        idSucursal: 1 // Default value
    });

    // Fetch profiles for the dropdown
    const { data: perfiles } = useQuery({
        queryKey: ['perfiles'],
        queryFn: async () => {
            const response = await perfilesAPI.getAll();
            return response.data.filter(p => p.estado === 1);
        }
    });

    useEffect(() => {
        if (usuario) {
            setFormData({
                nombreUsuario: usuario.nombreUsuario || '',
                apellidos: usuario.apellidos || '',
                dniUsuario: usuario.dniUsuario || '',
                telefono: usuario.telefono || '',
                nombreUsuarioLogin: usuario.nombreUsuarioLogin || '',
                contrasena: '', // Password is not populated for security
                rolId: usuario.rolId || '',
                estado: usuario.estado || 1,
                idSucursal: usuario.idSucursal || 1
            });
        }
    }, [usuario]);

    const saveMutation = useMutation({
        mutationFn: (data) => {
            if (usuario) {
                // If editing and password is empty, don't send it (backend handles this check usually, or we filter it out)
                const dataToSend = { ...data };
                if (!dataToSend.contrasena) delete dataToSend.contrasena;
                return usuariosAPI.update(usuario.idUsuario, dataToSend);
            }
            return usuariosAPI.create(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['usuarios']);
            toast.success(usuario ? 'Usuario actualizado' : 'Usuario creado');
            onClose();
        },
        onError: (error) => {
            toast.error('Error al guardar usuario');
            console.error(error);
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        saveMutation.mutate(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-coffee-800 font-serif">
                        {usuario ? 'Editar Usuario' : 'Nuevo Usuario'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <FiX size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personal Info */}
                        <div className="md:col-span-2">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Información Personal</h3>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nombres</label>
                            <input
                                type="text"
                                value={formData.nombreUsuario}
                                onChange={(e) => setFormData({ ...formData, nombreUsuario: e.target.value })}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-terracotta-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Apellidos</label>
                            <input
                                type="text"
                                value={formData.apellidos}
                                onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-terracotta-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">DNI</label>
                            <input
                                type="text"
                                value={formData.dniUsuario}
                                onChange={(e) => setFormData({ ...formData, dniUsuario: e.target.value })}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-terracotta-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                            <input
                                type="text"
                                value={formData.telefono}
                                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-terracotta-500 outline-none"
                            />
                        </div>

                        {/* Account Info */}
                        <div className="md:col-span-2 mt-4">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Cuenta de Usuario</h3>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Usuario Login</label>
                            <input
                                type="text"
                                value={formData.nombreUsuarioLogin}
                                onChange={(e) => setFormData({ ...formData, nombreUsuarioLogin: e.target.value })}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-terracotta-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {usuario ? 'Nueva Contraseña (Opcional)' : 'Contraseña'}
                            </label>
                            <input
                                type="password"
                                value={formData.contrasena}
                                onChange={(e) => setFormData({ ...formData, contrasena: e.target.value })}
                                required={!usuario}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-terracotta-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Perfil</label>
                            <select
                                value={formData.rolId}
                                onChange={(e) => setFormData({ ...formData, rolId: parseInt(e.target.value) })}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-terracotta-500 outline-none"
                            >
                                <option value="">Seleccione un perfil</option>
                                {perfiles?.map(perfil => (
                                    <option key={perfil.idPerfil} value={perfil.idPerfil}>
                                        {perfil.nombrePerfil}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                            <select
                                value={formData.estado}
                                onChange={(e) => setFormData({ ...formData, estado: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-terracotta-500 outline-none"
                            >
                                <option value={1}>Activo</option>
                                <option value={0}>Inactivo</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saveMutation.isPending}
                            className="px-4 py-2 bg-terracotta-500 text-white rounded-lg hover:bg-terracotta-600 transition shadow-md disabled:opacity-50"
                        >
                            {saveMutation.isPending ? 'Guardando...' : (usuario ? 'Actualizar' : 'Crear Usuario')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UsuarioModal;
