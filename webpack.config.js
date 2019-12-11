const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const LodashModuleReplacementPlugin = require("lodash-webpack-plugin");
const CircularDependencyPlugin = require("circular-dependency-plugin");

module.exports = {
	entry: "./src/index.ts",
	devtool: "source-map",
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				loader: "ts-loader",
				exclude: /node_modules/,
			},
		],
	},
	optimization: {
		usedExports: true,
	},
	plugins: [
		new CircularDependencyPlugin({
			include: /src/,
		}),
		new CleanWebpackPlugin({
			cleanOnceBeforeBuildPatterns: ["**/*", "!*.d.ts"],
		}),
		new LodashModuleReplacementPlugin(),
	],
	mode: "production",
	resolve: {
		extensions: [".tsx", ".ts", ".js"],
	},
	output: {
		filename: "index.js",
		path: path.resolve(__dirname, "dist"),
	},
};
