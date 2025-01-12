import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: {
    "process.env": process.env,
  },
  server: {
    port: 3000,
    // Optionally, you can also set the host if you want to access from other devices
    // host: true
  }
});
