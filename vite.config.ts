import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/", // asegura que los paths funcionen en producción
  server: {
    port: 5173,
  },
});
