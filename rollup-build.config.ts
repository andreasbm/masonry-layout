import ts from "rollup-plugin-ts";
import path from "path";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import progress from "rollup-plugin-progress";
import { terser } from "rollup-plugin-terser";

const folders = {
	src: path.resolve(__dirname, "src/lib"),
	dist: path.resolve(__dirname, "dist"),
	dist_umd: path.resolve(__dirname, "dist/umd")
};

const files = {
	src_index: path.join(folders.src, "index.ts"),
	dist_umd_masonry_layout: path.join(folders.dist_umd, "masonry-layout.min.js")
};

const plugins = () => [
	progress(),
	resolve(),
	ts({
		tsconfig: "tsconfig.build.json"
	}),
	commonjs({
		include: "**/node_modules/**"
	})
];

const configs = [
	{
		input: files.src_index,
		output: [
			{
				format: "umd",
				name: "masonry-layout",
				file: files.dist_umd_masonry_layout
			}
		],
		plugins: [
			...plugins(),
			terser()
		],
		treeshake: true,
		context: "window"
	}
];

export default configs;

