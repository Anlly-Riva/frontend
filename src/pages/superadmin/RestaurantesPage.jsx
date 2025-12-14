import { useState, useEffect } from 'react';
import { restaurantesAPI } from '../../services/superadminApi';
import { FaStore, FaEye, FaTimes, FaCheck, FaBan, FaMapMarkerAlt, FaMoneyBillWave, FaPercentage, FaCalendarAlt, FaEdit, FaSave, FaGlobe } from 'react-icons/fa';
import toast from 'react-hot-toast';

const RestaurantesPage = () => {
    const [restaurantes, setRestaurantes] = useState([]);
    const [selectedRestaurante, setSelectedRestaurante] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({});

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

    const handleOpenModal = (restaurante) => {
        setSelectedRestaurante(restaurante);
        setEditForm(restaurante);
        setIsEditing(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        try {
            await restaurantesAPI.update(selectedRestaurante.id_restaurante, editForm);

            // Actualizar lista localmente
            setRestaurantes(restaurantes.map(r =>
                r.id_restaurante === selectedRestaurante.id_restaurante
                    ? { ...r, ...editForm }
                    : r
            ));

            setSelectedRestaurante({ ...selectedRestaurante, ...editForm });
            setIsEditing(false);
            toast.success('Restaurante actualizado correctamente');
        } catch (error) {
            console.error('Error al actualizar:', error);
            toast.error('Error al actualizar el restaurante');
        }
    };

    const handleToggleEstado = async (restaurante) => {
        try {
            const nuevoEstado = restaurante.estado === 1 ? 0 : 1;
            await restaurantesAPI.update(restaurante.id_restaurante, {
                ...restaurante,
                estado: nuevoEstado
            });

            toast.success(`Restaurante ${nuevoEstado === 1 ? 'activado' : 'desactivado'} correctamente`);

            // Actualizar lista localmente
            setRestaurantes(restaurantes.map(r =>
                r.id_restaurante === restaurante.id_restaurante
                    ? { ...r, estado: nuevoEstado }
                    : r
            ));

            // Actualizar modal si está abierto
            if (selectedRestaurante?.id_restaurante === restaurante.id_restaurante) {
                const updatedRestaurante = { ...selectedRestaurante, estado: nuevoEstado };
                setSelectedRestaurante(updatedRestaurante);
                setEditForm(updatedRestaurante);
            }
        } catch (error) {
            console.error('Error al cambiar estado:', error);
            toast.error('Error al cambiar el estado del restaurante');
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
                                    <span className="font-medium text-gray-900 text-right truncate max-w-[150px]" title={restaurante.direccion_principal}>{restaurante.direccion_principal || 'N/A'}</span>
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
                                        <span>{restaurante.estado === 1 ? 'Activo' : 'Inactivo'}</span>
                                    </span>
                                </div>
                            </div>

                            {/* Footer Card */}
                            <div className="bg-gray-50 px-4 py-3 border-t">
                                <button
                                    onClick={() => handleOpenModal(restaurante)}
                                    className="w-full text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center justify-center space-x-2"
                                >
                                    <FaEye />
                                    <span>Ver Detalles</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}


            {/* Modal de Detalles */}
            {selectedRestaurante && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fadeIn">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white flex justify-between items-center sticky top-0 z-10">
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <FaStore className="text-yellow-300" />
                                {selectedRestaurante.razon_social}
                            </h2>
                            <button
                                onClick={() => setSelectedRestaurante(null)}
                                className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
                            >
                                <FaTimes size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Estado y Acciones */}
                            <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-3 rounded-full ${selectedRestaurante.estado === 1 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {selectedRestaurante.estado === 1 ? <FaCheck size={20} /> : <FaBan size={20} />}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium"><span>Estado Actual</span></p>
                                        <span className={`text-lg font-bold ${selectedRestaurante.estado === 1 ? 'text-green-700' : 'text-red-700'}`}>
                                            <span>{selectedRestaurante.estado === 1 ? 'ACTIVO' : 'INACTIVO'}</span>
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {!isEditing && (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-blue-600 bg-blue-100 hover:bg-blue-200 transition-colors"
                                        >
                                            <FaEdit /> <span>Editar</span>
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleToggleEstado(selectedRestaurante)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-white transition-all shadow-md ${selectedRestaurante.estado === 1
                                            ? 'bg-red-500 hover:bg-red-600'
                                            : 'bg-green-500 hover:bg-green-600'
                                            }`}
                                    >
                                        {selectedRestaurante.estado === 1 ? (
                                            <> <FaBan /> <span>Desactivar</span> </>
                                        ) : (
                                            <> <FaCheck /> <span>Activar</span> </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Detalles Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                                        <FaStore className="text-blue-500" /> Información General
                                    </h3>
                                    <DetailItem icon={<FaStore />} label="Razón Social" value={selectedRestaurante.razon_social} />
                                    <DetailItem icon={<FaStore />} label="RUC" value={selectedRestaurante.ruc} />

                                    {isEditing ? (
                                        <div className="space-y-1">
                                            <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">Dirección</label>
                                            <input
                                                type="text"
                                                name="direccion_principal"
                                                value={editForm.direccion_principal || ''}
                                                onChange={handleInputChange}
                                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            />
                                        </div>
                                    ) : (
                                        <DetailItem icon={<FaMapMarkerAlt />} label="Dirección" value={selectedRestaurante.direccion_principal} />
                                    )}

                                    <DetailItem icon={<FaCalendarAlt />} label="Fecha Registro" value={selectedRestaurante.fecha_registro ? new Date(selectedRestaurante.fecha_registro).toLocaleDateString() : 'N/A'} />
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                                        <FaMoneyBillWave className="text-green-500" /> Configuración
                                    </h3>
                                    <DetailItem icon={<FaMoneyBillWave />} label="Moneda" value={`${selectedRestaurante.moneda} (${selectedRestaurante.simbolo_moneda})`} />

                                    {isEditing ? (
                                        <div className="space-y-1">
                                            <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">Tasa IGV (%)</label>
                                            <input
                                                type="number"
                                                name="tasa_igv"
                                                value={editForm.tasa_igv || 0}
                                                onChange={handleInputChange}
                                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            />
                                        </div>
                                    ) : (
                                        <DetailItem icon={<FaPercentage />} label="Tasa IGV" value={`${selectedRestaurante.tasa_igv}%`} />
                                    )}

                                    {isEditing ? (
                                        <div className="space-y-1">
                                            <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">URL del Logo</label>
                                            <input
                                                type="text"
                                                name="logo_url"
                                                value={editForm.logo_url || ''}
                                                onChange={handleInputChange}
                                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                placeholder="https://..."
                                            />
                                        </div>
                                    ) : (
                                        <DetailItem icon={<FaGlobe />} label="URL Logo" value={selectedRestaurante.logo_url || 'No configurado'} />
                                    )}

                                    <DetailItem icon={<FaStore />} label="ID Sistema" value={selectedRestaurante.id_restaurante} />
                                </div>
                            </div>

                            {/* Botones de Acción en Edición */}
                            {isEditing && (
                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg"
                                    >
                                        <FaSave /> Guardar Cambios
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper component para los detalles
const DetailItem = ({ icon, label, value }) => (
    <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded transition-colors">
        <div className="text-blue-500 mt-1 text-lg">{icon}</div>
        <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
            <p className="font-medium text-gray-900 break-words">{value || 'N/A'}</p>
        </div>
    </div>
);

export default RestaurantesPage;
