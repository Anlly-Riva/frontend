import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usuariosAPI, perfilesAPI } from '../services/api';
import { FiPlus, FiDownload, FiUpload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import UsuarioStats from '../components/usuarios/UsuarioStats';
import UsuarioFilters from '../components/usuarios/UsuarioFilters';
import UsuariosTable from '../components/usuarios/UsuariosTable';
import UsuarioModal from '../components/usuarios/UsuarioModal';

const UsuariosPage = () => {
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    const [selectedUsuario, setSelectedUsuario] = useState(null);
    const [filters, setFilters] = useState({
        perfil: null,
        estado: null,
        sucursal: null
    });

    // Fetch users and profiles
    const { data: usuariosData, isLoading } = useQuery({
        queryKey: ['usuarios'],
        queryFn: async () => {
            const [usuariosRes, perfilesRes] = await Promise.all([
                usuariosAPI.getAll(),
                perfilesAPI.getAll()
            ]);

            const perfilesMap = new Map(perfilesRes.data.map(p => [p.idPerfil, p.nombrePerfil]));

            return usuariosRes.data.map(usuario => ({
                ...usuario,
                nombrePerfil: perfilesMap.get(usuario.rolId) || 'Sin Perfil'
            }));
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => usuariosAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['usuarios']);
            toast.success('Usuario eliminado exitosamente');
        },
        onError: () => {
            toast.error('Error al eliminar usuario');
        }
    });

    const handleCreate = () => {
        setSelectedUsuario(null);
        setShowModal(true);
    };

    const handleEdit = (usuario) => {
        setSelectedUsuario(usuario);
        setShowModal(true);
    };

    const handleDelete = (usuario) => {
        if (window.confirm(`¿Está seguro de eliminar al usuario ${usuario.nombreUsuario}?`)) {
            deleteMutation.mutate(usuario.idUsuario);
        }
    };

    // Filter logic
    const filteredUsuarios = usuariosData?.filter(usuario => {
        if (filters.perfil && usuario.rolId !== filters.perfil) return false;
        if (filters.estado !== null && usuario.estado !== filters.estado) return false;
        return true;
    }) || [];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terracotta-500"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-coffee-800 font-serif">Gestión de Usuarios</h1>
                    <p className="text-gray-600 mt-1">Administra el acceso y roles del personal</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition">
                        <FiUpload size={18} />
                        <span className="hidden sm:inline">Importar</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition">
                        <FiDownload size={18} />
                        <span className="hidden sm:inline">Exportar</span>
                    </button>
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 px-4 py-2 bg-terracotta-500 text-white rounded-lg hover:bg-terracotta-600 transition shadow-md"
                    >
                        <FiPlus size={20} />
                        <span>Nuevo Usuario</span>
                    </button>
                </div>
            </div>

            <UsuarioStats usuarios={usuariosData || []} />

            <UsuarioFilters filters={filters} setFilters={setFilters} />

            <UsuariosTable
                usuarios={filteredUsuarios}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            {showModal && (
                <UsuarioModal
                    usuario={selectedUsuario}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
};

export default UsuariosPage;
