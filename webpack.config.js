var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    entry: [
      "./js/index.js"
    ],
    output: {
        path: __dirname + "/build",
        filename: "app.js"
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'public/index.html'
        }),
        // ignjore "jquery" because exoskeleton will try to load it and the ajax lib will try to load "type"
        new webpack.IgnorePlugin(/^(jquery|type)$/)
    ],
    module: {
        loaders: [
            { test: /\.css$/,   loader: "style!css" },
            { test: /\.less$/, loader: "style!css!less" },
            // exoskeleton as AMD references to jquery which we want to avoid
            // https://github.com/webpack/webpack/issues/922
            { test: /exoskeleton\.js$/,    loader: "imports?define=>false"},
            { test: /backbone\.js$/,    loader: "imports?define=>false"},
            { test: /\.js$/,    loader: "jsx?define=>false", query: { insertPragma: 'React.DOM' } },
            { test: /\.json$/,  loader: "json" },
            { test: /\.(jpe?g|png|gif|svg)$/i, loaders: [
                'file?hash=sha512&digest=hex&name=[hash].[ext]',
                'image?bypassOnDebug&optimizationLevel=7&interlaced=false'
            ]},
            { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=10000&minetype=application/font-woff" },
            { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file-loader" }
        ]
    },
    resolve: {
        alias: {
            'backbone': 'exoskeleton/exoskeleton.js'
        }
    },
    resolveLoader: { root: path.join(__dirname, "node_modules") }
};
