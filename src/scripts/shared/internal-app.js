// Import required modules and utilities
import { grooveColors, grooveThemes } from "../GrooveProperties";
import "../flowTouch.js";
import applyOverscroll from "../overscrollFramework.js";
import fontStore from "../fontStore.js";
import GrooveMock from "./../grooveMock.js";
import { set } from "lodash";
// Initialize mock environment if Groove isn't available
const GrooveMockInstance = !window.Groove
if (GrooveMockInstance) {
  //window.Groove = new GrooveMock("./../../mock/apps.json")
  window.Groove = new GrooveMock("./../../mock/apps.json")
}

// Updates the app's accent color and validates against known colors
const setAccentColor = (color) => {
  if (Object.values(grooveColors).includes(color)) {
  } else {
    console.error("Custom color detected!", color);
  }
  document.body.style.setProperty("--accent-color", color);
};

// Handles theme switching between light and dark modes
const setTheme = (theme) => {
  if (Object.values(grooveThemes).includes(theme)) {
    var applyTheme = 0;
    if (theme == 2) applyTheme = Number(window.parent.matchMedia("(prefers-color-scheme: light)").matches ? 1 : 0); else applyTheme = theme;
    document.body.classList[applyTheme ? "add" : "remove"]("light-mode");
    document.body.classList.add("showBackground")
  } else {
    console.error("Invalid theme!");
  }
};
// Manages font selection (0-2) and loads custom fonts when needed
const setFont = (font) => {
  font = Number(font)
  // Clamp font value between 0 and 2
  font = font < 0 ? 0 : font > 2 ? 2 : font
  // Remove existing font classes
  document.body.classList.remove("font-1")
  document.body.classList.remove("font-2")
  var resultFont = 0
  console.log("font set ", font)
  switch (font) {
    case 0: // Default font
      resultFont = 0
      break;
    case 1: // First alternative font
      resultFont = 1
      document.body.classList.add("font-1")
      break;
    case 2: // Custom font, only load if available
      if (fontStore.hasFont()) {
        fontStore.loadFont()
        resultFont = 2
        document.body.classList.add("font-2")
      }
      break;
  }
}

// Toggles reduced motion accessibility setting
function setReduceMotion(bool) {
  bool = !!bool
  if (bool) document.body.classList.add("reduced-motion"); else document.body.classList.remove("reduced-motion")
}
function setHighContrast(bool) {
  bool = !!bool
  if (bool) document.body.classList.add("high-contrast"); else document.body.classList.remove("high-contrast")
}

function setAnimationDurationScale(scale) {
  window.animationDurationScale = scale
  document.body.style.setProperty("--animation-duration-scale", scale)
  document.querySelector("html").style.setProperty("--animation-duration-scale", scale)
}
const setTextDirection = (direction) => {
  if (direction == "ltr") {
    document.body.classList.remove("rtl");
  } else if (direction == "rtl") {
    document.body.classList.add("rtl");
  } else {
    console.error("Invalid text direction!");
    return;
  }
}
// Expose functions to window for external access
window.setAccentColor = setAccentColor;
window.setTheme = setTheme;
window.setFont = setFont;
window.setReduceMotion = setReduceMotion;

// Listen for messages from parent window to handle settings changes
window.addEventListener("message", (event) => {
  if (event.data["action"]) {
    if (event.data.action == "setTheme") {
      setTheme(event.data.argument);
      console.log("Theme set to", event.data.argument)
    } if (event.data.action == "setFont") {
      setFont(event.data.argument);
    } else if (event.data.action == "setAccentColor") {
      setAccentColor(event.data.argument);
    } else if (event.data.action == "softExit") {
      // Add appropriate exit animation class
      if (event.data.argument) {
        document.body.classList.add("soft-exit-home")
      } else {
        document.body.classList.add("soft-exit")
      }
    } else if (event.data.action == "setAnimationDurationScale") {
      setAnimationDurationScale(event.data.argument)
    }
  }
});
requestAnimationFrame(() => {
  if (!!localStorage.getItem("reducedMotion")) setReduceMotion(localStorage.getItem("reducedMotion") == "true", true)
  if (!!localStorage.getItem("highContrast")) setHighContrast(localStorage.getItem("highContrast") == "true", true)
})
// Initialize app with stored preferences or defaults
const urlParams = new URLSearchParams(window.location.search);
setAccentColor(localStorage["accentColor"] || grooveColors.violet);
setTheme(localStorage["theme"] === undefined ? grooveThemes.dark : Number(localStorage["theme"]));
setTextDirection(localStorage["textDirection"] || "ltr");
if(localStorage.getItem("forceRTL") == "true") setTextDirection("rtl")
// Event handlers for communicating with parent window
const appViewEvents = {
  setAccentColor: (color) => {
    const message = { action: "setAccentColor", argument: color };
    window.parent.postMessage(message, '*');
  },
  setTheme: (theme) => {
    const message = { action: "setTheme", argument: theme };
    window.parent.postMessage(message, '*');
  },
  setTileColumns: (col) => {
    const message = { action: "setTileColumns", argument: col };
    window.parent.postMessage(message, '*');
  },
  setUIScale: (scale) => {
    const message = { action: "setUIScale", argument: scale };
    window.parent.postMessage(message, '*');
  },
  setReduceMotion: (bool) => {
    setReduceMotion(bool)
    const message = { action: "setReduceMotion", argument: bool };
    window.parent.postMessage(message, '*');
  },
  setHighContrast: (bool) => {
    setHighContrast(bool)
    const message = { action: "setHighContrast", argument: bool };
    window.parent.postMessage(message, '*');
  },
  reloadApp: () => {
    const message = { action: "reloadApp" };
    window.parent.postMessage(message, '*');
  },
}

// Export necessary functions and objects for external use
export {
  appViewEvents, grooveColors, grooveThemes, setAccentColor, setTheme, applyOverscroll
};
if (window.parent["animationDurationScale"]) setAnimationDurationScale(window.parent["animationDurationScale"])