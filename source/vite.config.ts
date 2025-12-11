import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load các biến môi trường từ file .env
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Định nghĩa process.env để code cũ vẫn hoạt động mà không cần sửa đổi
      'process.env': env
    }
  };
});