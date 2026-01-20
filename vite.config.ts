import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import dotenv from 'dotenv';

dotenv.config();
const API_URL = process.env.API_URL || 'http://localhost:3001';
const API_KEY_RESEND = process.env.API_KEY_RESEND;
console.log('API_KEY_RESEND', API_KEY_RESEND);
console.log('API_URL', API_URL);
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3001,
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: API_URL,
            changeOrigin: true,
            secure: false,
          }
        }
      },
      plugins: [react()],
      define: {
        'process.env.API_URL': JSON.stringify(API_URL),
        'process.env.API_KEY_RESEND': JSON.stringify(env.API_KEY_RESEND),
        'process.env.CONTACT_EMAIL': JSON.stringify(env.CONTACT_EMAIL)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
