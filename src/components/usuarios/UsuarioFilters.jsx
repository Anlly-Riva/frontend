import { useQuery } from '@tanstack/react-query';
import { perfilesAPI } from '../../services/api';

const UsuarioFilters = ({ filters, setFilters }) => {
    const { data: perfiles } = useQuery({
        queryKey: ['perfiles'],
        queryFn: async () => {
            const response = await perfilesAPI.getAll();
            return response.data;
        }
    });

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-coffee-800 mb-2">
                        Filtrar por Perfil
                    </label>
                    <select
                        value={filters.perfil || ''}
                        onChange={(e) => setFilters({ ...filters, perfil: e.target.value ? parseInt(e.target.value) : null })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-terracotta-500 focus:border-transparent outline-none"
                    >
                        <option value="">Todos los perfiles</option>
                        {perfiles?.map(perfil => (
                            <option key={perfil.idPerfil} value={perfil.idPerfil}>
                                {perfil.nombrePerfil}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-coffee-800 mb-2">
                        Filtrar por Estado
                    </label>
                    <select
                        value={filters.estado === null ? '' : filters.estado}
                        onChange={(e) => setFilters({ ...filters, estado: e.target.value === '' ? null : parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-terracotta-500 focus:border-transparent outline-none"
                    >
                        <option value="">Todos los estados</option>
                        <option value="1">Activos</option>
                        <option value="0">Inactivos</option>
                    </select>
                </div>

                <div className="flex items-end">
                    <button
                        onClick={() => setFilters({ perfil: null, estado: null, sucursal: null })}
                        className="w-full px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition"
                    >
                        Limpiar Filtros
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UsuarioFilters;
