import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: ["adaptive-video-frontend.onrender.com", "localhost", "127.0.0.1"],
  },
  server: {
    port: 5173,
    strictPort: false,
  },
});
