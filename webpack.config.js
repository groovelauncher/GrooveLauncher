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
      welcome: path.resolve(__dirname, './src/welcome.js'), // add this
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