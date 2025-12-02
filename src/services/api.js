import axiosInstance from '../config/axios';

const api = axiosInstance;

export const authAPI = {
    login: (credentials) => api.post('/restful/usuarios/login', credentials),
};

export const usuariosAPI = {
    getAll: () => api.get('/restful/usuarios'),
    getById: (id) => api.get(`/restful/usuarios/${id}`),
    create: (data) => api.post('/restful/usuarios', data),
    update: (id, data) => api.put(`/restful/usuarios/${id}`, data),
    delete: (id) => api.delete(`/restful/usuarios/${id}`),
};

export const perfilesAPI = {
    getAll: () => api.get('/restful/perfiles'),
    getById: (id) => api.get(`/restful/perfiles/${id}`),
    create: (data) => api.post('/restful/perfiles', data),
    update: (id, data) => api.put(`/restful/perfiles/${id}`, data),
    delete: (id) => api.delete(`/restful/perfiles/${id}`),
};

export const modulosAPI = {
    getAll: () => api.get('/restful/modulos'),
    getById: (id) => api.get(`/restful/modulos/${id}`),
    create: (data) => api.post('/restful/modulos', data),
    update: (id, data) => api.put(`/restful/modulos/${id}`, data),
    delete: (id) => api.delete(`/restful/modulos/${id}`),
};

export const accesosAPI = {
    getAll: () => api.get('/restful/accesos'),
    getById: (id) => api.get(`/restful/accesos/${id}`),
    create: (data) => api.post('/restful/accesos', data),
    update: (id, data) => api.put(`/restful/accesos/${id}`, data),
    delete: (id) => api.delete(`/restful/accesos/${id}`),
};
