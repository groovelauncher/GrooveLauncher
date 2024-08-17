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
      main: path.resolve(__dirname, './src/script.js'),
    },
    output: {
      path: path.resolve(__dirname, './www/dist/'),
      filename: 'script.js',
    }, externals: {
      'webpackVariables': `${JSON.stringify(webpackVariables)}`,
    },
  }
};
//set         if (webpackVariables.mode == "devFelopment" && false) { to         if (webpackVariables.mode == "development") {

//disable forceSetupTest