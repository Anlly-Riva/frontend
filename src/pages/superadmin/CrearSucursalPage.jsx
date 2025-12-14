import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FaStore, FaSave, FaArrowLeft, FaMapMarkerAlt, FaClock, FaPhone } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { superadminApi } from '../../services/superadminApi';
import { Card } from '../../components/superadmin/DashboardComponents';

const CrearSucursalPage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);

    // Fetch Restaurants
    const { data: restaurantes = [], isLoading: isLoadingRestaurantes } = useQuery({
        queryKey: ['restaurantes'],
        queryFn: superadminApi.getRestaurantes
    });

    const mutation = useMutation({
        mutationFn: superadminApi.createSucursal,
        onSuccess: () => {
            queryClient.invalidateQueries(['sucursales']);
            toast.success('Sucursal creada exitosamente');
            setLoading(false);
            navigate('/superadmin/sucursales');
        },
        onError: (error) => {
            toast.error('Error al crear sucursal: ' + error.message);
            setLoading(false);
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        if (!data.id_restaurante) {
            toast.error('Debes seleccionar un restaurante');
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
                    <h1 className="text-2xl font-bold text-gray-900"><span>Nueva Sucursal</span></h1>
                    <p className="text-gray-500"><span>Agrega una sucursal a un restaurante existente.</span></p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card className="p-8 space-y-8">
                    {/* Selección de Restaurante */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <FaStore className="text-blue-600" />
                            <span>Restaurante Propietario</span>
                        </h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1"><span>Seleccionar Restaurante</span></label>
                            <select
                                name="id_restaurante"
                                required
                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            >
                                <option value="">Seleccionar...</option>
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
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Datos de la Sucursal */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <FaMapMarkerAlt className="text-purple-600" />
                            <span>Datos de la Sucursal</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1"><span>Nombre de la Sucursal</span></label>
                                <input
                                    name="nombre"
                                    required
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                    placeholder="Ej: Sede Norte, Sucursal Centro..."
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1"><span>Dirección</span></label>
                                <input
                                    name="direccion"
                                    required
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                    placeholder="Ej: Av. Principal 123"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1"><span>Teléfono</span></label>
                                <div className="relative">
                                    <FaPhone className="absolute left-3 top-3.5 text-gray-400" />
                                    <input
                                        name="telefono"
                                        className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1"><span>Horario de Atención</span></label>
                                <div className="relative">
                                    <FaClock className="absolute left-3 top-3.5 text-gray-400" />
                                    <input
                                        name="horario_atencion"
                                        className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                        placeholder="Ej: Lun-Dom 9am - 10pm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6">
                        <button
                            type="submit"
                            disabled={loading || mutation.isPending}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium flex items-center gap-2 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-200"
                        >
                            {loading || mutation.isPending ? (
                                <span>Guardando...</span>
                            ) : (
                                <>
                                    <FaSave />
                                    <span>Crear Sucursal</span>
                                </>
                            )}
                        </button>
                    </div>
                </Card>
            </form>
        </div>
    );
};

export default CrearSucursalPage;
