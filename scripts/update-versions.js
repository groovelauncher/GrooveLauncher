#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get version info from command line arguments
const versionName = process.argv[2];
const versionCode = process.argv[3];

if (!versionName || !versionCode) {
  console.error('Usage: node update-versions.js <version_name> <version_code>');
  process.exit(1);
}

console.log(`Updating version to: ${versionName} (code: ${versionCode})`);

// Update grooveMock.js
const grooveMockPath = path.join(__dirname, '..', 'src', 'scripts', 'grooveMock.js');
let grooveMockContent = fs.readFileSync(grooveMockPath, 'utf8');

// Replace version name between comment markers
const versionNameRegex = /(\/\/ VERSIONNAME START[\s\S]*?return ")[^"]*(";[\s\S]*?\/\/ VERSIONNAME END)/;
grooveMockContent = grooveMockContent.replace(versionNameRegex, `$1${versionName}$2`);

fs.writeFileSync(grooveMockPath, grooveMockContent);
console.log('Updated grooveMock.js version');

// Update build.gradle.kts
const buildGradlePath = path.join(__dirname, '..', 'android', 'app', 'build.gradle.kts');
let buildGradleContent = fs.readFileSync(buildGradlePath, 'utf8');

// Replace version name between comment markers
const gradleVersionNameRegex = /(\/\/ VERSIONNAME START[\s\S]*?versionName = ")[^"]*(";?[\s\S]*?\/\/ VERSIONNAME END)/;
buildGradleContent = buildGradleContent.replace(gradleVersionNameRegex, `$1${versionName}$2`);

// Replace version code between comment markers
const gradleVersionCodeRegex = /(\/\/ VERSIONCODE START[\s\S]*?versionCode = )[0-9]+([\s\S]*?\/\/ VERSIONCODE END)/;
buildGradleContent = buildGradleContent.replace(gradleVersionCodeRegex, `$1${versionCode}$2`);

fs.writeFileSync(buildGradlePath, buildGradleContent);
console.log('Updated build.gradle.kts version name and code');

console.log('Version numbers updated successfully using comment markers');