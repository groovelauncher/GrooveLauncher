#!/bin/bash

# Check for --production flag
MODE="development"
if [[ "$1" == "--production" ]]; then
  MODE="production"
fi

echo "Running in $MODE mode"

for dir in src/apps/*/; do
    # Get the subfolder name
    subfolder=$(basename "$dir")

    # Create the destination directories if they don't exist
    mkdir -p "www/apps/$subfolder"
    mkdir -p "temp_config/$subfolder"

    # Paths for source files
    scss_src="src/apps/$subfolder/style.scss"
    js_src="src/apps/$subfolder/script.js"
    html_src="src/apps/$subfolder/index.html"

    # Paths for output files
    css_dest="www/apps/$subfolder/style.css"
    js_dest="www/apps/$subfolder/script.js"
    html_dest="www/apps/$subfolder/index.html"

    # Compile SCSS
    if [ -f "$scss_src" ]; then
        echo "Compiling $scss_src to $css_dest"
        if [[ "$MODE" == "production" ]]; then
            npx sass "$scss_src" "$css_dest" --no-source-map --style=compressed
        else
            npx sass "$scss_src" "$css_dest" --no-source-map
        fi
    else
        echo "No SCSS file found in $subfolder"
    fi

    # Compile JS with Webpack
    if [ -f "$js_src" ]; then
        echo "Compiling $js_src to $js_dest"

        # Dynamically create a webpack.config.js for the current subfolder
        cat >temp_config/$subfolder.webpack.config.js <<EOL
const path = require('path');

module.exports = {
  entry: './$js_src',
  output: {
    path: path.resolve(__dirname, './../www/apps/$subfolder'),
    filename: 'script.js'
  },
  mode: '$MODE'
};
EOL

        npx webpack --config temp_config/$subfolder.webpack.config.js
    else
        echo "No JS file found in $subfolder"
    fi

    # Copy index.html if it exists
    if [ -f "$html_src" ]; then
        echo "Copying $html_src to $html_dest"
        cp "$html_src" "$html_dest"
    else
        echo "No index.html file found in $subfolder"
    fi
done

echo "Compilation completed."