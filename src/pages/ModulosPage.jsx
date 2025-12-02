import { useState, useEffect } from 'react';
import { modulosAPI } from '../services/api';
import { FiGrid, FiPlus, FiEdit2, FiTrash2, FiMove } from 'react-icons/fi';
import ModuloModal from '../components/modulos/ModuloModal';

export default function ModulosPage() {
    const [modulos, setModulos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedModulo, setSelectedModulo] = useState(null);
    const [draggedIndex, setDraggedIndex] = useState(null);

    useEffect(() => {
        fetchModulos();
    }, []);

    const fetchModulos = async () => {
        try {
            setLoading(true);
            const response = await modulosAPI.getAll();
            // Sort by orden field
            const sorted = response.data.sort((a, b) => (a.orden || 0) - (b.orden || 0));
            setModulos(sorted);
        } catch (error) {
            console.error('Error fetching modulos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedModulo(null);
        setShowModal(true);
    };

    const handleEdit = (modulo) => {
        setSelectedModulo(modulo);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este módulo?')) return;

        try {
            await modulosAPI.delete(id);
            fetchModulos();
        } catch (error) {
            console.error('Error deleting modulo:', error);
            alert('Error al eliminar el módulo');
        }
    };

    const handleSave = async (data) => {
        try {
            if (selectedModulo) {
                await modulosAPI.update(selectedModulo.idModulo, data);
            } else {
                // Set orden to the next available number
                const maxOrden = Math.max(...modulos.map(m => m.orden || 0), 0);
                await modulosAPI.create({ ...data, orden: maxOrden + 1 });
            }
            setShowModal(false);
            fetchModulos();
        } catch (error) {
            console.error('Error saving modulo:', error);
            throw error;
        }
    };

    const handleDragStart = (index) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newModulos = [...modulos];
        const draggedItem = newModulos[draggedIndex];
        newModulos.splice(draggedIndex, 1);
        newModulos.splice(index, 0, draggedItem);

        setModulos(newModulos);
        setDraggedIndex(index);
    };

    const handleDragEnd = async () => {
        if (draggedIndex === null) return;

        // Update orden for all modulos
        try {
            const updates = modulos.map((modulo, index) => ({
                ...modulo,
                orden: index + 1,
            }));

            // Send updates to backend
            await Promise.all(
                updates.map(modulo =>
                    modulosAPI.update(modulo.idModulo, modulo)
                )
            );

            setDraggedIndex(null);
        } catch (error) {
            console.error('Error updating orden:', error);
            fetchModulos(); // Reload on error
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg text-gray-600">Cargando módulos...</div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-coffee-900">Gestión de Módulos</h1>
                    <p className="text-gray-600 mt-1">Administra los módulos del sistema</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-terracotta-500 text-white px-4 py-2 rounded-lg hover:bg-terracotta-600 transition-colors"
                >
                    <FiPlus size={20} />
                    Nuevo Módulo
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {modulos.length === 0 ? (
                    <div className="text-center py-12">
                        <FiGrid className="mx-auto text-gray-400 mb-4" size={48} />
                        <p className="text-gray-600">No hay módulos registrados</p>
                        <button
                            onClick={handleCreate}
                            className="mt-4 text-terracotta-600 hover:text-terracotta-700 font-medium"
                        >
                            Crear el primer módulo
                        </button>
                    </div>
                ) : (
                    <div className="divide-y">
                        {modulos.map((modulo, index) => (
                            <div
                                key={modulo.idModulo}
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragEnd={handleDragEnd}
                                className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-move ${draggedIndex === index ? 'opacity-50' : ''
                                    }`}
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <FiMove className="text-gray-400" size={20} />
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-terracotta-100 rounded-lg">
                                            <FiGrid className="text-terracotta-600" size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-coffee-900">{modulo.nombreModulo}</h3>
                                            <p className="text-sm text-gray-500">Orden: {modulo.orden || index + 1}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span
                                        className={`px-3 py-1 text-xs rounded-full ${modulo.estado === 1
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                            }`}
                                    >
                                        {modulo.estado === 1 ? 'Activo' : 'Inactivo'}
                                    </span>
                                    <button
                                        onClick={() => handleEdit(modulo)}
                                        className="p-2 text-coffee-600 hover:bg-coffee-50 rounded-lg transition-colors"
                                    >
                                        <FiEdit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(modulo.idModulo)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <FiTrash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showModal && (
                <ModuloModal
                    modulo={selectedModulo}
                    onClose={() => setShowModal(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}
