const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const LodashModuleReplacementPlugin = require("lodash-webpack-plugin");

module.exports = {
	entry: "./src/index.ts",
	plugins: [new CleanWebpackPlugin()],
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				loader: "babel-loader",
				exclude: /node_modules/,
				options: {
					plugins: [
						"lodash",
						"@babel/plugin-proposal-class-properties",
					],
					presets: ["@babel/preset-typescript", "@babel/preset-env"],
				},
			},
		],
	},
	optimization: {
		usedExports: true,
	},
	plugins: [new LodashModuleReplacementPlugin()],
	mode: "production",
	resolve: {
		extensions: [".tsx", ".ts", ".js"],
	},
	output: {
		filename: "bundle.js",
		path: path.resolve(__dirname, "dist"),
	},
};
