import { useState, useEffect } from 'react';
import { permisosAPI } from '../../services/superadminApi';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';

const PermisosPage = () => {
    const [permisos, setPermisos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [currentPermiso, setCurrentPermiso] = useState(null);
    const [formData, setFormData] = useState({ nombreModulo: '', estado: 1, orden: 0 });

    useEffect(() => {
        loadPermisos();
    }, []);

    const loadPermisos = async () => {
        try {
            const response = await permisosAPI.getAll();
            setPermisos(response.data);
        } catch (error) {
            toast.error('Error al cargar permisos');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentPermiso) {
                await permisosAPI.update(currentPermiso.idModulo, formData);
                toast.success('Permiso actualizado');
            } else {
                await permisosAPI.create(formData);
                toast.success('Permiso creado');
            }
            loadPermisos();
            handleCloseModal();
        } catch (error) {
            toast.error('Error al guardar permiso');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este permiso?')) {
            try {
                await permisosAPI.delete(id);
                toast.success('Permiso eliminado');
                loadPermisos();
            } catch (error) {
                toast.error('Error al eliminar permiso');
            }
        }
    };

    const handleOpenModal = (permiso = null) => {
        if (permiso) {
            setCurrentPermiso(permiso);
            setFormData({
                nombreModulo: permiso.nombreModulo,
                estado: permiso.estado,
                orden: permiso.orden || 0
            });
        } else {
            setCurrentPermiso(null);
            setFormData({ nombreModulo: '', estado: 1, orden: 0 });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentPermiso(null);
        setFormData({ nombreModulo: '', estado: 1, orden: 0 });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Gestión de Permisos/Módulos</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition"
                >
                    <FaPlus /> <span>Nuevo Permiso</span>
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12">Cargando...</div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre Módulo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orden</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {permisos.map((permiso) => (
                                <tr key={permiso.idModulo} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{permiso.idModulo}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{permiso.nombreModulo}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{permiso.orden}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs rounded-full ${permiso.estado === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {permiso.estado === 1 ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button
                                            onClick={() => handleOpenModal(permiso)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            <FaEdit className="inline" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(permiso.idModulo)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <FaTrash className="inline" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal Crear/Editar */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">{currentPermiso ? 'Editar Permiso' : 'Nuevo Permiso'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Módulo</label>
                                <input
                                    type="text"
                                    value={formData.nombreModulo}
                                    onChange={(e) => setFormData({ ...formData, nombreModulo: e.target.value })}
                                    className="w-full rounded-md border-gray-300 focus:ring-orange-500 focus:border-orange-500 px-3 py-2 border"
                                    placeholder="Ej: Gestión de Reportes"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Orden</label>
                                <input
                                    type="number"
                                    value={formData.orden}
                                    onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) })}
                                    className="w-full rounded-md border-gray-300 focus:ring-orange-500 focus:border-orange-500 px-3 py-2 border"
                                    min="0"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                                <select
                                    value={formData.estado}
                                    onChange={(e) => setFormData({ ...formData, estado: parseInt(e.target.value) })}
                                    className="w-full rounded-md border-gray-300 focus:ring-orange-500 focus:border-orange-500 px-3 py-2 border"
                                >
                                    <option value={1}>Activo</option>
                                    <option value={0}>Inactivo</option>
                                </select>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PermisosPage;
