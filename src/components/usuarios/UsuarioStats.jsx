import { FiUsers, FiUserCheck, FiUserX, FiAward } from 'react-icons/fi';

const UsuarioStats = ({ usuarios }) => {
    const stats = {
        total: usuarios.length,
        activos: usuarios.filter(u => u.estado === 1).length,
        inactivos: usuarios.filter(u => u.estado === 0).length,
        porPerfil: {}
    };

    // Count users per profile
    usuarios.forEach(usuario => {
        const perfil = usuario.nombrePerfil || 'Sin perfil';
        stats.porPerfil[perfil] = (stats.porPerfil[perfil] || 0) + 1;
    });

    const statCards = [
        {
            title: 'Total Usuarios',
            value: stats.total,
            icon: FiUsers,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            title: 'Usuarios Activos',
            value: stats.activos,
            icon: FiUserCheck,
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            title: 'Usuarios Inactivos',
            value: stats.inactivos,
            icon: FiUserX,
            color: 'text-red-600',
            bgColor: 'bg-red-50'
        },
        {
            title: 'Perfiles Diferentes',
            value: Object.keys(stats.porPerfil).length,
            icon: FiAward,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                                <p className="text-3xl font-bold text-coffee-800">{stat.value}</p>
                            </div>
                            <div className={`${stat.bgColor} p-3 rounded-lg`}>
                                <Icon className={`${stat.color} w-6 h-6`} />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default UsuarioStats;
