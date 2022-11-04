import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        testTimeout: 10000,
        environment: "jsdom",
        include: [
            "**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
            "**/tests/**/*.[jt]s?(x)",
            "**/?(*.)+(spec|test).[tj]s?(x)",
            "(/__tests__/.*|(\\.|/)(test|spec))\\.(js|ts)$",
        ],
    },
});
