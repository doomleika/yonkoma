var path = require('path');

module.exports = {
    entry: './js.src/script.js',
    output: {
        filename: 'script.js',
        path: path.resolve(__dirname, 'js')
    }
};