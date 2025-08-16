# Groove Launcher

Groove Launcher is a metro-styled Android launcher application with a web-based UI built using Node.js, webpack, and SASS. The project includes both a hybrid web interface and an Android application that packages the web assets for mobile deployment.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

Bootstrap, build, and test the repository:
- `npm install` -- takes 60 seconds. NEVER CANCEL. Set timeout to 90+ seconds.
- `npm run build` -- takes 30 seconds. NEVER CANCEL. Set timeout to 60+ seconds.
- `npm run build:production` -- takes 45-55 seconds with minification. NEVER CANCEL. Set timeout to 120+ seconds.

Run the web development server:
- `npm run debug:web` -- starts live development server with auto-rebuild on port 8080. NEVER CANCEL.
- Open `http://localhost:8080/www/` in browser for testing.

Individual build commands:
- `npm run build:webpack` -- JavaScript bundling, takes ~20 seconds
- `npm run build:scss` -- SASS compilation, takes ~5 seconds  
- `npm run build:internal-apps` -- Internal apps compilation, takes ~10 seconds
- `npm run build:android-assets` -- Android asset preparation, takes ~5 seconds

Production builds (for Android release):
- `npm run build:production` -- Full production build with minification, takes 45-55 seconds. NEVER CANCEL. Set timeout to 120+ seconds.

## Android Build Requirements

**IMPORTANT**: Android builds require Android SDK and are NOT available in most development environments.
- Android Studio with SDK 34+
- Java 17+ (OpenJDK Temurin recommended)
- The gradle build will FAIL without proper Android SDK setup
- Use web testing instead: `npm run debug:web`

Android commands (only work with proper SDK setup):
- `npm run build:android` -- Build APK (requires Android SDK)
- `npm run debug:android` -- Build and install debug APK on connected device

## Validation

**CRITICAL**: Always test your changes by running the web application and exercising complete user scenarios.

### Essential Validation Steps
1. **Bootstrap and Build**: Run `npm install && npm run build` to ensure clean build
2. **Start Web Server**: Run `npm run debug:web` and verify server starts on port 8080
3. **Test Application Launch**: Open `http://localhost:8080/www/` and verify application loads
4. **Complete Setup Wizard**: Click through the entire welcome/setup process:
   - Welcome screen with "next" button
   - Ease of access settings (scaling, contrast, etc.)
   - Color selection (accent color picker)
   - Permissions screen
   - What's new screen  
   - Final "Get ready to Groove" screen
5. **Test Main Interface**: Verify the metro-style launcher loads with:
   - Resizable app tiles (Phone, Messages, Chrome, etc.)
   - Live tiles with dynamic content (Contacts with photos, YouTube Music)
   - Navigation between home screen and app list
   - Tile drag and drop functionality
6. **Test Internal Apps**: Access Groove Settings, Groove Tweaks, and Groove Store from app list
   - **Direct Testing**: You can also test internal apps directly at:
     - Groove Settings: `http://localhost:8080/www/apps/groove.internal.settings/`
     - Groove Tweaks: `http://localhost:8080/www/apps/groove.internal.tweaks/`
     - Groove Store: `http://localhost:8080/www/apps/groove.internal.store/`
   - **Expected**: Some internal apps may appear mostly black or show limited functionality in web mode - this is normal

### Validation Scenarios for Code Changes
- **UI/Style Changes**: Always test by running `npm run debug:web`, navigate to affected screens, take screenshots
- **JavaScript Logic Changes**: Test complete user flows from setup through main interface usage
- **Build System Changes**: Test both development (`npm run debug:web`) and production (`npm run build:production`) builds
- **Internal Apps Changes**: Test the specific internal app (Settings/Tweaks/Store) affected

## Project Structure and Navigation

### Key Directories
- `src/` -- Source code for web application
  - `src/script.js` -- Main application entry point
  - `src/scripts/` -- Core application logic and utilities
  - `src/styles.scss` -- Main SASS stylesheet
  - `src/apps/` -- Internal applications (Settings, Tweaks, Store)
- `www/` -- Compiled web assets (generated, do not edit directly)
  - `www/index.html` -- Main launcher interface
  - `www/welcome.html` -- Setup wizard
  - `www/dist/` -- Compiled JavaScript and CSS
  - `www/apps/` -- Compiled internal applications
- `android/` -- Android application project
- `scripts/` -- Build scripts for compilation
- `themes/` -- Community theme gallery

### Important Files for Common Tasks
- **Main UI Logic**: `src/scripts/GrooveBoard.js` -- Core launcher functionality
- **Styling**: `src/styles.scss` and files in `src/styles/`
- **Internal Apps**: Individual folders in `src/apps/` (each has style.scss, script.js, index.html)
- **Mock/Testing**: `src/scripts/grooveMock.js` -- Web testing utilities
- **Build Config**: `package.json`, `webpack.config.js`

### Internal Apps Structure
Each app in `src/apps/` follows this pattern:
- `script.js` -- Application logic  
- `style.scss` -- Application styling
- `index.html` -- Application layout
- Apps are built automatically to `www/apps/` during build process

## Common Development Tasks

### Modifying UI/Styling
1. Edit SASS files in `src/styles/` or component-specific SCSS files
2. Run `npm run debug:web` for live reload during development
3. Changes automatically recompile and refresh browser

### Creating/Modifying Internal Apps  
1. Edit files in `src/apps/{app-name}/`
2. JavaScript changes automatically recompile via webpack
3. SCSS changes automatically recompile via SASS
4. Test by opening the specific app in the launcher

### Working with Themes
1. Themes are CSS files with special metadata comments
2. Test themes using the Groove Theme Editor: https://editor.groovelauncher.org
3. Example theme structure in `themes/` directory
4. Use Groove Tweaks app for testing theme installation

### JavaScript Debugging
- Use browser dev tools when running `npm run debug:web`
- Check console for errors and warnings
- Source maps available in development mode

## Critical Warnings

**NEVER CANCEL BUILDS**: Build processes may take 30-90 seconds. Canceling builds mid-process can corrupt the build state.

**TIMEOUT REQUIREMENTS**:
- `npm install`: Set 90+ second timeout
- `npm run build`: Set 60+ second timeout  
- `npm run build:production`: Set 120+ second timeout
- `npm run debug:web`: No timeout needed (runs continuously)

**TESTING REQUIREMENTS**: 
- ALWAYS test changes via `npm run debug:web` and browser testing
- NEVER skip validation - incomplete testing leads to broken functionality
- Take screenshots of UI changes for verification

## Known Issues and Limitations

- Android builds only work with full Android SDK setup
- Some locale/translation features may show errors in web mode (expected)
- SASS deprecation warnings during build (non-blocking, expected)
- Live tiles may not show real data in web mode (uses mock data)
- Internal apps (Tweaks, Settings) may have limited functionality in web mode
- Expected build warnings that can be ignored:
  - Webpack bundle size warnings (assets exceed 244 KiB limit)
  - SASS deprecation warnings about @import rules
  - Critical dependency warnings from sass.dart.js
  - 404 errors for locale files in web mode

## Quick Reference Commands

```bash
# Essential development workflow
npm install                  # Install dependencies (90s timeout)
npm run debug:web           # Start development server
# Open http://localhost:8080/www/ for testing

# Build commands
npm run build               # Full development build (60s timeout)
npm run build:production    # Production build with minification (120s timeout)

# Individual build steps
npm run build:webpack       # JavaScript only
npm run build:scss          # Styles only
npm run build:internal-apps # Internal apps only
```