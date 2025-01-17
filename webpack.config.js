const path = require('path');
const webpack = require('webpack');

module.exports = env => {
  const webpackVariables = {
    mode: env.production ? "production" : "development",
    forceDevelopmentEnv: true
  }
  return {
    mode: env.production ? "production" : "development",
    entry: {
      script: path.resolve(__dirname, './src/script.js'),
      mock: path.resolve(__dirname, './src/mock.js'),
      themeEditor: path.resolve(__dirname, './src/themeEditor.js'),
      welcome: path.resolve(__dirname, './src/welcome.js'), // add this
      liveTileHelper: path.resolve(__dirname, './src/scripts/liveTileHelper.js'), // add this
    },
    output: {
      path: path.resolve(__dirname, './www/dist/'),
      filename: '[name].js', // output filename based on entry point name
    },
    externals: {
      'webpackVariables': `${JSON.stringify(webpackVariables)}`,
    },
  }
};
//set         if (webpackVariables.mode == "devFelopment" && false) { to         if (webpackVariables.mode == "development") {

//disable forceSetupTest