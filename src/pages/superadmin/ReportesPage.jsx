import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    FaHistory, FaUser, FaStore, FaSearch, FaFilter,
    FaCalendarAlt, FaUserShield, FaDatabase, FaKey,
    FaPlus, FaEdit, FaTrash, FaSignInAlt, FaSignOutAlt
} from 'react-icons/fa';
import { superadminApi } from '../../services/superadminApi';
import { Card } from '../../components/superadmin/DashboardComponents';

// Iconos por tipo de acción
const accionIconos = {
    'CREAR': { icon: FaPlus, color: 'text-green-600', bg: 'bg-green-100' },
    'ACTUALIZAR': { icon: FaEdit, color: 'text-blue-600', bg: 'bg-blue-100' },
    'ELIMINAR': { icon: FaTrash, color: 'text-red-600', bg: 'bg-red-100' },
    'LOGIN': { icon: FaSignInAlt, color: 'text-purple-600', bg: 'bg-purple-100' },
    'LOGOUT': { icon: FaSignOutAlt, color: 'text-gray-600', bg: 'bg-gray-100' },
    'DEFAULT': { icon: FaHistory, color: 'text-gray-600', bg: 'bg-gray-100' }
};

// Iconos por tabla
const tablaIconos = {
    'restaurante': FaStore,
    'usuario': FaUser,
    'super_admin': FaUserShield,
    'sucursal': FaStore,
    'perfil': FaKey,
    'modulo': FaDatabase
};

const ReportesPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroTabla, setFiltroTabla] = useState('');
    const [filtroAccion, setFiltroAccion] = useState('');

    // Fetch bitácora
    const { data: bitacora = [], isLoading, error } = useQuery({
        queryKey: ['bitacora'],
        queryFn: superadminApi.getBitacora
    });

    // Filtrar registros
    const registrosFiltrados = bitacora.filter(log => {
        const matchSearch =
            log.detalles?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.tablaAfectada?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.accionRealizada?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchTabla = !filtroTabla || log.tablaAfectada === filtroTabla;
        const matchAccion = !filtroAccion || log.accionRealizada === filtroAccion;

        return matchSearch && matchTabla && matchAccion;
    });

    // Obtener tablas únicas para el filtro
    const tablasUnicas = [...new Set(bitacora.map(l => l.tablaAfectada).filter(Boolean))];
    const accionesUnicas = [...new Set(bitacora.map(l => l.accionRealizada).filter(Boolean))];

    // Formatear fecha
    const formatFecha = (fecha) => {
        if (!fecha) return '-';
        try {
            const date = new Date(fecha);
            return date.toLocaleString('es-PE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return fecha;
        }
    };

    // Obtener icono de acción
    const getAccionConfig = (accion) => {
        return accionIconos[accion?.toUpperCase()] || accionIconos.DEFAULT;
    };

    // Estadísticas rápidas
    const statsHoy = bitacora.filter(l => {
        const fecha = new Date(l.fechaHora);
        const hoy = new Date();
        return fecha.toDateString() === hoy.toDateString();
    }).length;

    const statsCreaciones = bitacora.filter(l => l.accionRealizada === 'CREAR').length;
    const statsLogins = bitacora.filter(l => l.accionRealizada === 'LOGIN').length;

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="bg-red-50 p-6 rounded-lg inline-block">
                    <p className="text-red-600 font-medium mb-2">Error al cargar bitácora</p>
                    <p className="text-red-500 text-sm">{error.message}</p>
                    <p className="text-gray-500 text-xs mt-4">
                        Verifica que el backend tenga el endpoint:<br />
                        <code className="bg-gray-100 px-2 py-1 rounded">GET /restful/superadmin/bitacora</code>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-800 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
                <h1 className="text-2xl font-bold flex items-center gap-3">
                    <FaHistory className="text-indigo-200" />
                    Reportes y Auditoría
                </h1>
                <p className="text-indigo-100 mt-1">
                    Historial de todas las acciones realizadas en el sistema
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                        <FaDatabase className="text-xl" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{bitacora.length}</p>
                        <p className="text-sm text-gray-500">Total registros</p>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-green-100 text-green-600">
                        <FaCalendarAlt className="text-xl" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{statsHoy}</p>
                        <p className="text-sm text-gray-500">Acciones hoy</p>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
                        <FaPlus className="text-xl" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{statsCreaciones}</p>
                        <p className="text-sm text-gray-500">Creaciones</p>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-orange-100 text-orange-600">
                        <FaSignInAlt className="text-xl" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{statsLogins}</p>
                        <p className="text-sm text-gray-500">Inicios de sesión</p>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="flex flex-wrap gap-4 items-center">
                    {/* Search */}
                    <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                            <FaSearch className="text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar en detalles..."
                                className="bg-transparent border-none outline-none w-full text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Filtro por tabla */}
                    <div className="flex items-center gap-2">
                        <FaFilter className="text-gray-400" />
                        <select
                            value={filtroTabla}
                            onChange={(e) => setFiltroTabla(e.target.value)}
                            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Todas las tablas</option>
                            {tablasUnicas.map(tabla => (
                                <option key={tabla} value={tabla}>{tabla}</option>
                            ))}
                        </select>
                    </div>

                    {/* Filtro por acción */}
                    <div>
                        <select
                            value={filtroAccion}
                            onChange={(e) => setFiltroAccion(e.target.value)}
                            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Todas las acciones</option>
                            {accionesUnicas.map(accion => (
                                <option key={accion} value={accion}>{accion}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </Card>

            {/* Table */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr className="text-gray-600 text-sm">
                                <th className="p-4 font-medium">ID</th>
                                <th className="p-4 font-medium">Fecha/Hora</th>
                                <th className="p-4 font-medium">Usuario</th>
                                <th className="p-4 font-medium">Acción</th>
                                <th className="p-4 font-medium">Tabla</th>
                                <th className="p-4 font-medium">Registro</th>
                                <th className="p-4 font-medium">Detalles</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                                        <p className="mt-2 text-gray-500">Cargando bitácora...</p>
                                    </td>
                                </tr>
                            ) : registrosFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-gray-500">
                                        <FaHistory className="text-4xl mx-auto mb-2 text-gray-300" />
                                        <p>No hay registros en la bitácora</p>
                                        <p className="text-xs mt-1">Los registros aparecerán cuando se realicen acciones en el sistema</p>
                                    </td>
                                </tr>
                            ) : registrosFiltrados.map((log) => {
                                const accionConfig = getAccionConfig(log.accionRealizada);
                                const IconAccion = accionConfig.icon;
                                const IconTabla = tablaIconos[log.tablaAfectada?.toLowerCase()] || FaDatabase;

                                return (
                                    <tr key={log.idLog} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 text-gray-500 text-sm font-mono">
                                            #{log.idLog}
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">
                                            {formatFecha(log.fechaHora)}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                                    <FaUser className="text-sm" />
                                                </div>
                                                <span className="text-sm">ID: {log.idUsuario || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${accionConfig.bg} ${accionConfig.color}`}>
                                                <IconAccion className="text-xs" />
                                                {log.accionRealizada}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <IconTabla className="text-sm" />
                                                <span className="text-sm">{log.tablaAfectada || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-500">
                                            {log.idRegistroAfectado || '-'}
                                        </td>
                                        <td className="p-4 text-sm text-gray-600 max-w-xs truncate" title={log.detalles}>
                                            {log.detalles || '-'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 text-sm text-gray-500">
                    Mostrando {registrosFiltrados.length} de {bitacora.length} registros
                </div>
            </Card>
        </div>
    );
};

export default ReportesPage;
