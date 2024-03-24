const webpack = require('webpack');
const TerserPlugin = require("terser-webpack-plugin");

const path = require("path");
const metadata = require('./config/metadata.cjs')

const config = {
    entry     : "./src/index.ts",
    output    : {
        path     : path.resolve(__dirname, "dist"),
        filename : "bundle.js"
    },
    devServer : {
        open : true,
        host : "localhost",
    },
    plugins   : [
        new webpack.ProvidePlugin({
            $      : "jquery",
            jQuery : "jquery",
            toastr : "toastr",
            swal   : "sweetalert",
        })
    ],
    module    : {
        rules : [
            {
                test   : /\.ts$/,
                exclude: /node_modules/,
                loader : "babel-loader",
            },
        ],
    },
    resolve   : {
        extensions: ['.ts', '.js'],
    },
    optimization: {
        minimize: true,
        minimizer: [
        new TerserPlugin({
            terserOptions: {
            format: {
                comments: /@license/i,
            },
            },
            extractComments: true,
        }),
        ],
    },
};

module.exports = config;