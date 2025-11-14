import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/",
  server: {
    port: 5173,
  },
  preview: {
    allowedHosts: ["utnproyectoreact-5.onrender.com"],
  },
});
