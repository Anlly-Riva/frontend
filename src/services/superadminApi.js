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
        console.log(`📦 getRestauranteById(${id}) Response:`, response.data);
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

    // Usuarios del Sistema (Clientes, Empleados, etc) - Endpoints para SuperAdmin
    getUsuarios: async () => {
        // Probe multiple possible endpoints
        const endpoints = [
            '/restful/superadmin/usuarios',
            '/restful/usuarios',
            '/restful/usuarios/todos',
            '/api/usuarios'
        ];

        for (const url of endpoints) {
            try {
                console.log(`🔌 Probing usuarios: ${url}`);
                const response = await api.get(url);
                if (Array.isArray(response.data)) {
                    console.log(`✅ Usuarios found at: ${url}`);
                    return response.data;
                }
                // Handle Spring HATEOAS format
                if (response.data?._embedded?.usuarios) {
                    return response.data._embedded.usuarios;
                }
            } catch (e) {
                console.log(`❌ Probe failed: ${url}`);
            }
        }

        console.error('☠️ All usuario endpoints failed');
        return [];
    },
    createUsuario: async (data) => {
        const response = await api.post('/restful/superadmin/usuarios', data);
        return response.data;
    },
    updateUsuario: async (id, data) => {
        const response = await api.put(`/restful/superadmin/usuarios/${id}`, data);
        return response.data;
    },
    deleteUsuario: async (id) => {
        await api.delete(`/restful/superadmin/usuarios/${id}`);
    },

    // Sucursales - Usando endpoints de SuperAdmin para evitar 403
    getSucursales: async () => {
        // Fallback to public if superadmin specific doesn't exist, but likely 403
        const response = await axios.get(`${API_URL}/restful/sucursales/todos`, getSuperAdminHeaders());
        return response.data;
    },
    createSucursal: async (data) => {
        // Reverting to direct axios call as /superadmin/sucursales (POST) was 404.
        // We suspect this endpoint works but returns 403 for SuperAdmin, creating a Phantom Branch.
        const response = await axios.post(`${API_URL}/restful/sucursales`, data, getSuperAdminHeaders());
        return response.data;
    },
    getSucursalesByRestaurante: async (idRestaurante) => {
        // BRUTE FORCE PROBE STRATEGY
        // Try multiple likely endpoints until one returns an array

        const probes = [
            `/restful/superadmin/restaurantes/${idRestaurante}/sucursales`, // 1. SuperAdmin Nested
            `/restful/restaurantes/${idRestaurante}/sucursales`,             // 2. Public Nested
            `/restful/sucursales/restaurante/${idRestaurante}`,              // 3. Custom Filter Path
            `/restful/superadmin/sucursales`,                                // 4. SuperAdmin Global List (NEW TRY)
            `/restful/sucursales/search/findByIdRestaurante?id=${idRestaurante}` // 5. Spring Data Search
        ];

        for (const url of probes) {
            try {
                console.log(`🔌 Probing: ${url}`);
                const isSuperAdmin = url.includes('/superadmin/');

                let response;
                if (isSuperAdmin) {
                    // SuperAdmin endpoints NEED the specific token
                    response = await api.get(url);
                } else {
                    // Public/Regular endpoints might fail if we send the SuperAdmin token 
                    // (because the user doesn't exist in the 'usuarios' table logic).
                    // We try ANONYMOUSLY first.
                    try {
                        response = await axios.get(`${API_URL}${url}`); // No headers
                    } catch (anonErr) {
                        // If anonymous fails (401), we try with the token just in case
                        console.log(`   ...Anon failed, retrying with headers for: ${url}`);
                        response = await axios.get(`${API_URL}${url}`, getSuperAdminHeaders());
                    }
                }

                if (Array.isArray(response.data)) {
                    console.log(`✅ Probe Success: ${url}`);
                    return response.data;
                } else if (response.data?._embedded?.sucursales) {
                    // Handle Spring HATEOAS format
                    return response.data._embedded.sucursales;
                }
            } catch (e) {
                console.log(`❌ Probe Failed: ${url}`);
            }
        }

        // Fallback: public blocked endpoint (Last Resort)
        console.warn('⚠️ All specific probes failed. Trying generic list...');
        try {
            const response = await axios.get(`${API_URL}/restful/sucursales/todos`, getSuperAdminHeaders());
            const todas = response.data;
            return todas.filter(s => Number(s.id_restaurante) === Number(idRestaurante));
        } catch (finalError) {
            console.error('☠️ All sucursal fetches failed.', finalError);
            return [];
        }
    }
};