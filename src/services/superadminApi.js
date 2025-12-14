import axiosInstance from '../config/axios';
import axios from 'axios'; // Import direct axios to bypass instance interceptors for mixed-context calls

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9090';

// Helper to get SuperAdmin headers manually
const getSuperAdminHeaders = () => {
    const token = localStorage.getItem('superadminToken');
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
};

const api = axiosInstance;

// ============================================
// AUTENTICACIÓN SUPERADMIN
// ============================================
export const superadminAuthAPI = {
    // Paso 1: Enviar credenciales para recibir token por correo
    initiateLogin: (email, password) => api.post('/restful/superadmin/auth/initiate-login', { email, password }),
    // Paso 2: Verificar token recibido
    loginWithToken: (token) => api.post('/restful/superadmin/auth/login', { token }),
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
// GESTIÓN DE SUPER ADMINS (nueva tabla)
// ============================================
export const superAdminsAPI = {
    getAll: async () => {
        try {
            console.log('📡 Fetching SuperAdmins...');
            const response = await api.get('/restful/superadmin/super-admins');
            console.log('✅ SuperAdmins response:', response);
            console.log('📦 SuperAdmins data:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error fetching superadmins:', error);
            throw error;
        }
    },
    getById: async (id) => {
        const response = await api.get(`/restful/superadmin/super-admins/${id}`);
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('/restful/superadmin/super-admins', data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.put(`/restful/superadmin/super-admins/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        await api.delete(`/restful/superadmin/super-admins/${id}`);
    },
};

// ============================================
// API UNIFICADA (superadminApi)
// ============================================
export const superadminApi = {
    //// Auth & Dashboard
    initiateLogin: superadminAuthAPI.initiateLogin,
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

    // Super Admins - NUEVO
    getSuperAdmins: async () => {
        return await superAdminsAPI.getAll();
    },
    getSuperAdminById: async (id) => {
        return await superAdminsAPI.getById(id);
    },
    createSuperAdmin: async (data) => {
        return await superAdminsAPI.create(data);
    },
    updateSuperAdmin: async (id, data) => {
        return await superAdminsAPI.update(id, data);
    },
    deleteSuperAdmin: async (id) => {
        await superAdminsAPI.delete(id);
    },

    // Usuarios del Sistema (Clientes, Empleados, etc) - Nuevos endpoints para SuperAdmin
    createUsuario: async (data) => {
        // Asumimos que existe un endpoint en el controlador de SuperAdmin para crear usuarios
        // y asignarles sucursal/rol directamente.
        const response = await api.post('/restful/superadmin/usuarios', data);
        return response.data;
    },

    // Sucursales - IMPLEMENTACIÓN DIRECTA CON AXIOS
    // Usamos axios directo porque los endpoints /restful/sucursales no tienen el prefijo /superadmin/
    // y el interceptor de axiosInstance usaría el token equivocado (authToken en lugar de superadminToken).
    getSucursales: async () => {
        const response = await axios.get(`${API_URL}/restful/sucursales/todos`, getSuperAdminHeaders());
        return response.data;
    },
    createSucursal: async (data) => {
        const response = await axios.post(`${API_URL}/restful/sucursales`, data, getSuperAdminHeaders());
        return response.data;
    },
    getSucursalesByRestaurante: async (idRestaurante) => {
        // Backend no tiene endpoint de filtro, así que traemos todo y filtramos en frontend
        const response = await axios.get(`${API_URL}/restful/sucursales/todos`, getSuperAdminHeaders());
        const todas = response.data;
        // Convertimos a número para asegurar comparación correcta
        return todas.filter(s => Number(s.id_restaurante) === Number(idRestaurante));
    }
};