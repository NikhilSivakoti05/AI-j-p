// vite.config.js (dev only)
export default defineConfig({
  plugins: [react()],
  base: "/PromptAI",
  server: {
    proxy: {
      '/api': 'http://localhost:8080', // your Spring Boot backend
    },
  },
})
