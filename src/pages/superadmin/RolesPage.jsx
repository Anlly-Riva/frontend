import { useState, useEffect } from 'react';
import { rolesAPI, permisosAPI } from '../../services/superadminApi';
import { FaPlus, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';

const RolesPage = () => {
    const [roles, setRoles] = useState([]);
    const [permisos, setPermisos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showPermisosModal, setShowPermisosModal] = useState(false);
    const [currentRol, setCurrentRol] = useState(null);
    const [selectedPermisos, setSelectedPermisos] = useState([]);
    const [formData, setFormData] = useState({ nombrePerfil: '', estado: 1 });

    useEffect(() => {
        loadRoles();
        loadPermisos();
    }, []);

    const loadRoles = async () => {
        try {
            const response = await rolesAPI.getAll();
            setRoles(response.data);
        } catch (error) {
            toast.error('Error al cargar roles');
        } finally {
            setLoading(false);
        }
    };

    const loadPermisos = async () => {
        try {
            const response = await permisosAPI.getAll();
            setPermisos(response.data);
        } catch (error) {
            toast.error('Error al cargar permisos');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentRol) {
                await rolesAPI.update(currentRol.idPerfil, formData);
                toast.success('Rol actualizado');
            } else {
                await rolesAPI.create(formData);
                toast.success('Rol creado');
            }
            loadRoles();
            handleCloseModal();
        } catch (error) {
            toast.error('Error al guardar rol');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este rol?')) {
            try {
                await rolesAPI.delete(id);
                toast.success('Rol eliminado');
                loadRoles();
            } catch (error) {
                toast.error('Error al eliminar rol');
            }
        }
    };

    const handleOpenModal = (rol = null) => {
        if (rol) {
            setCurrentRol(rol);
            setFormData({ nombrePerfil: rol.nombrePerfil.replace('SUPERADMIN_', ''), estado: rol.estado });
        } else {
            setCurrentRol(null);
            setFormData({ nombrePerfil: '', estado: 1 });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentRol(null);
        setFormData({ nombrePerfil: '', estado: 1 });
    };

    const handleOpenPermisosModal = async (rol) => {
        setCurrentRol(rol);
        try {
            const response = await rolesAPI.getPermisos(rol.idPerfil);
            setSelectedPermisos(response.data);
            setShowPermisosModal(true);
        } catch (error) {
            toast.error('Error al cargar permisos del rol');
        }
    };

    const handleSavePermisos = async () => {
        try {
            await rolesAPI.assignPermisos(currentRol.idPerfil, selectedPermisos);
            toast.success('Permisos asignados correctamente');
            setShowPermisosModal(false);
        } catch (error) {
            toast.error('Error al asignar permisos');
        }
    };

    const togglePermiso = (idModulo) => {
        setSelectedPermisos(prev =>
            prev.includes(idModulo)
                ? prev.filter(id => id !== idModulo)
                : [...prev, idModulo]
        );
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Gestión de Roles SuperAdmin</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition"
                >
                    <FaPlus /> <span>Nuevo Rol</span>
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {roles.map((rol) => (
                                <tr key={rol.idPerfil} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rol.idPerfil}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rol.nombrePerfil}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs rounded-full ${rol.estado === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {rol.estado === 1 ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button
                                            onClick={() => handleOpenPermisosModal(rol)}
                                            className="text-purple-600 hover:text-purple-900"
                                        >
                                            <FaCheck className="inline" /> Permisos
                                        </button>
                                        <button
                                            onClick={() => handleOpenModal(rol)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            <FaEdit className="inline" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(rol.idPerfil)}
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
                        <h2 className="text-xl font-bold mb-4">{currentRol ? 'Editar Rol' : 'Nuevo Rol'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Rol</label>
                                <div className="flex">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                        SUPERADMIN_
                                    </span>
                                    <input
                                        type="text"
                                        value={formData.nombrePerfil}
                                        onChange={(e) => setFormData({ ...formData, nombrePerfil: e.target.value })}
                                        className="flex-1 rounded-r-md border-gray-300 focus:ring-red-500 focus:border-red-500 px-3 py-2 border"
                                        placeholder="MASTER, SOPORTE, etc."
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                                <select
                                    value={formData.estado}
                                    onChange={(e) => setFormData({ ...formData, estado: parseInt(e.target.value) })}
                                    className="w-full rounded-md border-gray-300 focus:ring-red-500 focus:border-red-500 px-3 py-2 border"
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
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Asignar Permisos */}
            {showPermisosModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">Asignar Permisos a {currentRol?.nombrePerfil}</h2>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            {permisos.map((permiso) => (
                                <label key={permiso.idModulo} className="flex items-center space-x-2 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedPermisos.includes(permiso.idModulo)}
                                        onChange={() => togglePermiso(permiso.idModulo)}
                                        className="rounded text-red-600 focus:ring-red-500"
                                    />
                                    <span className="text-sm">{permiso.nombreModulo}</span>
                                </label>
                            ))}
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setShowPermisosModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSavePermisos}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                Guardar Permisos
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RolesPage;
