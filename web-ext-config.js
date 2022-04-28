const path = require('path');

module.exports = {
	sourceDir: path.resolve(__dirname, 'build'),
	build: {
		overwriteDest: true,
	}
}