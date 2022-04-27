const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = [
    {
        entry: path.resolve(__dirname, 'src', 'background_scripts', 'main.js'),
        output: {
            path: path.resolve(__dirname, 'build'),
            filename: path.join('background_scripts', 'main.js')
        },
        plugins: [
            new CopyPlugin({
                patterns: [
                    path.resolve(__dirname, 'src', 'manifest.json'),
                    {
                        context: path.resolve(__dirname, 'src'),
                        from:  'images/*.png',
                    }, {
                        from: path.resolve(__dirname, 'src', 'popup'),
                        to: path.resolve(__dirname, 'build', 'popup'),
                    }, {
                        from: path.resolve(__dirname, 'src', 'content_scripts'),
                        to: path.resolve(__dirname, 'build', 'content_scripts'),
                    }
                ]
            })
        ]
    },
]