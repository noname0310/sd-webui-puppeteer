import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import HtmlInlineScriptPlugin from "html-inline-script-webpack-plugin";
import HtmlInlineCSSWebpackPlugin from "html-inline-css-webpack-plugin";
import ESLintPlugin from "eslint-webpack-plugin";
//import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";

export default {
    entry: "./src/index.ts",
    output: {
        path: path.join(__dirname, "/dist"),
        filename: "bundle.js",
        assetModuleFilename: "static/[name][ext]",
        publicPath: "/"
    },
    optimization: {
        minimize: true
    },
    module: {
        rules: [{
            test: /\.(ts|tsx|js|jsx)$/,
            use: [{
                loader: "ts-loader"
            }]
        },
        {
            test: /\.(png|jpg|gif|hdr)$/,
            type: "asset"
        },
        {
            test: /\.(mp3|ogg|wav)$/,
            loader: "file-loader",
            options: {
                name: "asset/audio/[name].[ext]?[hash]"
            }
        },
        {
            test: /\.html$/,
            use: [
                { loader: "html-loader" }
            ]
        },
        {
            test: /\.css$/,
            use: [
                {
                    loader: "style-loader",
                    options: {
                        injectType: "styleTag"
                    }
                },
                "css-loader"
            ]
        }
        ]
    },
    resolve: {
        modules: [path.join(__dirname, "src"), "node_modules"],
        extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
        fallback: {
            fs: false,
            'path': false
        }
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/index.html"
        }),
        new HtmlInlineScriptPlugin(),
        new HtmlInlineCSSWebpackPlugin(),
        new ESLintPlugin({
            extensions: ["ts", "tsx", "js", "jsx"]
        }),
        //new BundleAnalyzerPlugin()
    ].filter(Boolean),
    devServer: {
        host: "0.0.0.0",
        allowedHosts: "all",
        port: 20311
    },
    mode: "development"
};
