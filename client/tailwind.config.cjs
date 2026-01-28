/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                heading: ['Outfit', 'sans-serif'],
            },
            colors: {
                primary: {
                    50: '#eef2ff', // Indigo 50
                    100: '#e0e7ff', // Indigo 100
                    500: '#6366f1', // Indigo 500 (Brand)
                    600: '#4f46e5', // Indigo 600 (Action)
                    700: '#4338ca', // Indigo 700 (Hover)
                    900: '#312e81', // Indigo 900 (Deep)
                },
                accent: {
                    DEFAULT: '#3b82f6', // Blue 500 (Action)
                    hover: '#2563eb',
                },
                success: {
                    DEFAULT: '#10b981', // Emerald 500
                    bg: '#ecfdf5',
                },
                surface: {
                    DEFAULT: '#ffffff',
                    subtle: '#f8fafc', // Slate 50
                }
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'slide-up': 'slideUp 0.4s ease-out',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                }
            }
        },
    },
    plugins: [],
}

