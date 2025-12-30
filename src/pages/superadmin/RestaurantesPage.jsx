import { useState, useEffect } from 'react';
import { restaurantesAPI, superadminApi } from '../../services/superadminApi';
import { FaStore, FaEye, FaTimes, FaCheck, FaBan, FaMapMarkerAlt, FaMoneyBillWave, FaPercentage, FaCalendarAlt, FaEdit, FaSave, FaGlobe, FaSearch, FaUser } from 'react-icons/fa';
import toast from 'react-hot-toast';

const RestaurantesPage = () => {
    const [restaurantes, setRestaurantes] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [sucursales, setSucursales] = useState([]);
    const [selectedRestaurante, setSelectedRestaurante] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Load restaurants, users, AND branches to link them correctly
            const [restResponse, usersData, sucursalesData] = await Promise.all([
                restaurantesAPI.getAll(),
                superadminApi.getUsuarios(),
                superadminApi.getSucursales().catch(e => {
                    console.warn('Could not fetch sucursales/todos, user linking might fail:', e);
                    return [];
                })
            ]);

            setRestaurantes(restResponse.data);
            setUsuarios(usersData);
            setSucursales(Array.isArray(sucursalesData) ? sucursalesData : []);
        } catch (error) {
            console.error('Error cargando datos:', error);
            toast.error('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    // Correctly link User -> Sucursal -> Restaurant
    const getUsuarioRelacionado = (restaurante) => {
        const idRest = restaurante.id_restaurante || restaurante.idRestaurante;

        // Strategy A: Strict matching via 'sucursales' list
        const misSucursales = sucursales.filter(s =>
            (s.id_restaurante || s.idRestaurante) === idRest
        );
        const idsSucursales = misSucursales.map(s => s.id_sucursal || s.idSucursal);

        if (idsSucursales.length > 0) {
            const foundUser = usuarios.find(u => {
                const userSucursalId = u.idSucursal || u.id_sucursal;
                return idsSucursales.includes(userSucursalId);
            });
            if (foundUser) return foundUser;
        }

        // Strategy B: Fallback (Legacy/Direct matching)
        // Checks if user.idSucursal DIRECTLY matches restaurant.idRestaurante
        // This handles cases where 'sucursales' table might be empty or data is old.
        return usuarios.find(u =>
            (u.idSucursal || u.id_sucursal) === idRest
        );
    };

    // Filtrar restaurantes por búsqueda
    const filteredRestaurantes = restaurantes
        .filter(r =>
            r.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.ruc?.includes(searchTerm) ||
            getUsuarioRelacionado(r)?.nombreUsuario?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => new Date(b.fecha_creacion || b.fecha_registro) - new Date(a.fecha_creacion || a.fecha_registro));

    const handleOpenModal = (restaurante) => {
        setSelectedRestaurante(restaurante);
        setEditForm({});
        setIsEditing(false);
    };

    const handleToggleEstado = async (restaurante) => {
        try {
            const id = restaurante.id_restaurante || restaurante.idRestaurante;
            if (!id) return;

            const nuevoEstado = restaurante.estado === 1 ? 0 : 1;

            // Helper for strict date formatting (reused logic)
            const formatForApi = (dateString) => {
                if (!dateString) return null;
                if (Array.isArray(dateString)) return null;
                const str = String(dateString);
                let formatted = str.replace('T', ' ');
                if (formatted.split(':').length === 2) formatted += ':00';
                if (formatted.includes('.')) formatted = formatted.split('.')[0];
                return formatted;
            };

            const payload = {
                id_restaurante: id, // Some backends might want it in body too, safety first for this specific check
                nombre: restaurante.nombre,
                ruc: restaurante.ruc,
                email_contacto: restaurante.email_contacto || restaurante.emailContacto,
                emailContacto: restaurante.email_contacto || restaurante.emailContacto,
                direccion: restaurante.direccion_principal || restaurante.direccionPrincipal || restaurante.direccion,
                direccion_principal: restaurante.direccion_principal || restaurante.direccionPrincipal,
                direccionPrincipal: restaurante.direccion_principal || restaurante.direccionPrincipal,
                simbolo_moneda: restaurante.simbolo_moneda || restaurante.simboloMoneda || 'S/',
                simboloMoneda: restaurante.simbolo_moneda || restaurante.simboloMoneda || 'S/',
                tasa_igv: restaurante.tasa_igv || restaurante.tasaIgv || 0,
                tasaIgv: restaurante.tasa_igv || restaurante.tasaIgv || 0,
                logo_url: restaurante.logo_url || restaurante.logoUrl,
                logoUrl: restaurante.logo_url || restaurante.logoUrl,

                // IMPORTANT: The state change
                estado: nuevoEstado,

                fecha_creacion: formatForApi(restaurante.fecha_creacion || restaurante.fechaCreacion),
                fechaCreacion: formatForApi(restaurante.fecha_creacion || restaurante.fechaCreacion),
                fecha_vencimiento: formatForApi(restaurante.fecha_vencimiento || restaurante.fechaVencimiento),
                fechaVencimiento: formatForApi(restaurante.fecha_vencimiento || restaurante.fechaVencimiento),
                fecha_registro: formatForApi(restaurante.fecha_registro || restaurante.fechaRegistro),
                fechaRegistro: formatForApi(restaurante.fecha_registro || restaurante.fechaRegistro),
            };

            await restaurantesAPI.update(id, payload);

            toast.success(`Restaurante ${nuevoEstado === 1 ? 'activado' : 'desactivado'} exitosamente`);
            loadData();

            // If the modal is open for this one, update it too
            if (selectedRestaurante && (selectedRestaurante.id_restaurante === id || selectedRestaurante.idRestaurante === id)) {
                setSelectedRestaurante({ ...selectedRestaurante, estado: nuevoEstado });
            }
        } catch (error) {
            console.error('Error al cambiar estado:', error);
            toast.error('Error al cambiar el estado. Verifique la consola.');
        }
    };

    const handleInputChange = (e) => {
        setEditForm({
            ...editForm,
            [e.target.name]: e.target.value
        });
    };

    const handleSave = async () => {
        try {
            const id = selectedRestaurante.id_restaurante || selectedRestaurante.idRestaurante;
            if (!id) {
                toast.error('Error: No se encuentra el ID del restaurante');
                return;
            }

            // Helper for strict date formatting (yyyy-MM-dd HH:mm:ss)
            const formatForApi = (dateString) => {
                if (!dateString) return null;
                // If it's already an array (Spring default sometimes), let it be? No, likely string.
                if (Array.isArray(dateString)) return null; // Or handle if needed

                // Ensure it's a string
                const str = String(dateString);

                // If it contains "T", replace it. Append seconds if missing.
                let formatted = str.replace('T', ' ');
                if (formatted.split(':').length === 2) {
                    formatted += ':00';
                }
                // Truncate milliseconds if present (e.g. .000 or .123)
                if (formatted.includes('.')) {
                    formatted = formatted.split('.')[0];
                }
                return formatted;
            };

            // Format dates ONCE
            const cleanFechaCreacion = formatForApi(selectedRestaurante.fecha_creacion || selectedRestaurante.fechaCreacion);
            const cleanFechaVencimiento = formatForApi(selectedRestaurante.fecha_vencimiento || selectedRestaurante.fechaVencimiento);
            const cleanFechaRegistro = formatForApi(selectedRestaurante.fecha_registro || selectedRestaurante.fechaRegistro);

            // Construct CLEAN payload (scalers only) to avoid backend confusion with nested objects
            const payload = {
                // IDs - REMOVED from body to avoid conflicts (ID is in URL)
                // id_restaurante: id,
                // idRestaurante: id,

                // Standard Info (Merge editForm > selectedRestaurante)
                nombre: editForm.nombre || selectedRestaurante.nombre,
                ruc: editForm.ruc || selectedRestaurante.ruc,

                email_contacto: editForm.emailContacto || editForm.email_contacto || selectedRestaurante.email_contacto || selectedRestaurante.emailContacto,
                emailContacto: editForm.emailContacto || editForm.email_contacto || selectedRestaurante.email_contacto || selectedRestaurante.emailContacto,

                // Send variants of address keys to hit the target
                direccion: editForm.direccionPrincipal || editForm.direccion_principal || selectedRestaurante.direccion_principal || selectedRestaurante.direccionPrincipal,
                direccion_principal: editForm.direccionPrincipal || editForm.direccion_principal || selectedRestaurante.direccion_principal || selectedRestaurante.direccionPrincipal,
                direccionPrincipal: editForm.direccionPrincipal || editForm.direccion_principal || selectedRestaurante.direccion_principal || selectedRestaurante.direccionPrincipal,

                simbolo_moneda: editForm.simboloMoneda || editForm.simbolo_moneda || selectedRestaurante.simbolo_moneda || selectedRestaurante.simboloMoneda || 'S/',
                simboloMoneda: editForm.simboloMoneda || editForm.simbolo_moneda || selectedRestaurante.simbolo_moneda || selectedRestaurante.simboloMoneda || 'S/',

                tasa_igv: editForm.tasaIgv || editForm.tasa_igv || selectedRestaurante.tasa_igv || selectedRestaurante.tasaIgv || 0,
                tasaIgv: editForm.tasaIgv || editForm.tasa_igv || selectedRestaurante.tasa_igv || selectedRestaurante.tasaIgv || 0,

                logo_url: editForm.logoUrl || editForm.logo_url || selectedRestaurante.logo_url || selectedRestaurante.logoUrl,
                logoUrl: editForm.logoUrl || editForm.logo_url || selectedRestaurante.logo_url || selectedRestaurante.logoUrl,

                estado: selectedRestaurante.estado, // Usually handled by toggle, but keep for consistency

                // Clean Dates
                fecha_creacion: cleanFechaCreacion,
                fechaCreacion: cleanFechaCreacion,
                fecha_vencimiento: cleanFechaVencimiento,
                fechaVencimiento: cleanFechaVencimiento,
                fecha_registro: cleanFechaRegistro,
                fechaRegistro: cleanFechaRegistro
            };

            console.log("📤 Sending Update Payload:", payload);
            await restaurantesAPI.update(id, payload);

            toast.success('Restaurante actualizado');
            setIsEditing(false);
            loadData();

            // Update local state
            const updated = { ...selectedRestaurante, ...payload };
            // Ensure Snake Case properties are also updated for display
            if (payload.direccionPrincipal) updated.direccion_principal = payload.direccionPrincipal;
            if (payload.tasaIgv) updated.tasa_igv = payload.tasaIgv;
            if (payload.logoUrl) updated.logo_url = payload.logoUrl;

            setSelectedRestaurante(updated);

        } catch (error) {
            console.error('Error actualizando:', error);
            toast.error('Error al actualizar');
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
                    <p className="text-3xl font-bold text-blue-600">{filteredRestaurantes.length}</p>
                    <p className="text-sm text-gray-500">Clientes totales</p>
                </div>
            </div>

            {/* Search Input */}
            <div className="mb-6">
                <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-lg border border-gray-200 shadow-sm w-full md:w-96">
                    <FaSearch className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, RUC o usuario..."
                        className="bg-transparent border-none outline-none w-full text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">Cargando...</div>
            ) : filteredRestaurantes.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <FaStore className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No hay restaurantes que coincidan con la búsqueda</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRestaurantes.map((restaurante) => {
                        const usuarioRelacionado = getUsuarioRelacionado(restaurante);
                        return (
                            <div key={restaurante.id_restaurante} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200">
                                {/* Header Card */}
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                                    <div className="flex items-center space-x-3">
                                        <FaStore className="text-2xl" />
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg">{restaurante.nombre}</h3>
                                            <p className="text-xs text-blue-100">RUC: {restaurante.ruc}</p>
                                        </div>
                                    </div>
                                    {/* Usuario relacionado */}
                                    {usuarioRelacionado && (
                                        <div className="mt-2 flex items-center gap-2 bg-white/20 rounded-lg px-2 py-1">
                                            <FaUser className="text-xs" />
                                            <span className="text-xs">
                                                {usuarioRelacionado.nombreUsuario} (@{usuarioRelacionado.nombreUsuarioLogin})
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Body Card */}
                                <div className="p-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Dirección:</span>
                                        <span className="font-medium text-gray-900 text-right truncate max-w-[150px]" title={restaurante.direccion || restaurante.direccion_principal || restaurante.direccionPrincipal}>{restaurante.direccion || restaurante.direccion_principal || restaurante.direccionPrincipal || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Moneda:</span>
                                        <span className="font-medium text-gray-900">{restaurante.simbolo_moneda || restaurante.simboloMoneda || 'S/'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">IGV:</span>
                                        <span className="font-medium text-gray-900">{restaurante.tasa_igv || restaurante.tasaIgv || 0}%</span>
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
                        );
                    })}
                </div>
            )}

            {/* Modal de Detalles */}
            {selectedRestaurante && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fadeIn">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white flex justify-between items-center sticky top-0 z-10">
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <FaStore className="text-yellow-300" />
                                {selectedRestaurante.nombre}
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
                                    <DetailItem icon={<FaStore />} label="Nombre" value={selectedRestaurante.nombre} />
                                    <DetailItem icon={<FaStore />} label="RUC" value={selectedRestaurante.ruc} />

                                    {isEditing ? (
                                        <div className="space-y-1">
                                            <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">Dirección</label>
                                            <input
                                                type="text"
                                                name="direccionPrincipal"
                                                value={editForm.direccionPrincipal || editForm.direccion_principal || ''}
                                                onChange={handleInputChange}
                                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            />
                                        </div>
                                    ) : (
                                        <DetailItem icon={<FaMapMarkerAlt />} label="Dirección" value={selectedRestaurante.direccion || selectedRestaurante.direccion_principal || selectedRestaurante.direccionPrincipal} />
                                    )}

                                    <DetailItem
                                        icon={<FaCalendarAlt />}
                                        label="Fecha Registro"
                                        value={
                                            (selectedRestaurante.fecha_registro || selectedRestaurante.fecha_creacion || selectedRestaurante.fechaCreacion)
                                                ? new Date(selectedRestaurante.fecha_registro || selectedRestaurante.fecha_creacion || selectedRestaurante.fechaCreacion).toLocaleDateString()
                                                : 'N/A'
                                        }
                                    />
                                    <DetailItem
                                        icon={<FaCalendarAlt />}
                                        label="Fecha Vencimiento"
                                        value={
                                            (selectedRestaurante.fecha_vencimiento || selectedRestaurante.fechaVencimiento)
                                                ? new Date(selectedRestaurante.fecha_vencimiento || selectedRestaurante.fechaVencimiento).toLocaleDateString()
                                                : 'N/A'
                                        }
                                    />
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                                        <FaUser className="text-purple-500" /> Administrador
                                    </h3>
                                    {(() => {
                                        const admin = getUsuarioRelacionado(selectedRestaurante);
                                        return admin ? (
                                            <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                                                <p className="font-bold text-gray-900">{admin.nombreUsuario} {admin.apellidoUsuario || admin.apellido_usuario || ''}</p>
                                                <p className="text-xs text-gray-500">@{admin.nombreUsuarioLogin}</p>
                                                <p className="text-xs text-gray-500 mt-1">DNI: {admin.dniUsuario || admin.dni_usuario || 'N/A'}</p>
                                                <p className="text-xs text-gray-500">Tel: {admin.telefonoUsuario || admin.telefono_usuario || 'N/A'}</p>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-400 italic">No asignado</p>
                                        );
                                    })()}

                                    <h3 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2 mt-6">
                                        <FaMoneyBillWave className="text-green-500" /> Configuración
                                    </h3>
                                    <DetailItem icon={<FaMoneyBillWave />} label="Moneda" value={selectedRestaurante.simbolo_moneda || selectedRestaurante.simboloMoneda || 'S/'} />

                                    {isEditing ? (
                                        <div className="space-y-1">
                                            <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">Tasa IGV (%)</label>
                                            <input
                                                type="number"
                                                name="tasaIgv"
                                                value={editForm.tasaIgv || editForm.tasa_igv || 0}
                                                onChange={handleInputChange}
                                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            />
                                        </div>
                                    ) : (
                                        <DetailItem icon={<FaPercentage />} label="Tasa IGV" value={`${selectedRestaurante.tasa_igv || selectedRestaurante.tasaIgv || 0}%`} />
                                    )}

                                    {isEditing ? (
                                        <div className="space-y-1">
                                            <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">URL del Logo</label>
                                            <input
                                                type="text"
                                                name="logoUrl"
                                                value={editForm.logoUrl || editForm.logo_url || ''}
                                                onChange={handleInputChange}
                                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                placeholder="https://..."
                                            />
                                        </div>
                                    ) : (
                                        <DetailItem icon={<FaGlobe />} label="URL Logo" value={selectedRestaurante.logo_url || selectedRestaurante.logoUrl || 'No configurado'} />
                                    )}

                                    <DetailItem icon={<FaStore />} label="ID Sistema" value={selectedRestaurante.id_restaurante || selectedRestaurante.idRestaurante} />
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
