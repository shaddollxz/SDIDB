import { defineConfig } from "vite";
import type { PluginOption } from "vite";
import path from "path";
import fs from "fs-extra";
import dts from "vite-plugin-dts";

const outDir = path.join(__dirname, "/dist");

const plugins: (PluginOption | PluginOption[])[] = [];
plugins.push(
    dts({
        async afterBuild() {
            const indexDir = path.resolve(outDir, "./index.d.ts");
            const dts = await fs.readFile(indexDir, "utf-8");
            await fs.writeFile(indexDir, dts + 'export * from "./typings/utils";');
            await fs.rename(path.resolve(outDir, "./index.es.js"), path.resolve(outDir, "./index.js"));
        },
    })
);

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        outDir,
        target: "es2015", // 这里是库模式 发布到npm用es2015 否则webpack无法使用
        emptyOutDir: true,
        lib: {
            entry: path.join(__dirname, "/src/index.ts"),
            fileName: "index",
            name: "sdt",
            formats: ["es"], // 只打包出es模块的包
        },
    },
    plugins,
});
