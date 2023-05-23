const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const PACKAGE = require("./package.json");

module.exports = (env, argv) => [
	{
		entry: {
			background_scripts: {import: './src/background_scripts/main.js', filename: 'background_scripts/main.js'},
			options: {import: './src/options/index.js', filename: 'options/index.js'},
			content_scripts: {import: './src/content_scripts/main.js', filename: 'content_scripts/main.js'},
			'dictionary-list': {import: './src/popup/dictionary-list.js', filename: 'popup/[name].js'},
			dictionary: {import: './src/popup/dictionary.js',  filename: 'popup/[name].js'},
			'language-select': {import: './src/popup/language-select.js', filename: 'popup/[name].js'},
			index: {import: './src/popup/index.js',  filename: 'popup/[name].js'}
		},
		devtool: (argv.mode === 'development') ? 'inline-source-map' : false,
		output: {
			path: path.resolve(__dirname, 'build'),
			clean: true,
		},
		plugins: [
			new CopyPlugin({
				patterns: [
					{
						from: (env.manifest === 'v3') ? path.resolve(__dirname, 'src', 'manifest-v3.json') : path.resolve(__dirname, 'src', 'manifest-v2.json'),
						to: 'manifest.json',
						transform(content, absoluteFrom) {
							return content.toString().replaceAll('VERSION', PACKAGE.version);
						}
					},
					{
						context: path.resolve(__dirname, 'src'),
						from:  'images/*.png',
					}, {
						context: path.resolve(__dirname, 'src'),
						from: 'popup/*.{html,css}',
					}, {
						context: path.resolve(__dirname, 'src'),
						from: 'options/*.html',
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
