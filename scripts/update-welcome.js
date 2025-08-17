#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get the what's new content from command line arguments
const whatsNewContent = process.argv[2];

if (!whatsNewContent) {
  console.log('No what\'s new content provided, skipping welcome.html update');
  process.exit(0);
}

console.log('Updating welcome.html with AI-generated what\'s new content');

// Use the content directly from command line argument
let trimmedContent = whatsNewContent.trim();

// Remove markdown code blocks if present
// Remove ```html or ``` from the beginning
trimmedContent = trimmedContent.replace(/^```html?\s*\n?/, '');
// Remove ``` from the end
trimmedContent = trimmedContent.replace(/\n?\s*```$/, '');
// Trim again after removing code blocks
trimmedContent = trimmedContent.trim();

// Check if welcome.html exists
const welcomeHtmlPath = path.join('www', 'welcome.html');
if (!fs.existsSync(welcomeHtmlPath)) {
  console.log('welcome.html not found at www/welcome.html');
  process.exit(1);
}

// Create a backup
fs.copyFileSync(welcomeHtmlPath, welcomeHtmlPath + '.backup');

// Read the welcome.html file
let welcomeContent = fs.readFileSync(welcomeHtmlPath, 'utf8');

// Replace content between HTML comment markers
const startMarker = '<!--WHATS NEW START-->';
const endMarker = '<!--WHATS NEW END-->';

const startIndex = welcomeContent.indexOf(startMarker);
const endIndex = welcomeContent.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.log('Could not find HTML comment markers in welcome.html');
  process.exit(1);
}

// Calculate positions
const beforeMarker = welcomeContent.substring(0, startIndex + startMarker.length);
const afterMarker = welcomeContent.substring(endIndex);

// Create the new content with proper indentation
const newContent = `${beforeMarker}
                            <ul>
${trimmedContent}
                            </ul>
                            ${afterMarker}`;

// Write the updated content back to the file
fs.writeFileSync(welcomeHtmlPath, newContent);

console.log('Successfully updated www/welcome.html with AI-generated what\'s new content');