import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // Proxy API calls to Node.js backend during development
      "/api": {
        target: "https://zose-backend.onrender.com",
        changeOrigin: true,
      },
      "/uploads": {
        target: "https://zose-backend.onrender.com",
        changeOrigin: true,
      },
    },
  },
});
