/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                coffee: {
                    800: '#4A3228', // Header/Text
                    900: '#3E2723',
                },
                terracotta: {
                    500: '#C66C28', // Buttons/Highlights
                    600: '#A65A22', // Hover
                },
                cream: {
                    100: '#FFF8E7', // Background
                    200: '#F5E6D3',
                }
            }
        },
    },
    plugins: [],
}
