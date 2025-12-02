import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

export default function PerfilModal({ perfil, onClose, onSave }) {
    const [formData, setFormData] = useState({
        nombrePerfil: '',
        estado: 1,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (perfil) {
            setFormData({
                nombrePerfil: perfil.nombrePerfil || '',
                estado: perfil.estado ?? 1,
            });
        }
    }, [perfil]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.nombrePerfil.trim()) {
            setError('El nombre del perfil es requerido');
            return;
        }

        try {
            setLoading(true);
            await onSave(formData);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al guardar el perfil');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-bold text-coffee-900">
                        {perfil ? 'Editar Perfil' : 'Nuevo Perfil'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <FiX size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre del Perfil *
                        </label>
                        <input
                            type="text"
                            value={formData.nombrePerfil}
                            onChange={(e) => setFormData({ ...formData, nombrePerfil: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-terracotta-500 focus:border-transparent"
                            placeholder="Ej: Administrador, Cajero, Mesero"
                            disabled={loading}
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Estado
                        </label>
                        <select
                            value={formData.estado}
                            onChange={(e) => setFormData({ ...formData, estado: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-terracotta-500 focus:border-transparent"
                            disabled={loading}
                        >
                            <option value={1}>Activo</option>
                            <option value={0}>Inactivo</option>
                        </select>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-terracotta-500 text-white rounded-lg hover:bg-terracotta-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
