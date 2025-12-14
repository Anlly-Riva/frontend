import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FaUserPlus, FaSave, FaArrowLeft, FaStore, FaBuilding } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { superadminApi } from '../../services/superadminApi';
import { Card } from '../../components/superadmin/DashboardComponents';

const CrearAdminSucursalPage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);

    // State for dependent dropdowns
    const [selectedRestaurantId, setSelectedRestaurantId] = useState('');
    const [sucursales, setSucursales] = useState([]);
    const [isLoadingSucursales, setIsLoadingSucursales] = useState(false);

    // Fetch Restaurants
    const { data: restaurantes = [], isLoading: isLoadingRestaurantes } = useQuery({
        queryKey: ['restaurantes'],
        queryFn: superadminApi.getRestaurantes
    });

    // Fetch Roles
    const { data: roles = [], isLoading: isLoadingRoles } = useQuery({
        queryKey: ['roles'],
        queryFn: superadminApi.getRoles
    });

    // Load Sucursales when Restaurant changes
    useEffect(() => {
        if (selectedRestaurantId) {
            loadSucursales(selectedRestaurantId);
        } else {
            setSucursales([]);
        }
    }, [selectedRestaurantId]);

    const loadSucursales = async (idRestaurante) => {
        setIsLoadingSucursales(true);
        try {
            const data = await superadminApi.getSucursalesByRestaurante(idRestaurante);
            setSucursales(data);
        } catch (error) {
            toast.error('Error al cargar sucursales');
            setSucursales([]);
        } finally {
            setIsLoadingSucursales(false);
        }
    };

    const mutation = useMutation({
        mutationFn: superadminApi.createUsuario,
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            toast.success('Administrador de sucursal creado exitosamente');
            setLoading(false);
            navigate('/superadmin/usuarios');
        },
        onError: (error) => {
            toast.error('Error al crear usuario: ' + error.message);
            setLoading(false);
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        if (!data.idSucursal) {
            toast.error('Debes seleccionar una sucursal');
            setLoading(false);
            return;
        }

        if (!data.rolId) {
            toast.error('Debes seleccionar un rol');
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
                    <h1 className="text-2xl font-bold text-gray-900"><span>Nuevo Admin Sucursal</span></h1>
                    <p className="text-gray-500"><span>Asigna un administrador a una sucursal específica.</span></p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card className="p-8 space-y-8">
                    {/* Selección de Asignación */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <FaBuilding className="text-orange-600" />
                            <span>Asignación de Sucursal</span>
                        </h2>

                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 mb-6">
                            <p className="text-sm text-orange-800">
                                <span>Selecciona primero el restaurante y luego la sucursal específica que administrará este usuario.</span>
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1"><span>Restaurante</span></label>
                                <select
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                                    value={selectedRestaurantId}
                                    onChange={(e) => setSelectedRestaurantId(e.target.value)}
                                >
                                    <option value="">Seleccionar Restaurante...</option>
                                    {restaurantes.map(rest => (
                                        <option key={rest.id_restaurante} value={rest.id_restaurante}>
                                            {rest.razon_social} (RUC: {rest.ruc})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1"><span>Sucursal</span></label>
                                <select
                                    name="idSucursal"
                                    required
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white disabled:bg-gray-100 disabled:text-gray-400"
                                    disabled={!selectedRestaurantId || isLoadingSucursales}
                                >
                                    <option value="">
                                        {isLoadingSucursales ? 'Cargando sucursales...' : 'Seleccionar Sucursal...'}
                                    </option>
                                    {sucursales.map(suc => (
                                        <option key={suc.id_sucursal} value={suc.id_sucursal}>
                                            {suc.nombre} ({suc.direccion})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Datos Personales */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <FaUserPlus className="text-blue-600" />
                            <span>Datos del Administrador</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1"><span>Nombre</span></label>
                                <input name="nombreUsuario" required className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1"><span>Apellidos</span></label>
                                <input name="apellidos" required className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1"><span>DNI</span></label>
                                <input name="dniUsuario" required className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1"><span>Teléfono</span></label>
                                <input name="telefono" className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Credenciales */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4"><span>Credenciales de Acceso</span></h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1"><span>Usuario (Login)</span></label>
                                <input name="nombreUsuarioLogin" required className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1"><span>Contraseña</span></label>
                                <input type="password" name="contrasena" required className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="••••••••" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1"><span>Rol</span></label>
                                <select name="rolId" required className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                                    <option value="">Seleccionar Rol...</option>
                                    {roles.map(role => (
                                        <option key={role.idPerfil} value={role.idPerfil}>{role.nombrePerfil}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6">
                        <button
                            type="submit"
                            disabled={loading || mutation.isPending}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-medium flex items-center gap-2 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-200"
                        >
                            {loading || mutation.isPending ? (
                                <span>Guardando...</span>
                            ) : (
                                <>
                                    <FaSave />
                                    <span>Crear Administrador</span>
                                </>
                            )}
                        </button>
                    </div>
                </Card>
            </form>
        </div>
    );
};

export default CrearAdminSucursalPage;
