import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FaUserPlus, FaSave, FaArrowLeft, FaStore } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { superadminApi } from '../../services/superadminApi';
import { Card } from '../../components/superadmin/DashboardComponents';

const CrearClientePage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);

    // Fetch Restaurants for assignment
    const { data: restaurantes = [], isLoading: isLoadingRestaurantes } = useQuery({
        queryKey: ['restaurantes'],
        queryFn: superadminApi.getRestaurantes
    });

    // Fetch Roles to find "Cliente" role ID
    const { data: roles = [], isLoading: isLoadingRoles } = useQuery({
        queryKey: ['roles'],
        queryFn: superadminApi.getRoles
    });

    const mutation = useMutation({
        mutationFn: superadminApi.createUsuario,
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            toast.success('Cliente creado y asignado exitosamente');
            setLoading(false);
            navigate('/superadmin/usuarios');
        },
        onError: (error) => {
            toast.error('Error al crear cliente: ' + error.message);
            setLoading(false);
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        // Validation
        if (!data.idSucursal) {
            toast.error('Debes seleccionar un restaurante para asignar al cliente');
            setLoading(false);
            return;
        }

        if (!data.rolId) {
            toast.error('Debes seleccionar un rol para el cliente');
            setLoading(false);
            return;
        }

        mutation.mutate(data);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                >
                    <FaArrowLeft />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Nuevo Cliente (Dueño)</h1>
                    <p className="text-gray-500">Registra un usuario y asígnale un restaurante.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card className="p-8 space-y-8">
                    {/* Datos Personales */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <FaUserPlus className="text-green-600" /> Datos Personales
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                <input name="nombreUsuario" required className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
                                <input name="apellidos" required className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">DNI</label>
                                <input name="dniUsuario" required className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                <input name="telefono" className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Credenciales y Rol */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Credenciales de Acceso</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Usuario (Login)</label>
                                <input name="nombreUsuarioLogin" required className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                                <input type="password" name="contrasena" required className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="••••••••" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                                <select name="rolId" required className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white">
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
                    </div>

                    <hr className="border-gray-100" />

                    {/* Asignación */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <FaStore className="text-orange-600" /> Asignación de Restaurante
                        </h2>
                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 mb-4">
                            <p className="text-sm text-orange-800">
                                Selecciona el restaurante que administrará este usuario. Esto vinculará su cuenta a la sucursal principal.
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Restaurante</label>
                            <select name="idSucursal" required className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white">
                                <option value="">Seleccionar Restaurante...</option>
                                {isLoadingRestaurantes ? (
                                    <option disabled>Cargando restaurantes...</option>
                                ) : restaurantes.length === 0 ? (
                                    <option disabled>No hay restaurantes disponibles</option>
                                ) : (
                                    restaurantes.map(rest => (
                                        <option key={rest.id_restaurante} value={rest.id_restaurante}>
                                            {rest.razon_social} (RUC: {rest.ruc})
                                        </option>
                                    ))
                                )}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                * Se asignará a la sucursal principal del restaurante seleccionado.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6">
                        <button
                            type="submit"
                            disabled={loading || mutation.isPending}
                            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium flex items-center gap-2 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-200"
                        >
                            {loading || mutation.isPending ? 'Guardando...' : <><FaSave /> Crear Cliente</>}
                        </button>
                    </div>
                </Card>
            </form>
        </div>
    );
};

export default CrearClientePage;