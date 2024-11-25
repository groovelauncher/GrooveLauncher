const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Check for --production flag
const args = process.argv.slice(2);
const mode = args.includes('--production') ? 'production' : 'development';

console.log(`Running in ${mode} mode`);

// Directory paths
const srcDir = 'src/apps';
const destDir = 'www/apps';
const tempConfigDir = 'temp_config';

// Read directories from src/apps
fs.readdirSync(srcDir).forEach(subfolder => {
    const subfolderPath = path.join(srcDir, subfolder);
    if (fs.statSync(subfolderPath).isDirectory()) {
        // Create destination directories
        fs.mkdirSync(path.join(destDir, subfolder), { recursive: true });
        fs.mkdirSync(path.join(tempConfigDir, subfolder), { recursive: true });

        // File paths
        const scssSrc = path.join(subfolderPath, 'style.scss');
        const jsSrc = path.join(subfolderPath, 'script.js');
        const htmlSrc = path.join(subfolderPath, 'index.html');
        
        const cssDest = path.join(destDir, subfolder, 'style.css');
        const jsDest = path.join(destDir, subfolder, 'script.js');
        const htmlDest = path.join(destDir, subfolder, 'index.html');

        // Compile SCSS
        if (fs.existsSync(scssSrc)) {
            console.log(`Compiling ${scssSrc} to ${cssDest}`);
            const sassCommand = `npx sass ${scssSrc} ${cssDest} ${mode === 'production' ? '--no-source-map --style=compressed' : '--no-source-map'}`;
            execSync(sassCommand, { stdio: 'inherit' });
        } else {
            console.log(`No SCSS file found in ${subfolder}`);
        }

        // Compile JS with Webpack
        if (fs.existsSync(jsSrc)) {
            console.log(`Compiling ${jsSrc} to ${jsDest}`);

            // Create a temporary webpack.config.js
            const webpackConfig = `
const path = require('path');

module.exports = {
  entry: './${jsSrc.replace(/\\/g, '/')}', // Replace backslashes on Windows
  output: {
    path: path.resolve(__dirname, './../${destDir}/${subfolder}'),
    filename: 'script.js'
  },
  mode: '${mode}'
};
`;
            fs.writeFileSync(path.join(tempConfigDir, `${subfolder}.webpack.config.js`), webpackConfig);

            execSync(`npx webpack --config ${path.join(tempConfigDir, `${subfolder}.webpack.config.js`)}`, { stdio: 'inherit' });
        } else {
            console.log(`No JS file found in ${subfolder}`);
        }

        // Copy index.html if it exists
        if (fs.existsSync(htmlSrc)) {
            console.log(`Copying ${htmlSrc} to ${htmlDest}`);
            fs.copyFileSync(htmlSrc, htmlDest);
        } else {
            console.log(`No index.html file found in ${subfolder}`);
        }
    }
});

console.log("Compilation completed.");