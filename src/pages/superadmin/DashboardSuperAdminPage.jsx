import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    FaStore,
    FaUsers,
    FaUserShield,
    FaChartLine,
    FaExclamationTriangle
} from 'react-icons/fa';
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
    Cell,
    Legend
} from 'recharts';
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

    // Cargar usuarios
    const { data: usuarios = [], isLoading: loadingUsuarios } = useQuery({
        queryKey: ['users'],
        queryFn: superadminApi.getUsuarios
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
    const usuariosActivos = usuarios.filter(u => u.estado === 1).length;
    const rolesActivos = roles.filter(r => r.estado === 1).length;
    const modulosActivos = modulos.filter(m => m.estado === 1).length;

    // Datos para gráfico de usuarios por rol
    const usuariosPorRol = roles.map(rol => ({
        name: rol.nombrePerfil,
        value: usuarios.filter(u => u.id_perfil === rol.idPerfil).length
    })).filter(item => item.value > 0);

    // Colores para el gráfico
    const COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#8B5CF6', '#EF4444', '#06B6D4'];

    // Datos para gráfico de restaurantes por estado
    const restaurantesPorEstado = [
        { name: 'Activos', value: restaurantesActivos },
        { name: 'Inactivos', value: restaurantes.length - restaurantesActivos }
    ];

    if (loadingRestaurantes || loadingUsuarios || loadingRoles || loadingModulos) {
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
                    Vista general del sistema: restaurantes, usuarios y configuración.
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
                    title="Usuarios"
                    value={usuariosActivos}
                    trend={`${usuarios.length} totales`}
                    trendLabel="Usuarios registrados"
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
                {/* Bar Chart - Usuarios por Rol */}
                <ChartContainer title="Distribución de Usuarios por Rol">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={usuariosPorRol} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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

                {/* Últimos Usuarios */}
                <ChartContainer title="Últimos Usuarios Creados">
                    <div className="space-y-3 overflow-y-auto h-full pr-2">
                        {usuarios.slice(0, 5).map((user) => {
                            const rol = roles.find(r => r.idPerfil === user.id_perfil);
                            return (
                                <div
                                    key={user.id_usuario}
                                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-100 last:border-0"
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                                            {user.nombre_usuario_login?.substring(0, 2).toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {user.nombre_usuario} {user.apellido_usuario}
                                            </p>
                                            <p className="text-xs text-gray-500">{rol?.nombrePerfil || 'Sin rol'}</p>
                                        </div>
                                    </div>
                                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${user.estado === 1
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'
                                        }`}>
                                        {user.estado === 1 ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                            );
                        })}
                        {usuarios.length === 0 && (
                            <p className="text-center text-gray-400 py-8">No hay usuarios registrados</p>
                        )}
                    </div>
                </ChartContainer>
            </div>
        </div>
    );
};

export default DashboardSuperAdminPage;