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
        mutationFn: superadminApi.createRestaurante,
        onSuccess: () => {
            queryClient.invalidateQueries(['restaurantes']);
            toast.success('Restaurante creado exitosamente');
            setLoading(false);
            navigate('/superadmin/restaurantes');
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
        const data = Object.fromEntries(formData.entries());

        // Validación de RUC
        if (data.ruc.length !== 11) {
            toast.error('El RUC debe tener 11 dígitos');
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
                    <h1 className="text-2xl font-bold text-gray-900">Nuevo Restaurante</h1>
                    <p className="text-gray-500">Registra un nuevo restaurante en el sistema.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card className="p-8 space-y-8">
                    {/* Datos del Restaurante */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <FaStore className="text-blue-600" /> Información del Restaurante
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Razón Social <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    name="razon_social" 
                                    required 
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                                    placeholder="Ej: Restaurante El Buen Sabor S.A.C."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    RUC <span className="text-red-500">*</span>
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Moneda
                                </label>
                                <select 
                                    name="moneda" 
                                    defaultValue="PEN"
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                >
                                    <option value="PEN">Soles (PEN)</option>
                                    <option value="USD">Dólares (USD)</option>
                                </select>
                            </div>
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
                        <p className="text-sm text-blue-800">
                            <FaFileInvoice className="inline mr-2" />
                            Después de crear el restaurante, podrás crear la sucursal principal y asignar usuarios administradores.
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
                            {loading || mutation.isPending ? 'Guardando...' : <><FaSave /> Crear Restaurante</>}
                        </button>
                    </div>
                </Card>
            </form>
        </div>
    );
};

export default CrearRestaurantePage;