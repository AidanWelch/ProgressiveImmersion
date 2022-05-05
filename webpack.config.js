const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const stdLibBrowser = require('node-stdlib-browser');
const {
	NodeProtocolUrlPlugin
} = require('node-stdlib-browser/helpers/webpack/plugin');
const webpack = require('webpack');
const languages = JSON.stringify(require('@vitalets/google-translate-api/languages'));

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
						transform (content, absoluteFrom) {
							return injectVariables('LANGUAGES', languages, content);
						}
					}, {
						context: path.resolve(__dirname, 'src'),
						from: 'content_scripts/*',
					}, {
						context: path.resolve(__dirname, 'src'),
						from: 'options/*',
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

function injectVariables (indentifier, variable, buffer) {
	const text = buffer.toString();
	return text.replace(indentifier, variable);
}