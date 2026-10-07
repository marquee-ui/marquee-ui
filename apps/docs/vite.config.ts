import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/marquee-ui/",
  publicDir: "../../packages/tokens/dist",
  plugins: [react(), tailwind()],
  resolve: {
    alias: {
      "@/components/ui": fileURLToPath(new URL("../../packages/ui/src", import.meta.url)),
      "@": fileURLToPath(new URL("../../packages/ui/src", import.meta.url)),
    },
  },
});
