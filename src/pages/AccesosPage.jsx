import { useState, useEffect } from 'react';
import { accesosAPI, perfilesAPI, modulosAPI } from '../services/api';
import { FiCheck, FiX, FiCopy, FiSave } from 'react-icons/fi';

export default function AccesosPage() {
    const [perfiles, setPerfiles] = useState([]);
    const [modulos, setModulos] = useState([]);
    const [accesos, setAccesos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedPerfilToCopy, setSelectedPerfilToCopy] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [perfilesRes, modulosRes, accesosRes] = await Promise.all([
                perfilesAPI.getAll(),
                modulosAPI.getAll(),
                accesosAPI.getAll(),
            ]);

            setPerfiles(perfilesRes.data.filter(p => p.estado === 1));
            setModulos(modulosRes.data.filter(m => m.estado === 1).sort((a, b) => (a.orden || 0) - (b.orden || 0)));
            setAccesos(accesosRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const hasAccess = (perfilId, moduloId) => {
        return accesos.some(
            (a) => a.idPerfil === perfilId && a.idModulo === moduloId && a.estado === 1
        );
    };

    const toggleAccess = async (perfilId, moduloId) => {
        const existingAcceso = accesos.find(
            (a) => a.idPerfil === perfilId && a.idModulo === moduloId
        );

        try {
            if (existingAcceso) {
                // Toggle estado
                const newEstado = existingAcceso.estado === 1 ? 0 : 1;
                await accesosAPI.update(existingAcceso.idAcceso, {
                    ...existingAcceso,
                    estado: newEstado,
                });
            } else {
                // Create new acceso
                await accesosAPI.create({
                    idPerfil: perfilId,
                    idModulo: moduloId,
                    estado: 1,
                });
            }

            // Refresh data
            fetchData();
        } catch (error) {
            console.error('Error toggling access:', error);
            alert('Error al actualizar el permiso');
        }
    };

    const copyPermissions = async () => {
        if (!selectedPerfilToCopy) {
            alert('Selecciona un perfil de origen');
            return;
        }

        const sourcePerfil = parseInt(selectedPerfilToCopy);
        const targetPerfiles = perfiles.filter(p => p.idPerfil !== sourcePerfil);

        if (!confirm(`¿Copiar permisos de "${perfiles.find(p => p.idPerfil === sourcePerfil)?.nombrePerfil}" a todos los demás perfiles?`)) {
            return;
        }

        try {
            setSaving(true);

            // Get source permissions
            const sourcePermissions = accesos.filter(
                a => a.idPerfil === sourcePerfil && a.estado === 1
            );

            // For each target perfil, create the same permissions
            for (const targetPerfil of targetPerfiles) {
                for (const permission of sourcePermissions) {
                    const existing = accesos.find(
                        a => a.idPerfil === targetPerfil.idPerfil && a.idModulo === permission.idModulo
                    );

                    if (existing) {
                        await accesosAPI.update(existing.idAcceso, {
                            ...existing,
                            estado: 1,
                        });
                    } else {
                        await accesosAPI.create({
                            idPerfil: targetPerfil.idPerfil,
                            idModulo: permission.idModulo,
                            estado: 1,
                        });
                    }
                }
            }

            alert('Permisos copiados exitosamente');
            fetchData();
        } catch (error) {
            console.error('Error copying permissions:', error);
            alert('Error al copiar permisos');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg text-gray-600">Cargando matriz de permisos...</div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-coffee-900">Matriz de Permisos</h1>
                <p className="text-gray-600 mt-1">Gestiona los accesos de cada perfil a los módulos del sistema</p>
            </div>

            {/* Copy Permissions Tool */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700">Copiar permisos desde:</label>
                    <select
                        value={selectedPerfilToCopy}
                        onChange={(e) => setSelectedPerfilToCopy(e.target.value)}
                        className="flex-1 max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-terracotta-500 focus:border-transparent"
                    >
                        <option value="">Seleccionar perfil...</option>
                        {perfiles.map((perfil) => (
                            <option key={perfil.idPerfil} value={perfil.idPerfil}>
                                {perfil.nombrePerfil}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={copyPermissions}
                        disabled={!selectedPerfilToCopy || saving}
                        className="flex items-center gap-2 px-4 py-2 bg-terracotta-500 text-white rounded-lg hover:bg-terracotta-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FiCopy size={18} />
                        {saving ? 'Copiando...' : 'Copiar a todos'}
                    </button>
                </div>
            </div>

            {/* Permissions Matrix */}
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-coffee-900 text-white">
                            <th className="px-4 py-3 text-left font-semibold sticky left-0 bg-coffee-900 z-10">
                                Módulo
                            </th>
                            {perfiles.map((perfil) => (
                                <th key={perfil.idPerfil} className="px-4 py-3 text-center font-semibold min-w-[120px]">
                                    {perfil.nombrePerfil}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {modulos.map((modulo) => (
                            <tr key={modulo.idModulo} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium text-coffee-900 sticky left-0 bg-white">
                                    {modulo.nombreModulo}
                                </td>
                                {perfiles.map((perfil) => {
                                    const hasPermission = hasAccess(perfil.idPerfil, modulo.idModulo);
                                    return (
                                        <td key={perfil.idPerfil} className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => toggleAccess(perfil.idPerfil, modulo.idModulo)}
                                                className={`inline-flex items-center justify-center w-10 h-10 rounded-lg transition-all ${hasPermission
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {hasPermission ? <FiCheck size={20} /> : <FiX size={20} />}
                                            </button>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {modulos.length === 0 && (
                    <div className="text-center py-12 text-gray-600">
                        No hay módulos disponibles. Crea módulos primero.
                    </div>
                )}

                {perfiles.length === 0 && (
                    <div className="text-center py-12 text-gray-600">
                        No hay perfiles disponibles. Crea perfiles primero.
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <FiCheck className="text-green-700" size={16} />
                    </div>
                    <span>Acceso permitido</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FiX className="text-gray-400" size={16} />
                    </div>
                    <span>Acceso denegado</span>
                </div>
            </div>
        </div>
    );
}
