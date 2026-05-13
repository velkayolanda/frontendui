/* eslint-disable no-undef */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"; // Enables React-specific optimizations and HMR
import path from "path"; // Provides utilities for working with file and directory paths

// Export the Vite configuration
export default defineConfig({
    plugins: [react()],

    // Module resolution settings
    resolve: {
        preserveSymlinks: true, // Prevents breaking symbolic links, useful for monorepos
        alias: {
            // Define aliases for modules, resolving them to specific paths
            // All @hrbolek packages - bundled into the build
            "@hrbolek/uoisfrontend-template": path.resolve(__dirname, "../../packages/_template/src"),
            "@hrbolek/uoisfrontend-dynamic": path.resolve(__dirname, "../../packages/dynamic/src"),
            "@hrbolek/uoisfrontend-shared": path.resolve(__dirname, "../../packages/shared/src"),
            "@hrbolek/uoisfrontend-gql-shared": path.resolve(__dirname, "../../packages/gql_shared/src"),
            "@hrbolek/uoisfrontend-ug": path.resolve(__dirname, "../../packages/ug/src"),
            "@hrbolek/uoisfrontend-ugx": path.resolve(__dirname, "../../packages/ug/src"),
            "@hrbolek/uoisfrontend-granting": path.resolve(__dirname, "../../packages/granting/src"),
            "@hrbolek/uoisfrontend-admissions": path.resolve(__dirname, "../../packages/admissions/src"),
            "@hrbolek/uoisfrontend-requests": path.resolve(__dirname, "../../packages/requests/src"),
            "@hrbolek/uoisfrontend-zp": path.resolve(__dirname, "../../packages/z_pack/src"),
            // Local subjects package
            "@velkayolanda/package-subjects": path.resolve(__dirname, "../../packages/subjects/src"),
        },
    },

    // Dependency optimization settings
    optimizeDeps: {
        include: [
            // List dependencies to pre-bundle for faster development
            'invariant',
            'classnames',
            'react-bootstrap',
            'prop-types',
            'graphql'
        ],
        exclude: [
            // Exclude specific libraries or modules from optimization
            "@hrbolek/uoisfrontend-template",

            "@hrbolek/uoisfrontend-dynamic",
            "@hrbolek/uoisfrontend-shared",
            "@hrbolek/uoisfrontend-gql-shared",
            "@hrbolek/uoisfrontend-ug",
            "@hrbolek/uoisfrontend-granting",
            "@hrbolek/uoisfrontend-admissions",
            "@hrbolek/uoisfrontend-requests",
        ],
    },

    // Development server configuration
    server: {
        proxy: {
            // Define proxy rules for API requests
            // Example: Requests to /api/gql are proxied to http://localhost:33001
            '/api/gql': 'http://localhost:33001',
        },
        watch: {
            // Specify paths to watch for changes
            ignored: [
                // Ensure certain packages are not ignored during file watching
                '!../../packages/_template/**',
                '!../../packages/dynamic/**',
                '!../../packages/shared/**',
                '!../../packages/gql_shared/**',
                '!../../packages/ug/**',
                '!../../packages/granting/**',
                '!../../packages/admissions/**',
                '!../../packages/requests/**',
                '!../../packages/z_pack/**',
                '!../../packages/subjects/**',
            ],
        },
        hmr: {
            overlay: true, // Display overlay in the browser for HMR errors
        },
    },

    // Build options
    build: {
        lib: {
            // Could also be a dictionary or array of multiple entry points
            entry: path.resolve(__dirname, 'src/StandaloneEntry.jsx'),
            name: 'Dynamic',
            // the proper extensions will be added
            fileName: (format, name) => `${format}/${name}.js`,
            formats: ['es', 'iife', 'umd']
            // formats: ['es', 'umd']
        },
        rollupOptions: {
            // input: {
            //     main: path.resolve(__dirname, 'library.html')
            // },
            // external: ['react', 'react-dom', '@reduxjs/toolkit'], // Prevent specific libraries from being bundled into the output
            output: {
                // Provide global variables to use in the UMD build
                // for externalized deps
                // globals: {
                //     "react": 'React',
                //     "react-dom": 'ReactDOM',
                //     "@reduxjs/toolkit": "RTK",
                //     // "react-bootstrap": "ReactBootstrap",
                //     // "process": 'JSON.parse("{env:{Node_ENV: ""}}")'
                // },
            },
        },
    },
});
