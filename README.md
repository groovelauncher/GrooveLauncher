<div align="center">
  <img src="metadata/en-US/images/icon-transparent.png" width="120">
  <h1>Groove Launcher</h1>
  <p>A groovy personalized home screen experience</p>
</div>

[NEW! Get Themes For Groove Tweaks](THEMES.MD)
---

**Groove Launcher** is a metro-styled launcher designed for a customizable and sleek user experience. Users can personalize their launcher by adjusting tile sizes, changing tile positions, customizing the color theme, and setting their favorite wallpapers.

## Features

- **Metro-Style Interface:** A clean & modern design inspired by Windows Phone 8.
- **Customizable Tiles:** Drag and drop tiles, adjust their sizes, and move them around to fit your unique style.
- **Theme Customization:** Change the color of the launcher to match your mood or aesthetic.
- **Wallpaper Personalization:** Choose and set your own wallpapers to create a fully personalized setup.

## Releases

You can download the latest prebuilt APK from the [Releases](https://github.com/groovelauncher/GrooveLauncher/releases) section.

1. Head to the [Releases](https://github.com/groovelauncher/GrooveLauncher/releases) page.
2. Download the APK file.
3. Install it on your Android device.

## Screenshots

<table>
    <tr>
        <td><img src="metadata/en-US/images/phoneScreenshots/ss0.png"></td>
        <td><img src="metadata/en-US/images/phoneScreenshots/ss1.png"></td>
        <td><img src="metadata/en-US/images/phoneScreenshots/ss2.png"></td>
    </tr>
    <tr>
        <td><img src="metadata/en-US/images/phoneScreenshots/ss3.png"></td>
        <td><img src="metadata/en-US/images/phoneScreenshots/ss4.png"></td>
        <td><img src="metadata/en-US/images/phoneScreenshots/ss5.png"></td>
    </tr>
</table>


## Build

If you prefer to build the app yourself:

1. Clone the repository:

   ```bash
   git clone https://github.com/groovelauncher/GrooveLauncher.git
   ```

2. Navigate to the project directory and run the build script:

   ```bash
   npm run build:production
   ```

3. Open the `./android` folder in Android Studio.

4. Compile and run the app on your device/emulator.

### Alternative

1. Clone the repository:

   ```bash
   git clone https://github.com/groovelauncher/GrooveLauncher.git
   ```

2. Navigate to the project directory and run the build script:

   ```bash
   npm run build:android
   ```

This will automatically install the app on your device if ADB debugging is enabled on the device.

## Testing on Web Environment

1. Clone the repository:

   ```bash
   git clone https://github.com/groovelauncher/GrooveLauncher.git
   ```

2. Navigate to the project directory and run the build-watch script for the web environment:

   ```bash
   npm run debug:web
   ```

3. Open your web browser and navigate to `http://localhost:8080/www/` to test the application.

## Usage

1. Open the **Groove Launcher** app.
2. Drag and drop tiles to rearrange them.
3. Long press on a tile to resize it.
4. Swipe left to open the app list and find **Groove Settings**.
5. In **Groove Settings**, you can set a wallpaper or choose an accent color that fits your style!

## Writing Styles for Groove Tweaks

### Metadata Requirements
Your CSS file must include the following metadata at the top:
```css
/* title: Your Style Name */
/* author: [Your Name](https://github.com/yourusername) */
/* icon: https://link-to-your-icon.png */
/* description: Brief description of your style */
```

### Example CSS Template
```css
/* title: Neon Groove Theme */
/* author: [Example User](https://github.com/example) */
/* icon: https://example.com/neon-icon.png */
/* description: Weird ahh theme for Groove Launcher */

#app {
  background: #0a0a0a;
}
```

### Hosting Your Style
1. Host your CSS file on any of these platforms:
   - GitHub Gist
   - Any CDN service
   - Your own server

### Creating Quick Install Links
Use this tool to generate installation links:
[Groove Tweaks Link Generator](https://codepen.io/wellitsucks/full/ogvqZXZ)
```
groove:?installStyle=URL
```
This link opens up an install dialog in Groove Tweaks app.
## Contributing

Contributions are most welcome! Feel free to submit issues and pull requests to help improve **Groove Launcher**.

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Submit a pull request when your code is ready.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For any inquiries or feedback, feel free to reach out!

<a href="https://www.buymeacoffee.com/berkaytumal" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>
