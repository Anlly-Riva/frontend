import React from 'react';
import { Link } from 'react-router-dom';
import { FaStore, FaUserPlus, FaArrowRight } from 'react-icons/fa';
import { Card } from '../../components/superadmin/DashboardComponents';

const SubscriptionsPage = () => {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Suscripciones</h1>
                <p className="text-gray-500 mt-1">Gestión de altas de restaurantes y clientes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Opción Crear Restaurante */}
                <Link to="/superadmin/crear-restaurante" className="group">
                    <Card className="p-8 h-full hover:shadow-lg transition-all border-l-4 border-blue-500 group-hover:scale-[1.02]">
                        <div className="flex items-start justify-between">
                            <div className="bg-blue-100 p-4 rounded-full">
                                <FaStore className="text-3xl text-blue-600" />
                            </div>
                            <FaArrowRight className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">Nuevo Restaurante</h2>
                        <p className="text-gray-500 mb-4">
                            Registra un nuevo establecimiento, configura su información fiscal, logo y moneda.
                        </p>
                        <span className="text-blue-600 font-medium text-sm group-hover:underline">Comenzar registro →</span>
                    </Card>
                </Link>

                {/* Opción Crear Cliente */}
                <Link to="/superadmin/crear-cliente" className="group">
                    <Card className="p-8 h-full hover:shadow-lg transition-all border-l-4 border-green-500 group-hover:scale-[1.02]">
                        <div className="flex items-start justify-between">
                            <div className="bg-green-100 p-4 rounded-full">
                                <FaUserPlus className="text-3xl text-green-600" />
                            </div>
                            <FaArrowRight className="text-gray-300 group-hover:text-green-500 transition-colors" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">Nuevo Cliente</h2>
                        <p className="text-gray-500 mb-4">
                            Crea un usuario dueño y asígnalo a un restaurante existente para darle acceso.
                        </p>
                        <span className="text-green-600 font-medium text-sm group-hover:underline">Crear usuario →</span>
                    </Card>
                </Link>
            </div>

            {/* Info Section */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">¿Cómo funciona el flujo de alta?</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                    <li>Primero debes crear el <strong>Restaurante</strong>. El sistema generará automáticamente su sucursal principal.</li>
                    <li>Luego, crea el <strong>Cliente (Usuario)</strong>.</li>
                    <li>Durante la creación del cliente, selecciona el restaurante al que pertenecerá.</li>
                    <li>El sistema vinculará al usuario con la sucursal principal de ese restaurante.</li>
                    <li>El cliente recibirá sus credenciales para acceder al panel de su restaurante.</li>
                </ol>
            </div>
        </div>
    );
};

export default SubscriptionsPage;
