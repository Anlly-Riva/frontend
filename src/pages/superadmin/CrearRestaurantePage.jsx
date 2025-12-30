import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FaStore, FaSave, FaArrowLeft, FaFileInvoice } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { superadminApi } from '../../services/superadminApi';
import { Card } from '../../components/superadmin/DashboardComponents';

const CrearRestaurantePage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);

    const mutation = useMutation({
        mutationFn: async (dataResult) => {
            // 1. Create Restaurant
            const newRestaurante = await superadminApi.createRestaurante(dataResult);
            let createdBranchId = null;

            // 2. Auto-create Main Branch if restaurant has ID
            if (newRestaurante && newRestaurante.id_restaurante) {
                const branchData = {
                    id_restaurante: newRestaurante.id_restaurante,
                    nombre: 'Sucursal Principal',
                    direccion: dataResult.direccion_principal || 'Dirección Principal',
                    telefono: '',
                    horario_atencion: '9am - 6pm',
                    estado: 1
                };

                // Try primary creation
                try {
                    let newBranch = await superadminApi.createSucursal(branchData);
                    if (newBranch && newBranch.id_sucursal) {
                        createdBranchId = newBranch.id_sucursal;
                    }
                } catch (primaryErr) {
                    // Silent fallback - try anonymous
                    try {
                        const API_URL = import.meta.env.VITE_API_URL || 'http://comidas.spring.informaticapp.com:2052';
                        const response = await fetch(`${API_URL}/restful/sucursales`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(branchData)
                        });
                        if (response.ok) {
                            const newBranch = await response.json();
                            if (newBranch?.id_sucursal) createdBranchId = newBranch.id_sucursal;
                        }
                    } catch (anonErr) { /* Silent fallback to nested */ }
                }

                // Final fallback: Nested POST
                if (!createdBranchId) {
                    try {
                        const API_URL = import.meta.env.VITE_API_URL || 'http://comidas.spring.informaticapp.com:2052';
                        const nestedUrl = `${API_URL}/restful/restaurantes/${newRestaurante.id_restaurante}/sucursales`;
                        const response = await fetch(nestedUrl, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${localStorage.getItem('superadminToken')}`
                            },
                            body: JSON.stringify(branchData)
                        });

                        if (response.ok) {
                            const newBranch = await response.json();
                            if (newBranch?.id_sucursal) createdBranchId = newBranch.id_sucursal;
                        }
                        // If 403 or any error, we'll try recovery below
                    } catch (nestedErr) { /* Will try recovery */ }
                }

                // INTELLIGENT RECOVERY: If still no ID, refetch restaurant to find embedded sucursales
                if (!createdBranchId) {
                    try {
                        // Wait a moment for DB to settle
                        await new Promise(resolve => setTimeout(resolve, 500));

                        const restaurantDetails = await superadminApi.getRestauranteById(newRestaurante.id_restaurante);
                        if (restaurantDetails?.sucursales?.length > 0) {
                            // Found embedded sucursales! Get the first one (should be the main branch)
                            createdBranchId = restaurantDetails.sucursales[0].id_sucursal;
                        }
                    } catch (recoveryErr) { /* Recovery failed */ }
                }
            }

            // If we still don't have the ID, use a special flag to indicate manual entry needed
            const needsManualEntry = !createdBranchId;

            return { ...newRestaurante, createdSucursalId: createdBranchId, needsManualEntry };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['restaurantes']);
            queryClient.invalidateQueries(['sucursales']);

            if (data.needsManualEntry) {
                toast.success('Restaurante creado. Necesitarás ingresar el ID de sucursal manualmente.');
            } else {
                toast.success('Restaurante y sucursal creados exitosamente.');
            }

            // Navigate to Create Client with PRE-FILLED data
            const params = new URLSearchParams();
            params.append('idRestaurante', data.id_restaurante);
            params.append('nombre', data.nombre);
            if (data.createdSucursalId) {
                params.append('idSucursal', data.createdSucursalId);
            }
            if (data.needsManualEntry) {
                params.append('needsManual', 'true');
            }

            setTimeout(() => {
                navigate(`/superadmin/crear-cliente?${params.toString()}`);
            }, 1500);

            setLoading(false);
        },
        onError: (error) => {
            toast.error('Error al crear restaurante: ' + error.message);
            setLoading(false);
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.target);
        const rawData = Object.fromEntries(formData.entries());

        // Validación de RUC
        if (rawData.ruc.length !== 11) {
            toast.error('El RUC debe tener 11 dígitos');
            setLoading(false);
            return;
        }

        // Formato estricto de fechas: yyyy-MM-dd HH:mm:ss
        const formatForApi = (dateString) => {
            if (!dateString) return null;
            return dateString.replace('T', ' ') + ':00';
        };

        const fechaCreacionFormatted = formatForApi(rawData.fecha_creacion);
        const fechaVencimientoFormatted = formatForApi(rawData.fecha_vencimiento);

        // ENVIAR AMBOS FORMATOS (snake_case y camelCase) para asegurar que el Backend lo lea
        const data = {
            ...rawData,
            // Claves en snake_case (según tu JSON de ejemplo)
            fecha_creacion: fechaCreacionFormatted,
            fecha_vencimiento: fechaVencimientoFormatted,
            email_contacto: rawData.email_contacto,
            direccion_principal: rawData.direccion_principal, // Explicit snake_case
            logo_url: rawData.logo_url,
            tasa_igv: rawData.tasa_igv,
            simbolo_moneda: rawData.simbolo_moneda,

            // Claves en camelCase (estándar Java Spring Boot)
            fechaCreacion: fechaCreacionFormatted,
            fechaVencimiento: fechaVencimientoFormatted,
            emailContacto: rawData.email_contacto,
            direccionPrincipal: rawData.direccion_principal,

            // Explicitly set these too just in case
            logoUrl: rawData.logo_url,
            tasaIgv: rawData.tasa_igv,
            simboloMoneda: rawData.simbolo_moneda
        };

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
                    <h1 className="text-2xl font-bold text-gray-900">Nuevo Restaurante</h1>
                    <p className="text-gray-500">Registra un nuevo restaurante en el sistema.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card className="p-8 space-y-8">
                    {/* Datos del Restaurante */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <FaStore className="text-blue-600" />
                            <span>Información del Restaurante</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <span>Nombre del Restaurante</span> <span className="text-red-500">*</span>
                                </label>
                                <input
                                    name="nombre"
                                    required
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Ej: Restaurante El Buen Sabor S.A.C."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <span>RUC</span> <span className="text-red-500">*</span>
                                </label>
                                <input
                                    name="ruc"
                                    required
                                    maxLength="11"
                                    pattern="[0-9]{11}"
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="20123456789"
                                />
                                <p className="text-xs text-gray-500 mt-1">11 dígitos numéricos</p>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <span>Email de Contacto</span> <span className="text-red-500">*</span>
                                </label>
                                <input
                                    name="email_contacto"
                                    type="email"
                                    required
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="contacto@restaurante.com"
                                />
                            </div>
                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <span>Fecha de Creación</span> <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        name="fecha_creacion"
                                        type="datetime-local"
                                        required
                                        defaultValue={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Formato estricto: yyyy-MM-dd HH:mm:ss</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <span>Fecha de Vencimiento</span> <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        name="fecha_vencimiento"
                                        type="datetime-local"
                                        required
                                        defaultValue={new Date(new Date().setFullYear(new Date().getFullYear() + 1) - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                            {/* Campo Moneda removido - no existe en la BD */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Símbolo Moneda
                                </label>
                                <input
                                    name="simbolo_moneda"
                                    defaultValue="S/"
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tasa IGV (%)
                                </label>
                                <input
                                    name="tasa_igv"
                                    type="number"
                                    step="0.01"
                                    defaultValue="18.00"
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Dirección Principal
                                </label>
                                <input
                                    name="direccion_principal"
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Ej: Av. Principal 123, Lima"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    URL del Logo
                                </label>
                                <input
                                    name="logo_url"
                                    type="url"
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="https://ejemplo.com/logo.png"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <p className="text-sm text-blue-800 flex items-center gap-2">
                            <FaFileInvoice className="inline shrink-0" />
                            <span>Depois de crear el restaurante, podrás crear la sucursal principal y asignar usuarios administradores.</span>
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-6">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || mutation.isPending}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium flex items-center gap-2 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
                        >
                            {loading || mutation.isPending ? (
                                <span>Guardando...</span>
                            ) : (
                                <>
                                    <FaSave />
                                    <span>Crear Restaurante</span>
                                </>
                            )}
                        </button>
                    </div>
                </Card>
            </form>
        </div>
    );
};

export default CrearRestaurantePage;