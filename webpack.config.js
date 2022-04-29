const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const stdLibBrowser = require('node-stdlib-browser');
const {
	NodeProtocolUrlPlugin
} = require('node-stdlib-browser/helpers/webpack/plugin');
const webpack = require('webpack');

module.exports = (env, argv) => [
	{
		entry: path.resolve(__dirname, 'src', 'background_scripts', 'main.js'),
		devtool: (argv.mode === 'development') ? 'inline-source-map' : false,
		output: {
			path: path.resolve(__dirname, 'build'),
			filename: path.join('background_scripts', 'main.js'),
			clean: true,
		},
		resolve: {
			alias: stdLibBrowser
		},
		plugins: [
			new NodeProtocolUrlPlugin(),
			new webpack.ProvidePlugin({
				process: stdLibBrowser.process,
				Buffer: [stdLibBrowser.buffer, 'Buffer']
			}),
			new CopyPlugin({
				patterns: [
					path.resolve(__dirname, 'src', 'manifest.json'),
					{
						context: path.resolve(__dirname, 'src'),
						from:  'images/*.png',
					}, {
						context: path.resolve(__dirname, 'src'),
						from: 'popup/*',
					}, {
						context: path.resolve(__dirname, 'src'),
						from: 'content_scripts/*',
					}
				]
			})
		],
		devServer: {
			hot: false,
			port: 8000,
			allowedHosts: 'auto',
			static: path.resolve(__dirname, 'build'),
			watchFiles: 'src/**/*',
			client: {
				progress: true
			},
			devMiddleware: {
				writeToDisk: true
			}
		}
	},
];