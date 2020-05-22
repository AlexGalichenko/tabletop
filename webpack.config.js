const path = require("path");
const VueLoaderPlugin = require("vue-loader/lib/plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
    mode: "development",
    entry: {
        app: "./src/main.js",
    },
    output: {
        path: path.resolve("./public"),
        filename: "bundle.js"
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                include: [
                  path.resolve(__dirname, './src'),
                ]
            },
            {
                test: /\.(png|svg|jpg|gif|woff|woff2|ttf|eot)$/,
                use: [
                    "file-loader"
                ]
            },
            {   test: /\.vue$/,
                loader: ["vue-loader"]
            },
            {
                test: /\.css$/,
                loader: [
                    "vue-style-loader",
                    "css-loader"
                ]
            },
            // {
            //     test: /\.(jpg|png)$/,
            //     use: {
            //         loader: 'url-loader',
            //     },
            // }
        ]
    },
    plugins: [
        new VueLoaderPlugin(),
        new HtmlWebpackPlugin({
            template: "./src/index.html",
            filename: "index.html"
        }),
    ]
};
