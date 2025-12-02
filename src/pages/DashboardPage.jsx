const DashboardPage = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-coffee-800 font-serif mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-terracotta-500">
                    <h3 className="text-lg font-semibold text-gray-700">Bienvenido</h3>
                    <p className="text-gray-500 mt-2">Selecciona una opción del menú lateral para comenzar.</p>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
