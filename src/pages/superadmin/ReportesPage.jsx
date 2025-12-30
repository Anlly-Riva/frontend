import React, { useState, useEffect } from 'react';
import { reportesAPI } from '../../services/superadminApi';
import { FaClipboardList, FaSearch, FaUserShield, FaCalendarAlt, FaNetworkWired } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ReportesPage = () => {
    const [reportes, setReportes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchReportes();
    }, []);

    const fetchReportes = async () => {
        try {
            setLoading(true);
            const response = await reportesAPI.getAll();
            // Backend returns list directly or inside data logic, standard axios returns .data
            const data = response.data || [];
            setReportes(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching reportes:', error);
            toast.error('No se pudieron cargar los reportes auditables.');
        } finally {
            setLoading(false);
        }
    };

    // Filtering logic
    const filteredReportes = reportes.filter(repo =>
        repo.accion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (repo.detalle && repo.detalle.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (repo.superAdmin && repo.superAdmin.nombres.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Format date helper
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('es-PE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Badge color helper
    const getActionColor = (action) => {
        const act = action.toUpperCase();
        if (act.includes('LOGIN')) return 'bg-blue-100 text-blue-800';
        if (act.includes('CREAR') || act.includes('ADD')) return 'bg-green-100 text-green-800';
        if (act.includes('EDIT') || act.includes('UPDATE')) return 'bg-yellow-100 text-yellow-800';
        if (act.includes('DELETE') || act.includes('ELIMINAR')) return 'bg-red-100 text-red-800';
        return 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FaClipboardList className="text-blue-600" />
                        Reportes de Auditoría
                    </h1>
                    <p className="text-gray-600 text-sm">Historial de acciones realizadas por SuperAdmins</p>
                </div>
                <div className="text-right">
                    <p className="text-3xl font-bold text-blue-600">{filteredReportes.length}</p>
                    <p className="text-sm text-gray-500">Registros encontrados</p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-3">
                <FaSearch className="text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar por acción, detalle o administrador..."
                    className="flex-1 outline-none text-gray-700 placeholder-gray-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Cargando bitácora...</p>
                </div>
            ) : filteredReportes.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <FaClipboardList className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No hay registros de auditoría disponibles.</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Fecha / Hora</th>
                                    <th className="px-6 py-4">Acción</th>
                                    <th className="px-6 py-4">Detalle</th>
                                    <th className="px-6 py-4">Admin</th>
                                    {/* Search Bar <th className="px-6 py-4 text-center">IP</th>*/}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredReportes.map((reporte) => (
                                    <tr key={reporte.idReporte} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center gap-2">
                                            <FaCalendarAlt className="text-gray-400" />
                                            {formatDate(reporte.fecha)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${getActionColor(reporte.accion)}`}>
                                                {reporte.accion}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 max-w-md truncate" title={reporte.detalle}>
                                            {reporte.detalle || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                                                    {reporte.superAdmin?.nombres?.charAt(0) || 'S'}
                                                </div>
                                                <span>{reporte.superAdmin?.nombres || 'SuperAdmin'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 text-center">
                                            <div className="flex items-center justify-center gap-1" title={reporte.ipOrigen}>
                                                <FaNetworkWired />
                                                <span className="text-xs">{reporte.ipOrigen || 'Unknown'}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportesPage;
