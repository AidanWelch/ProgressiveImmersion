const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const stdLibBrowser = require('node-stdlib-browser');
const {
	NodeProtocolUrlPlugin
} = require('node-stdlib-browser/helpers/webpack/plugin');
const webpack = require('webpack');
const LANGUAGES = JSON.stringify(require('@vitalets/google-translate-api/languages'));

const DEFAULTS = [
	["DEFAULT_UPDATE_FREQUENCY", 12.0],
	["DEFAULT_MIN_WORD_LENGTH", 4],
	["DEFAULT_WORDS_TO_SAVE", 5],
	["DEFAULT_FILTER_MAX_SHARE_OF_WORDS", 0.0075],
	["DEFAULT_FILTER_MIN_SHARE_OF_WORDS", 0.001]
];

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
							const text = injectVariable('LANGUAGES', LANGUAGES, content.toString());
							return injectDefaults(text);
						}
					}, {
						context: path.resolve(__dirname, 'src'),
						from: 'content_scripts/*',
						transform (content, absoluteFrom) {
							return injectDefaults(content.toString());
						}
					}, {
						context: path.resolve(__dirname, 'src'),
						from: 'options/*',
						transform (content, absoluteFrom) {
							return injectDefaults(content.toString());
						}
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

function injectVariable (indentifier, variable, text) {
	return text.replaceAll(indentifier, variable);
}

function injectDefaults (text) {
	for (let d of DEFAULTS) {
		text = text.replaceAll(d[0], d[1]);
	}
	return text;
}