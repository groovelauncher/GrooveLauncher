const fs = require('fs');
const path = require('path');

const androidAssetsPath = 'android/app/src/main/assets';
const wwwPath = 'www';
const excludedFolders = ['mock'];

async function buildAndroid() {
    try {
        // Remove all contents from android assets directory
        if (fs.existsSync(androidAssetsPath)) {
            fs.rmSync(androidAssetsPath, { recursive: true, force: true });
        }
        fs.mkdirSync(androidAssetsPath, { recursive: true });
        
        // Copy www contents to android assets recursively
        copyFolderRecursive(wwwPath, androidAssetsPath);
        
        console.log('Android assets built successfully!');
    } catch (error) {
        console.error('Error building Android assets:', error);
        process.exit(1);
    }
}

function copyFolderRecursive(source, target) {
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
    }

    const files = fs.readdirSync(source);

    files.forEach(file => {
        const sourcePath = path.join(source, file);
        const targetPath = path.join(target, file);

        // Skip excluded folders
        if (excludedFolders.includes(file) && fs.statSync(sourcePath).isDirectory()) {
            return;
        }

        if (fs.statSync(sourcePath).isDirectory()) {
            copyFolderRecursive(sourcePath, targetPath);
        } else {
            fs.copyFileSync(sourcePath, targetPath);
        }
    });
}

buildAndroid();
