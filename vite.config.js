import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxyTarget = env.VITE_DEV_PROXY_TARGET?.replace(/\/$/, "");

  return {
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom", "react-router-dom"],
          },
        },
      },
    },
    server: proxyTarget
      ? {
          proxy: {
            "/api": {
              target: proxyTarget,
              changeOrigin: true,
              secure: true,
            },
          },
        }
      : {},
  };
});
