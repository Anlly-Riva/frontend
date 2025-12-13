import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaKey, FaShieldAlt, FaUser, FaLock } from 'react-icons/fa';
import { useSuperAdminAuth } from '../../context/SuperAdminAuthContext';

const LoginSuperAdminPage = () => {
    console.log('LoginSuperAdminPage: Rendering...');
    const [step, setStep] = useState(1); // 1 = credenciales, 2 = token
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [token, setToken] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [userData, setUserData] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();
    const { loginStep1, loginStep2, isAuthenticated } = useSuperAdminAuth();

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            // const from = location.state?.from?.pathname || '/superadmin';
            console.log('✅ Authenticated! Forcing redirect to /superadmin');
            navigate('/superadmin', { replace: true });
        }
    }, [isAuthenticated, navigate, location]);

    // Paso 1: Login con email y contraseña
    const handleCredentialsSubmit = async (e) => {
        e.preventDefault();

        if (!credentials.email.trim() || !credentials.password.trim()) {
            toast.error('Por favor completa todos los campos');
            return;
        }

        setIsLoading(true);
        try {
            // Llamada al endpoint de inicio de sesión (envía correo) a través del Context
            await loginStep1(credentials.email, credentials.password);

            // Guardamos el email para mostrarlo en el paso 2
            setUserData({ email: credentials.email });
            setToken('');
            setStep(2);
            toast.success('Credenciales válidas. Revisa tu correo para obtener el token.');

        } catch (error) {
            console.error('Login Step 1 Error:', error);

            if (error.response?.status === 401) {
                toast.error('Credenciales incorrectas');
            } else if (error.response?.status === 403) {
                toast.error('Acceso denegado: Cuenta inactiva o sin permisos');
            } else {
                toast.error('Error al iniciar sesión: ' + (error.response?.data?.message || error.message));
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Paso 2: Validación del token
    const handleTokenSubmit = async (e) => {
        e.preventDefault();

        if (!token.trim()) {
            toast.error('Por favor ingresa el token');
            return;
        }

        setIsLoading(true);
        try {
            // Llamada al endpoint de verificación de token a través del Context
            await loginStep2(token);

            toast.success('¡Bienvenido SuperAdmin!');

            // La redirección ocurrirá automáticamente gracias al useEffect que vigila isAuthenticated

        } catch (error) {
            console.error('Login Step 2 Error:', error);

            if (error.response?.status === 401) {
                toast.error('Token inválido o expirado');
            } else {
                toast.error('Error al validar el token. Inténtalo de nuevo.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        setStep(1);
        setToken('');
        setUserData(null);
    };

    // Si ya está autenticado, no renderizar el formulario (evita parpadeo antes de redirigir)
    if (isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-orange-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-900 to-red-800 p-8 text-center">
                    <div className="flex justify-center mb-4">
                        <FaShieldAlt className="text-6xl text-yellow-300" />
                    </div>
                    <h1 className="text-3xl font-bold text-white font-serif">
                        SuperAdmin Panel
                    </h1>
                    <p className="text-red-100 mt-2">Acceso Restringido</p>

                    {/* Indicador de pasos */}
                    <div className="flex justify-center items-center mt-4 space-x-2">
                        <div className={`w-3 h-3 rounded-full ${step === 1 ? 'bg-yellow-300' : 'bg-red-600'}`}></div>
                        <div className="w-8 h-0.5 bg-red-600"></div>
                        <div className={`w-3 h-3 rounded-full ${step === 2 ? 'bg-yellow-300' : 'bg-red-600'}`}></div>
                    </div>
                    <p className="text-xs text-red-200 mt-2">
                        Paso {step} de 2
                    </p>
                </div>

                {/* Form */}
                <div className="p-8">
                    {step === 1 ? (
                        /* PASO 1: Credenciales */
                        <div key="step-1" className="animate-fade-in-up">
                            <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
                                <p className="text-sm text-blue-800">
                                    <strong>Paso 1:</strong> Ingresa tus credenciales de SuperAdmin
                                </p>
                            </div>

                            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <FaUser className="inline mr-2" />
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={credentials.email}
                                        onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                                        placeholder="admin@example.com"
                                        required
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <FaLock className="inline mr-2" />
                                        Contraseña
                                    </label>
                                    <input
                                        type="password"
                                        value={credentials.password}
                                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                                        placeholder="Ingresa tu contraseña"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-4 rounded-lg transition duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Verificando...
                                        </span>
                                    ) : (
                                        '🔐 Iniciar Sesión'
                                    )}
                                </button>
                            </form>
                        </div>
                    ) : (
                        /* PASO 2: Token */
                        <div key="step-2" className="animate-fade-in-up">
                            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded">
                                <p className="text-sm text-green-800">
                                    <strong>Paso 2:</strong> Verifica tu token de acceso
                                </p>
                                <p className="text-xs text-green-700 mt-1">
                                    Hemos enviado un código a: <strong>{userData?.email}</strong>
                                </p>
                            </div>

                            <form onSubmit={handleTokenSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <FaKey className="inline mr-2" />
                                        Token de Verificación
                                    </label>
                                    <textarea
                                        value={token}
                                        onChange={(e) => setToken(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition resize-none"
                                        placeholder="Pega aquí el token que recibiste por correo..."
                                        rows="3"
                                        required
                                        autoFocus
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Revisa tu bandeja de entrada o spam.
                                    </p>
                                </div>

                                <div className="flex space-x-2">
                                    <button
                                        type="button"
                                        onClick={handleBack}
                                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition duration-200 border border-gray-300"
                                    >
                                        ← Volver
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-4 rounded-lg transition duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center justify-center">
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Validando...
                                            </span>
                                        ) : (
                                            '✓ Acceder'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                <div className="bg-red-50 p-4 text-center text-sm text-red-700 border-t border-red-100">
                    <p className="font-medium">⚠️ Solo para SuperAdministradores</p>
                    <p className="text-xs mt-1">Este panel controla todo el sistema</p>
                </div>
            </div>
        </div>
    );
};

export default LoginSuperAdminPage;
