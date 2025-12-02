import { useState, useEffect } from 'react';
import { perfilesAPI } from '../services/api';
import { FiUsers, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import PerfilModal from '../components/perfiles/PerfilModal';

export default function PerfilesPage() {
    const [perfiles, setPerfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedPerfil, setSelectedPerfil] = useState(null);

    useEffect(() => {
        fetchPerfiles();
    }, []);

    const fetchPerfiles = async () => {
        try {
            setLoading(true);
            const response = await perfilesAPI.getAll();
            setPerfiles(response.data);
        } catch (error) {
            console.error('Error fetching perfiles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedPerfil(null);
        setShowModal(true);
    };

    const handleEdit = (perfil) => {
        setSelectedPerfil(perfil);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este perfil?')) return;

        try {
            await perfilesAPI.delete(id);
            fetchPerfiles();
        } catch (error) {
            console.error('Error deleting perfil:', error);
            alert('Error al eliminar el perfil');
        }
    };

    const handleSave = async (data) => {
        try {
            if (selectedPerfil) {
                await perfilesAPI.update(selectedPerfil.idPerfil, data);
            } else {
                await perfilesAPI.create(data);
            }
            setShowModal(false);
            fetchPerfiles();
        } catch (error) {
            console.error('Error saving perfil:', error);
            throw error;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg text-gray-600">Cargando perfiles...</div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-coffee-900">Gestión de Perfiles</h1>
                    <p className="text-gray-600 mt-1">Administra los roles del sistema</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-terracotta-500 text-white px-4 py-2 rounded-lg hover:bg-terracotta-600 transition-colors"
                >
                    <FiPlus size={20} />
                    Nuevo Perfil
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {perfiles.map((perfil) => (
                    <div
                        key={perfil.idPerfil}
                        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-terracotta-100 rounded-lg">
                                    <FiUsers className="text-terracotta-600" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-coffee-900">{perfil.nombrePerfil}</h3>
                                    <span
                                        className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${perfil.estado === 1
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                            }`}
                                    >
                                        {perfil.estado === 1 ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={() => handleEdit(perfil)}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-coffee-300 text-coffee-700 rounded-lg hover:bg-coffee-50 transition-colors"
                            >
                                <FiEdit2 size={16} />
                                Editar
                            </button>
                            <button
                                onClick={() => handleDelete(perfil.idPerfil)}
                                className="flex items-center justify-center px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            >
                                <FiTrash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {perfiles.length === 0 && (
                <div className="text-center py-12">
                    <FiUsers className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-600">No hay perfiles registrados</p>
                    <button
                        onClick={handleCreate}
                        className="mt-4 text-terracotta-600 hover:text-terracotta-700 font-medium"
                    >
                        Crear el primer perfil
                    </button>
                </div>
            )}

            {showModal && (
                <PerfilModal
                    perfil={selectedPerfil}
                    onClose={() => setShowModal(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}
