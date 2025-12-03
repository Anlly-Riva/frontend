import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { FaStore, FaUsers, FaUserShield, FaChartLine } from 'react-icons/fa';
import { superadminApi } from '../../services/superadminApi';
import { StatCard, ChartContainer } from '../../components/superadmin/DashboardComponents';

const DashboardSuperAdminPage = () => {
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setUserData(user);
    }, []);

    // Cargar restaurantes
    const { data: restaurantes = [], isLoading: loadingRestaurantes } = useQuery({
        queryKey: ['restaurantes'],
        queryFn: superadminApi.getRestaurantes
    });

    // Cargar super admins (antes usuarios)
    const { data: superAdmins = [], isLoading: loadingSuperAdmins } = useQuery({
        queryKey: ['superAdmins'],
        queryFn: superadminApi.getSuperAdmins
    });

    // Cargar roles
    const { data: roles = [], isLoading: loadingRoles } = useQuery({
        queryKey: ['roles'],
        queryFn: superadminApi.getRoles
    });

    // Cargar permisos (módulos)
    const { data: modulos = [], isLoading: loadingModulos } = useQuery({
        queryKey: ['permisos'],
        queryFn: superadminApi.getPermisos
    });

    // Calcular estadísticas
    const restaurantesActivos = restaurantes.filter(r => r.estado === 1).length;
    const superAdminsActivos = superAdmins.filter(sa => sa.estado === 1).length;
    const rolesActivos = roles.filter(r => r.estado === 1).length;
    const modulosActivos = modulos.filter(m => m.estado === 1).length;

    // Datos para gráfico de super admins por rol
    const superAdminsPorRol = [
        { name: 'MASTER', value: superAdmins.filter(sa => sa.rol === 'MASTER').length },
        { name: 'SOPORTE', value: superAdmins.filter(sa => sa.rol === 'SOPORTE').length },
        { name: 'VENTAS', value: superAdmins.filter(sa => sa.rol === 'VENTAS').length }
    ].filter(item => item.value > 0);

    // Colores para el gráfico
    const COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#8B5CF6', '#EF4444', '#06B6D4'];

    // Datos para gráfico de restaurantes por estado
    const restaurantesPorEstado = [
        { name: 'Activos', value: restaurantesActivos },
        { name: 'Inactivos', value: restaurantes.length - restaurantesActivos }
    ];

    if (loadingRestaurantes || loadingSuperAdmins || loadingRoles || loadingModulos) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Panel de Control - Superadmin</h1>
                <p className="text-gray-500 mt-1">
                    Vista general del sistema: restaurantes, super admins y configuración.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Restaurantes"
                    value={restaurantesActivos}
                    trend={`${restaurantes.length} totales`}
                    trendLabel="Activos en el sistema"
                    icon={FaStore}
                    color="blue"
                />
                <StatCard
                    title="Super Admins"
                    value={superAdminsActivos}
                    trend={`${superAdmins.length} totales`}
                    trendLabel="Administradores del sistema"
                    icon={FaUsers}
                    color="green"
                />
                <StatCard
                    title="Roles"
                    value={rolesActivos}
                    trend={`${roles.length} totales`}
                    trendLabel="Perfiles configurados"
                    icon={FaUserShield}
                    color="purple"
                />
                <StatCard
                    title="Módulos"
                    value={modulosActivos}
                    trend={`${modulos.length} totales`}
                    trendLabel="Módulos del sistema"
                    icon={FaChartLine}
                    color="orange"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar Chart - Super Admins por Rol */}
                <ChartContainer title="Distribución de Super Admins por Rol">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={superAdminsPorRol} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '8px',
                                    border: 'none',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}
                            />
                            <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>

                {/* Pie Chart - Restaurantes por Estado */}
                <ChartContainer title="Estado de Restaurantes">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={restaurantesPorEstado}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={5}
                                dataKey="value"
                                label={(entry) => `${entry.name}: ${entry.value}`}
                            >
                                <Cell fill="#10B981" />
                                <Cell fill="#EF4444" />
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>

            {/* Tables Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Últimos Restaurantes */}
                <ChartContainer title="Últimos Restaurantes Creados">
                    <div className="space-y-3 overflow-y-auto h-full pr-2">
                        {restaurantes.slice(0, 5).map((rest) => (
                            <div
                                key={rest.id_restaurante}
                                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-100 last:border-0"
                            >
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{rest.razon_social}</p>
                                    <p className="text-xs text-gray-500">RUC: {rest.ruc}</p>
                                </div>
                                <span className={`text-xs font-medium px-3 py-1 rounded-full ${rest.estado === 1
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                    }`}>
                                    {rest.estado === 1 ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>
                        ))}
                        {restaurantes.length === 0 && (
                            <p className="text-center text-gray-400 py-8">No hay restaurantes registrados</p>
                        )}
                    </div>
                </ChartContainer>

                {/* Últimos Super Admins */}
                <ChartContainer title="Últimos Super Admins Creados">
                    <div className="space-y-3 overflow-y-auto h-full pr-2">
                        {superAdmins.slice(0, 5).map((sa) => {
                            return (
                                <div
                                    key={sa.id_superadmin}
                                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-100 last:border-0"
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm">
                                            {sa.email?.substring(0, 2).toUpperCase() || 'SA'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {sa.nombres}
                                            </p>
                                            <p className="text-xs text-gray-500">{sa.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className={`text-xs font-medium px-2 py-1 rounded ${sa.rol === 'MASTER' ? 'bg-purple-100 text-purple-700' :
                                                sa.rol === 'SOPORTE' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-green-100 text-green-700'
                                            }`}>
                                            {sa.rol}
                                        </span>
                                        <span className={`text-xs font-medium px-2 py-1 rounded ${sa.estado === 1
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                            }`}>
                                            {sa.estado === 1 ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                        {superAdmins.length === 0 && (
                            <p className="text-center text-gray-400 py-8">No hay super admins registrados</p>
                        )}
                    </div>
                </ChartContainer>
            </div>
        </div>
    );
};

export default DashboardSuperAdminPage;