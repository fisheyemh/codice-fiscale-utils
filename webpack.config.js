const path = require('path');

module.exports = {
    entry: './src/index.js',
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader'
                }
            }
        ]
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'codice-fiscale-utils.min.js',
        library: 'codiceFiscaleUtils',
        libraryTarget: 'commonjs',
        globalObject: 'typeof self !== \'undefined\' ? self : this'
    },
    externals: {
        moment: {
            commonjs: 'moment',
            commonjs2: 'moment',
            amd: 'moment',
            var: 'moment'
        }
    }
};
