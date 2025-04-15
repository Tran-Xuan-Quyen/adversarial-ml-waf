const { resolve: dir, resolve } = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

var config = undefined;

if(process.env.NODE_ENV === "development"){
  config = {
    webpack: {},
    devServer: {
      devMiddleware: {
        index: true,
        writeToDisk: true
      }
    }
  }
}
else{
  config = {
    webpack: {
      plugins: {
        add: [
          new HtmlWebpackPlugin({
            template: dir(__dirname, "./public/index.html"),
            minify: {
              removeComments: true,
              collapseWhitespace: true,
              removeRedundantAttributes: true,
              useShortDoctype: true,
              removeEmptyAttributes: true,
              removeStyleLinkTypeAttributes: true,
              keepClosingSlash: true,
              minifyJS: true,
              minifyCSS: true,
              minifyURLs: true,
            },
          }),
        ],
        remove: ["HtmlWebpackPlugin"],
      },
    },
    configure: (webpackConfig) => {
      webpackConfig.optimization = {
        ...webpackConfig.optimization,
        splitChunks: {
          ...webpackConfig.optimization.splitChunks,
          ...{
            automaticNameDelimiter: "~",
            minChunks: 2,
            name: "ecg",
            cacheGroups: {
              react: {
                name: "ecg-react",
                test: /[\\/]node_modules[\\/](react|react-dom|redux|redux-saga|@redux-saga|react-redux|react-dropzone|react-use|react-router|react-router-dom|react-intl|react-app-polyfill)[\\/]/,
                priority: 3,
                enforce: true,
                reuseExistingChunk: true,
                chunks: "all"
              },
              kendo: {
                test: /[\\/]node_modules[\\/]@progress|hammerjs[\\/]/,
                chunks: "all",
                enforce: true,
                priority: 2,
                name: "ecg-kendo",
                reuseExistingChunk: true
              },
              styles: {
                name: "ecg-style",
                test: /\.css$|.sass$|.scss/,
                priority: 3,
                chunks: "all",
                enforce: true
              },
              locales: {
                name: "ecg-locales",
                test: /[\\/]src[\\/]locales[\\/]/,
                priority: 1,
                chunks: "all",
                enforce: true
              },
              vendors: {
                test: /[\\/]node_modules[\\/]/,
                chunks: "all",
                enforce: true,
                name: "ecg-vendors",
                priority: 0,
                reuseExistingChunk: true
              }
            }
          }
        }
      };

      webpackConfig.resolve = webpackConfig.resolve || {};
      webpackConfig.resolve.fallback = webpackConfig.resolve.fallback || {};
      webpackConfig.output = {
        ...webpackConfig.output,
        ...{
          crossOriginLoading: "anonymous",
          path: dir(__dirname, "www"),
          clean: true,
        },
      };
      return webpackConfig;
    },
  }
}
module.exports = config;