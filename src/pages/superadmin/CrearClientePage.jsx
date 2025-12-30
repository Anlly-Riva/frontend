import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FaUserPlus, FaSave, FaArrowLeft, FaStore } from 'react-icons/fa';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { superadminApi } from '../../services/superadminApi';
import { Card } from '../../components/superadmin/DashboardComponents';

const CrearClientePage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);

    // Pre-filled data from URL (Create Restaurant Flow)
    const paramIdRestaurante = searchParams.get('idRestaurante');
    const paramIdSucursal = searchParams.get('idSucursal');
    const paramNeedsManual = searchParams.get('needsManual') === 'true';

    const [sucursales, setSucursales] = useState([]);
    const [selectedRestaurantId, setSelectedRestaurantId] = useState(paramIdRestaurante || null);
    const [showManualInput, setShowManualInput] = useState(paramNeedsManual);
    const [sucursalIdInput, setSucursalIdInput] = useState(paramIdSucursal || '');

    // Effect to handle pre-filled data
    useEffect(() => {
        if (paramIdRestaurante && paramIdSucursal && !paramNeedsManual) {
            // We have a valid sucursal ID from the URL
            setSucursales([{ id_sucursal: parseInt(paramIdSucursal) }]);
            setShowManualInput(false);
        } else if (paramNeedsManual) {
            // Needs manual entry
            setShowManualInput(true);
        }
    }, [paramIdRestaurante, paramIdSucursal, paramNeedsManual]);

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

    // Fetch Specific Restaurant Details on selection


    const handleRestaurantChange = async (e) => {
        const restId = e.target.value;
        setSelectedRestaurantId(restId);
        setSucursalIdInput(''); // Reset input

        if (!restId) {
            setSucursales([]);
            return;
        }

        try {
            // 1. Try to get branches via probe
            const branches = await superadminApi.getSucursalesByRestaurante(restId);
            if (branches && branches.length > 0) {
                setSucursales(branches);
                setSucursalIdInput(branches[0].id_sucursal.toString());
                return;
            }

            // 2. Fallback: Check if embedded in restaurant details
            const restaurantDetails = await superadminApi.getRestauranteById(restId);
            if (restaurantDetails?.sucursales?.length > 0) {
                setSucursales(restaurantDetails.sucursales);
                setSucursalIdInput(restaurantDetails.sucursales[0].id_sucursal.toString());
            } else {
                setSucursales([]);
            }

        } catch (error) {
            setSucursales([]);
        }
    };

    const mutation = useMutation({
        mutationFn: superadminApi.createUsuario,
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            toast.success('Cliente creado y asignado exitosamente');
            setLoading(false);
            navigate('/superadmin');
        },
        onError: (error) => {
            console.error('❌ Error Mutation (Detailed):', error.response?.data);
            const backendMsg = error.response?.data?.message || error.response?.data?.error || error.message;
            toast.error(`Error al crear cliente: ${backendMsg}`);
            setLoading(false);
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.target);
        const rawData = Object.fromEntries(formData.entries());

        // Validation - Restaurant Selection
        if (!rawData.idRestaurantSelection) {
            toast.error('Debes seleccionar un restaurante para asignar al cliente');
            setLoading(false);
            return;
        }

        if (!rawData.rolId) {
            toast.error('Debes seleccionar un rol para el cliente');
            setLoading(false);
            return;
        }

        // Find main branch from the fetched list
        // Note: The list in logic above fetches filtered branches.
        // If that fails (due to the loop issue before), we need to ensure getSucursalesByRestaurante works.
        // Let's rely on the state 'sucursales' which we populate on change.

        let idSucursalFinal = null;

        // 1. Try from auto-detected list
        if (sucursales.length > 0) {
            idSucursalFinal = sucursales[0].id_sucursal;
        }
        // 2. Try from Manual Input (Fallback for edge cases)
        else if (rawData.idSucursalManual && rawData.idSucursalManual.trim() !== '') {
            idSucursalFinal = parseInt(rawData.idSucursalManual);
        }

        const data = {
            ...rawData,
            rolId: parseInt(rawData.rolId),
            estado: 1, // Default active

            // Map keys to match Database/Entity structure
            // DB: apellido_usuario -> Java: apellidoUsuario
            apellidoUsuario: rawData.apellidos,
            apellido_usuario: rawData.apellidos,

            // DB: telefono_usuario -> Java: telefonoUsuario
            telefonoUsuario: rawData.telefono,
            telefono_usuario: rawData.telefono,

            // DB: dni_usuario -> Java: dniUsuario
            dniUsuario: rawData.dniUsuario,
            dni_usuario: rawData.dniUsuario,

            // DB: nombre_usuario -> Java: nombreUsuario
            nombreUsuario: rawData.nombreUsuario,
            nombre_usuario: rawData.nombreUsuario,

            // DB: nombre_usuario_login -> Java: nombreUsuarioLogin
            nombreUsuarioLogin: rawData.nombreUsuarioLogin,
            nombre_usuario_login: rawData.nombreUsuarioLogin,

            contrasenaUsuario: rawData.contrasena,
            contrasena_usuario: rawData.contrasena
        };

        if (idSucursalFinal) {
            data.idSucursal = idSucursalFinal;
            data.id_sucursal = idSucursalFinal;
        } else {
            // Fallback - use restaurant ID
            data.id_restaurante = parseInt(rawData.idRestaurantSelection);
            data.idRestaurante = parseInt(rawData.idRestaurantSelection);
            delete data.idSucursal;
            delete data.id_sucursal;
        }

        // Ensure we don't send both if one is present (logic kept from previous, but clarified)
        if (data.idSucursal) {
            delete data.id_restaurante;
            delete data.idRestaurante;
        }

        // Remove form-only fields
        delete data.idSucursalManual;
        delete data.idRestaurantSelection;
        delete data.apellidos; // cleanup
        delete data.telefono; // cleanup
        delete data.contrasena; // cleanup

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
                            <FaUserPlus className="text-green-600" />
                            <span>Datos Personales</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1"><span>Nombre</span></label>
                                <input name="nombreUsuario" required className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1"><span>Apellidos</span></label>
                                <input name="apellidos" required className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1"><span>DNI</span></label>
                                <input name="dniUsuario" required className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1"><span>Teléfono</span></label>
                                <input name="telefono" className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Credenciales y Rol */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4"><span>Credenciales de Acceso</span></h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1"><span>Usuario (Login)</span></label>
                                <input name="nombreUsuarioLogin" required className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1"><span>Contraseña</span></label>
                                <input type="password" name="contrasena" required className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="••••••••" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1"><span>Rol</span></label>
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
                            <FaStore className="text-orange-600" />
                            <span>Asignación de Restaurante</span>
                        </h2>
                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 mb-4">
                            <p className="text-sm text-orange-800">
                                <span>Selecciona el restaurante que administrará este usuario. Esto vinculará su cuenta a la sucursal principal.</span>
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1"><span>Restaurante</span></label>
                            <select
                                name="idRestaurantSelection"
                                required
                                onChange={handleRestaurantChange}
                                defaultValue={paramIdRestaurante || ""}
                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                            >
                                <option value="">Seleccionar Restaurante...</option>
                                {isLoadingRestaurantes ? (
                                    <option disabled>Cargando restaurantes...</option>
                                ) : restaurantes.length === 0 ? (
                                    <option disabled>No hay restaurantes disponibles</option>
                                ) : (
                                    restaurantes.map(rest => (
                                        <option key={rest.id_restaurante || rest.idRestaurante} value={rest.id_restaurante || rest.idRestaurante}>
                                            ID: {rest.id_restaurante || rest.idRestaurante} - {rest.nombre} (RUC: {rest.ruc})
                                        </option>
                                    ))
                                )}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                <span>* Se asignará a la sucursal principal del restaurante seleccionado.</span>
                            </p>

                            {/* ID Sucursal - With auto-detection helper */}
                            <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <h4 className="text-sm font-semibold text-blue-800 mb-2">📝 ID de Sucursal</h4>

                                {/* Show detected ID if available */}
                                {sucursales.length > 0 && (
                                    <div className="mb-3 p-2 bg-green-100 rounded border border-green-300">
                                        <span className="text-sm text-green-800">
                                            ✅ Sucursal detectada y autocompletada
                                        </span>
                                    </div>
                                )}

                                {sucursales.length === 0 && selectedRestaurantId && (
                                    <p className="text-xs text-amber-700 mb-2">
                                        ⚠️ No se pudo detectar automáticamente. Ingresa el ID manualmente.
                                    </p>
                                )}

                                <label className="block text-sm font-medium text-gray-700 mb-1">ID Sucursal</label>
                                <input
                                    name="idSucursalManual"
                                    type="number"
                                    required
                                    value={sucursalIdInput}
                                    onChange={(e) => setSucursalIdInput(e.target.value)}
                                    className="w-full p-2 border border-blue-300 rounded bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Ej: 35"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6">
                        <button
                            type="submit"
                            disabled={loading || mutation.isPending}
                            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium flex items-center gap-2 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-200"
                        >
                            {loading || mutation.isPending ? (
                                <span>Guardando...</span>
                            ) : (
                                <>
                                    <FaSave />
                                    <span>Crear Cliente</span>
                                </>
                            )}
                        </button>
                    </div>
                </Card>
            </form>
        </div>
    );
};

export default CrearClientePage;