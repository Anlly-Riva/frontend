import axiosInstance from '../config/axios';

const api = axiosInstance;

// ============================================
// AUTENTICACIÓN SUPERADMIN
// ============================================
export const superadminAuthAPI = {
    loginWithToken: (token) => api.post('/restful/superadmin/login', { token }),
    getEstadisticas: () => api.get('/restful/superadmin/estadisticas'),
};

// ============================================
// GESTIÓN DE ROLES (tabla perfil)
// ============================================
export const rolesAPI = {
    getAll: () => api.get('/restful/superadmin/roles'),
    getById: (id) => api.get(`/restful/superadmin/roles/${id}`),
    create: (data) => api.post('/restful/superadmin/roles', data),
    update: (id, data) => api.put(`/restful/superadmin/roles/${id}`, data),
    delete: (id) => api.delete(`/restful/superadmin/roles/${id}`),
    getPermisos: (id) => api.get(`/restful/superadmin/roles/${id}/permisos`),
    assignPermisos: (id, idsModulos) => api.post(`/restful/superadmin/roles/${id}/permisos`, idsModulos),
};

// ============================================
// GESTIÓN DE PERMISOS (tabla modulo)
// ============================================
export const permisosAPI = {
    getAll: () => api.get('/restful/superadmin/permisos'),
    getById: (id) => api.get(`/restful/superadmin/permisos/${id}`),
    create: (data) => api.post('/restful/superadmin/permisos', data),
    update: (id, data) => api.put(`/restful/superadmin/permisos/${id}`, data),
    delete: (id) => api.delete(`/restful/superadmin/permisos/${id}`),
};

// ============================================
// GESTIÓN DE RESTAURANTES
// ============================================
export const restaurantesAPI = {
    getAll: () => api.get('/restful/superadmin/restaurantes'),
    getById: (id) => api.get(`/restful/superadmin/restaurantes/${id}`),
    create: (data) => api.post('/restful/superadmin/restaurantes', data),
    update: (id, data) => api.put(`/restful/superadmin/restaurantes/${id}`, data),
    delete: (id) => api.delete(`/restful/superadmin/restaurantes/${id}`),
};

// ============================================
// GESTIÓN DE USUARIOS
// ============================================
export const usuariosAPI = {
    getUsuarios: async () => {
        // Intentar obtener todos los usuarios (activos e inactivos)
        try {
            const response = await api.get('/restful/superadmin/usuarios?incluirInactivos=true');
            return response.data;
        } catch (error) {
            // Si el parámetro no funciona, intentar sin él
            const response = await api.get('/restful/superadmin/usuarios');
            return response.data;
        }
    },
    createUsuario: async (usuario) => {
        const response = await api.post('/restful/superadmin/usuarios', usuario);
        return response.data;
    },
    updateUsuario: async (usuario) => {
        const response = await api.put(`/restful/superadmin/usuarios/${usuario.idUsuario}`, usuario);
        return response.data;
    },
    deleteUsuario: async (id) => {
        await api.delete(`/restful/superadmin/usuarios/${id}`);
    },
};

// ============================================
// API UNIFICADA (superadminApi)
// ============================================
export const superadminApi = {
    // Auth & Dashboard
    loginWithToken: superadminAuthAPI.loginWithToken,
    getEstadisticas: async () => {
        const response = await superadminAuthAPI.getEstadisticas();
        return response.data;
    },

    // Roles - CORREGIDO: Ahora devuelve solo los datos
    getRoles: async () => {
        const response = await rolesAPI.getAll();
        return response.data;
    },
    createRole: rolesAPI.create,
    updateRole: rolesAPI.update,
    deleteRole: rolesAPI.delete,
    getRolePermisos: rolesAPI.getPermisos,
    assignRolePermisos: rolesAPI.assignPermisos,

    // Permisos - CORREGIDO: Ahora devuelve solo los datos
    getPermisos: async () => {
        const response = await permisosAPI.getAll();
        return response.data;
    },
    createPermiso: permisosAPI.create,
    updatePermiso: permisosAPI.update,
    deletePermiso: permisosAPI.delete,

    // Restaurantes - CORREGIDO: Ahora devuelve solo los datos
    getRestaurantes: async () => {
        const response = await restaurantesAPI.getAll();
        return response.data;
    },
    getRestauranteById: async (id) => {
        const response = await restaurantesAPI.getById(id);
        return response.data;
    },
    createRestaurante: async (data) => {
        const response = await restaurantesAPI.create(data);
        return response.data;
    },
    updateRestaurante: async (id, data) => {
        const response = await restaurantesAPI.update(id, data);
        return response.data;
    },
    deleteRestaurante: async (id) => {
        await restaurantesAPI.delete(id);
    },

    // Usuarios - Ya estaban correctos
    getUsuarios: usuariosAPI.getUsuarios,
    createUsuario: usuariosAPI.createUsuario,
    updateUsuario: usuariosAPI.updateUsuario,
    deleteUsuario: usuariosAPI.deleteUsuario,
};