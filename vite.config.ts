import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const footballProxy = {
    target: "https://v3.football.api-sports.io",
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api-football/, ""),
};

export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: { proxy: { "/api-football": footballProxy } },
    preview: { proxy: { "/api-football": footballProxy } },
});
