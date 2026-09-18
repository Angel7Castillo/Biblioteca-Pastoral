import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      ignored: ['**/Sermones/**'] // Ignorar esta carpeta para que no refresque la página al guardar
    }
  }
})
