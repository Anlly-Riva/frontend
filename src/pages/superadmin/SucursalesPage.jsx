import { useState, useEffect } from 'react';
import { superadminApi } from '../../services/superadminApi';
import { FaStore, FaMapMarkerAlt, FaPhone, FaClock, FaCheck, FaBan, FaBuilding } from 'react-icons/fa';
import toast from 'react-hot-toast';

const SucursalesPage = () => {
    const [sucursales, setSucursales] = useState([]);
    const [restaurantes, setRestaurantes] = useState([]); // Nuevo estado para mapear nombres
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Cagar sucursales y restaurantes en paralelo
            const [sucursalesData, restaurantesData] = await Promise.all([
                superadminApi.getSucursales(),
                superadminApi.getRestaurantes()
            ]);

            setSucursales(sucursalesData);
            setRestaurantes(restaurantesData);
        } catch (error) {
            console.error('Error al cargar datos:', error);
            toast.error('Error al cargar la información');
        } finally {
            setLoading(false);
        }
    };

    // Helper para obtener nombre del restaurante
    const getNombreRestaurante = (idRestaurante) => {
        // Usamos == para comparar string/number por si acaso
        const restaurante = restaurantes.find(r => r.id_restaurante == idRestaurante);
        return restaurante ? restaurante.razon_social : 'Restaurante No Encontrado';
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800"><span>Sucursales Registradas</span></h1>
                    <p className="text-gray-600 text-sm"><span>Listado de todas las sucursales y sus restaurantes.</span></p>
                </div>
                <div className="text-right">
                    <p className="text-3xl font-bold text-purple-600"><span>{sucursales.length}</span></p>
                    <p className="text-sm text-gray-500"><span>Total Sucursales</span></p>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12"><span>Cargando...</span></div>
            ) : sucursales.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <FaStore className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500"><span>No hay sucursales registradas</span></p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sucursales.map((sucursal) => (
                        <div key={sucursal.id_sucursal} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200">
                            {/* Header Card */}
                            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 text-white">
                                <div className="flex items-center space-x-3">
                                    <FaBuilding className="text-2xl" />
                                    <div>
                                        <h3 className="font-bold text-lg"><span>{sucursal.nombre}</span></h3>
                                        <div className="text-xs text-purple-100 flex items-center gap-1">
                                            <FaStore className="text-xs" />
                                            <span>{getNombreRestaurante(sucursal.id_restaurante)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Body Card */}
                            <div className="p-4 space-y-3">
                                <div className="flex items-start gap-3">
                                    <FaMapMarkerAlt className="text-blue-500 mt-1 shrink-0" />
                                    <div className="text-sm">
                                        <p className="text-gray-500 text-xs uppercase font-bold"><span>Dirección</span></p>
                                        <p className="text-gray-800 font-medium line-clamp-2" title={sucursal.direccion}>
                                            <span>{sucursal.direccion || 'N/A'}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <FaPhone className="text-green-500 shrink-0" />
                                    <div className="text-sm">
                                        <p className="text-gray-500 text-xs uppercase font-bold"><span>Teléfono</span></p>
                                        <p className="text-gray-800 font-medium"><span>{sucursal.telefono || 'N/A'}</span></p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <FaClock className="text-orange-500 shrink-0" />
                                    <div className="text-sm">
                                        <p className="text-gray-500 text-xs uppercase font-bold"><span>Horario</span></p>
                                        <p className="text-gray-800 font-medium"><span>{sucursal.horario_atencion || 'N/A'}</span></p>
                                    </div>
                                </div>

                                <div className="pt-2 border-t flex justify-between items-center">
                                    <span className="text-xs font-bold text-gray-500"><span>ESTADO</span></span>
                                    <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${sucursal.estado === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {sucursal.estado === 1 ? <FaCheck className="text-[10px]" /> : <FaBan className="text-[10px]" />}
                                        <span>{sucursal.estado === 1 ? 'ACTIVA' : 'INACTIVA'}</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SucursalesPage;
