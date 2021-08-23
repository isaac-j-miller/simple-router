const path = require("path");

module.exports = {
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                ["@babel/env", { modules: false, targets: { node: "current" } }],
                "@babel/typescript",
              ],
              plugins: [
                [
                  "babel-plugin-module-resolver",
                  {
                    root: ["./src"],
                    alias: {
                      src: "./src",
                    },
                  },
                ],
                "@babel/plugin-proposal-class-properties",
                "@babel/plugin-proposal-object-rest-spread",
                "@babel/plugin-proposal-optional-chaining",
                "@babel/plugin-transform-typescript",
              ],
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  mode: "development",
  devtool: "source-map",
  entry: {
    "lambda": "./src/index.ts",
  },
  target: "node",
  output: {
    filename: "[name].js",
    libraryTarget: "commonjs2",
    path: path.join(__dirname, "/dist"),
  },
};
