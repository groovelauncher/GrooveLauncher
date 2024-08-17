const path = require('path');

module.exports = {
  entry: './src/apps/groove.internal.settings/script.js',
  output: {
    path: path.resolve(__dirname, './../www/apps/groove.internal.settings'),
    filename: 'script.js'
  },
  mode: 'production'
};
