import { defineConfig } from "vite";

export default defineConfig({
	server: {
		port: 1234,
		open: "./src/demo/index.html"
	},
	build: {
		minify: "esbuild",
		assetsInlineLimit: 500,
		modulePreload: true,
		sourcemap: false,
		rollupOptions: {
			input: {
				app: "./src/demo/index.html"
			}
		}
	},
	define: {
		BUILD_TIMESTAMP: new Date()
	}
});
