/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ide: {
          bg: '#0F111A', // Fondo oscuro principal
          sidebar: '#1A1D27', // Barra lateral secundaria
          activity: '#151720', // Barra de iconos izquierda
          border: '#2A2E3E', // Bordes sutiles
          text: '#A6ACCD', // Texto normal
          textLight: '#FFFFFF', // Títulos
          accent: '#82AAFF', // Acento azul
          hover: '#202433' // Elementos con hover
        }
      }
    },
  },
  plugins: [],
}
