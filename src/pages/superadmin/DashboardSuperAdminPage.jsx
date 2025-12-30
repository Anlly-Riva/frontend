import React from 'react';
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
    Cell,
    LineChart,
    Line,
    Legend
} from 'recharts';
import { FaStore, FaUsers, FaUserShield, FaChartLine, FaUserTie, FaCalendarAlt } from 'react-icons/fa';
import { superadminApi } from '../../services/superadminApi';
import { StatCard, ChartContainer } from '../../components/superadmin/DashboardComponents';
import { useSuperAdminAuth } from '../../context/SuperAdminAuthContext';

const DashboardSuperAdminPage = () => {
    const { superAdminUser: userData } = useSuperAdminAuth();

    // Cargar restaurantes
    const { data: restaurantes = [], isLoading: loadingRestaurantes } = useQuery({
        queryKey: ['restaurantes'],
        queryFn: superadminApi.getRestaurantes
    });

    // Cargar clientes/usuarios
    const { data: usuarios = [], isLoading: loadingUsuarios } = useQuery({
        queryKey: ['usuarios'],
        queryFn: superadminApi.getUsuarios
    });

    // Cargar super admins
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
    const usuariosActivos = usuarios.filter(u => u.estado === 1).length;
    const superAdminsActivos = superAdmins.filter(sa => sa.estado === 1).length;

    // Calcular crecimiento por mes (últimos 6 meses)
    const calcularCrecimientoPorMes = () => {
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const ahora = new Date();
        const datos = [];

        for (let i = 5; i >= 0; i--) {
            const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
            const mesIndex = fecha.getMonth();
            const año = fecha.getFullYear();

            // Contar restaurantes creados hasta ese mes
            const restHastaMes = restaurantes.filter(r => {
                if (!r.fecha_creacion && !r.fechaCreacion) return true; // Sin fecha = existía
                const fechaRest = new Date(r.fecha_creacion || r.fechaCreacion);
                return fechaRest <= new Date(año, mesIndex + 1, 0);
            }).length;

            // Contar usuarios creados hasta ese mes
            const usersHastaMes = usuarios.filter(u => {
                if (!u.fechaCreacion && !u.fecha_creacion) return true;
                const fechaUser = new Date(u.fechaCreacion || u.fecha_creacion);
                return fechaUser <= new Date(año, mesIndex + 1, 0);
            }).length;

            datos.push({
                mes: `${meses[mesIndex]} ${año.toString().slice(-2)}`,
                restaurantes: restHastaMes,
                clientes: usersHastaMes
            });
        }

        return datos;
    };

    const datosCrecimiento = calcularCrecimientoPorMes();

    // Datos para el gráfico circular
    const datosDistribucion = [
        { name: 'Restaurantes', value: restaurantes.length, color: '#3B82F6' },
        { name: 'Clientes', value: usuarios.length, color: '#10B981' },
        { name: 'SuperAdmins', value: superAdmins.length, color: '#8B5CF6' }
    ];

    // Colores
    const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];

    if (loadingRestaurantes || loadingSuperAdmins || loadingRoles || loadingModulos || loadingUsuarios) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-800 to-red-600 rounded-xl p-6 text-white shadow-lg">
                <h1 className="text-2xl font-bold">Panel de Control - SuperAdmin</h1>
                <p className="text-red-100 mt-1">
                    Reporte general del sistema • {new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>

            {/* Stats Grid - 5 cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard
                    title="Restaurantes"
                    value={restaurantes.length}
                    trend={`${restaurantesActivos} activos`}
                    trendLabel="Suscritos al sistema"
                    icon={FaStore}
                    color="blue"
                />
                <StatCard
                    title="Clientes"
                    value={usuarios.length}
                    trend={`${usuariosActivos} activos`}
                    trendLabel="Usuarios registrados"
                    icon={FaUserTie}
                    color="green"
                />
                <StatCard
                    title="SuperAdmins"
                    value={superAdmins.length}
                    trend={`${superAdminsActivos} activos`}
                    trendLabel="Administradores"
                    icon={FaUserShield}
                    color="purple"
                />
                <StatCard
                    title="Roles"
                    value={roles.length}
                    trend={`${roles.filter(r => r.estado === 1).length} activos`}
                    trendLabel="Perfiles del sistema"
                    icon={FaUsers}
                    color="orange"
                />
                <StatCard
                    title="Módulos"
                    value={modulos.length}
                    trend={`${modulos.filter(m => m.estado === 1).length} activos`}
                    trendLabel="Funcionalidades"
                    icon={FaChartLine}
                    color="cyan"
                />
            </div>

            {/* Main Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bar Chart - Crecimiento del Servicio */}
                <div className="lg:col-span-2">
                    <ChartContainer title="📈 Crecimiento del Servicio (últimos 6 meses)">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={datosCrecimiento} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="mes"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
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
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        backgroundColor: '#fff'
                                    }}
                                />
                                <Legend />
                                <Bar
                                    dataKey="restaurantes"
                                    fill="#3B82F6"
                                    radius={[4, 4, 0, 0]}
                                    name="Restaurantes"
                                />
                                <Bar
                                    dataKey="clientes"
                                    fill="#10B981"
                                    radius={[4, 4, 0, 0]}
                                    name="Clientes"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>

                {/* Pie Chart - Distribución General */}
                <ChartContainer title="📊 Distribución del Sistema">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={datosDistribucion}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={80}
                                paddingAngle={3}
                                dataKey="value"
                                label={({ name, value }) => `${name}: ${value}`}
                                labelLine={false}
                            >
                                {datosDistribucion.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>

            {/* Lists Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Últimos Restaurantes */}
                <ChartContainer title="🏪 Últimos Restaurantes Registrados">
                    <div className="space-y-3 overflow-y-auto pr-2" style={{ maxHeight: '400px' }}>
                        {restaurantes.map((rest, index) => (
                            <div
                                key={rest.id_restaurante || rest.idRestaurante || index}
                                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-100 last:border-0"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                        <FaStore />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{rest.nombre}</p>
                                        <p className="text-xs text-gray-500">RUC: {rest.ruc}</p>
                                    </div>
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

                {/* Últimos Clientes */}
                <ChartContainer title="👥 Últimos Clientes Registrados">
                    <div className="space-y-3 overflow-y-auto pr-2" style={{ maxHeight: '400px' }}>
                        {usuarios.map((user, index) => (
                            <div
                                key={user.idUsuario || user.id_usuario || index}
                                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-100 last:border-0"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-sm">
                                        {user.nombreUsuario?.substring(0, 2).toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {user.nombreUsuario} {user.apellidos || user.apellidoUsuario}
                                        </p>
                                        <p className="text-xs text-gray-500">@{user.nombreUsuarioLogin}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-xs text-gray-500">
                                        Suc: {user.idSucursal || user.id_sucursal || '-'}
                                    </span>
                                    <span className={`text-xs font-medium px-2 py-1 rounded ${user.estado === 1
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'
                                        }`}>
                                        {user.estado === 1 ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {usuarios.length === 0 && (
                            <p className="text-center text-gray-400 py-8">No hay clientes registrados</p>
                        )}
                    </div>
                </ChartContainer>
            </div>

            {/* Footer Info */}
            <div className="bg-gray-50 rounded-xl p-4 text-center text-sm text-gray-500">
                <p>
                    <FaCalendarAlt className="inline mr-2" />
                    Última actualización: {new Date().toLocaleString('es-PE')}
                </p>
            </div>
        </div>
    );
};

export default DashboardSuperAdminPage;