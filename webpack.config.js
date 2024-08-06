const path = require('path');
const webpack = require('webpack');
const mode = 'development';
global["foo"] = "sex"
globalThis["foo"] = "naber"
const webpackVariables = {
  mode: `${mode}`,
  forceDevelopmentEnv: true

}
module.exports = {
  mode,
  entry: {
    main:  path.resolve(__dirname, './src/script.js'),
  },
  output: {
    path: path.resolve(__dirname, './dist/'),
    filename: 'script.js',
  }, externals: {
    'webpackVariables': `${JSON.stringify(webpackVariables)}`,
  },
};
//set         if (webpackVariables.mode == "development" && false) { to         if (webpackVariables.mode == "development") {

//disable forceSetupTest