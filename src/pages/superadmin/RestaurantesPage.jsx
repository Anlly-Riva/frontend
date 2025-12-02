import { useState, useEffect } from 'react';
import { restaurantesAPI } from '../../services/superadminApi';
import { FaStore, FaEye } from 'react-icons/fa';
import toast from 'react-hot-toast';

const RestaurantesPage = () => {
    const [restaurantes, setRestaurantes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRestaurantes();
    }, []);

    const loadRestaurantes = async () => {
        try {
            const response = await restaurantesAPI.getAll();
            setRestaurantes(response.data);
        } catch (error) {
            toast.error('Error al cargar restaurantes');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Restaurantes Clientes</h1>
                    <p className="text-gray-600 text-sm">Lista de todos los restaurantes en el sistema</p>
                </div>
                <div className="text-right">
                    <p className="text-3xl font-bold text-blue-600">{restaurantes.length}</p>
                    <p className="text-sm text-gray-500">Total Clientes</p>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">Cargando...</div>
            ) : restaurantes.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <FaStore className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No hay restaurantes registrados</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {restaurantes.map((restaurante) => (
                        <div key={restaurante.id_restaurante} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200">
                            {/* Header Card */}
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                                <div className="flex items-center space-x-3">
                                    <FaStore className="text-2xl" />
                                    <div>
                                        <h3 className="font-bold text-lg">{restaurante.razon_social}</h3>
                                        <p className="text-xs text-blue-100">RUC: {restaurante.ruc}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Body Card */}
                            <div className="p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Dirección:</span>
                                    <span className="font-medium text-gray-900 text-right">{restaurante.direccion_principal || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Moneda:</span>
                                    <span className="font-medium text-gray-900">{restaurante.moneda} ({restaurante.simbolo_moneda})</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">IGV:</span>
                                    <span className="font-medium text-gray-900">{restaurante.tasa_igv}%</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Estado:</span>
                                    <span className={`px-2 py-1 text-xs rounded-full ${restaurante.estado === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {restaurante.estado === 1 ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                            </div>

                            {/* Footer Card */}
                            <div className="bg-gray-50 px-4 py-3 border-t">
                                <button className="w-full text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center justify-center space-x-2">
                                    <FaEye />
                                    <span>Ver Detalles</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RestaurantesPage;
