'use strict';

var webpack = require('webpack');

module.exports = {
    entry: {
        "server": './src/index.js'
    },
    output: {
        path: __dirname + "/../public/js/",
        filename: 'addon.js',
        library: "addon"
    },
    plugins: [
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify("development")
            }
        })
    ],
    resolve: {
        extensions: ['.js', '.jsx', '.css', '.scss', '.less']
    },
    module: {
        loaders: [
            { test: /\.jsx?$/, loaders: [
                'babel-loader'
            ], exclude: /node_modules/ },
            { test: /\.png$/,
              use: [{
                loader: 'file-loader',
                options: {
                  publicPath: '/js'
                }
              }],
              exclude: /node_modules/ },
            { test: /\.css$/, loaders: [
                'style-loader',
                'css-loader',
                'autoprefixer-loader',
            ] },
            { test: /\.scss$/, loader: "style!css!sass" },
            { test: /\.less$/,   loader: "style!css!less" }
        ]
    }
};
