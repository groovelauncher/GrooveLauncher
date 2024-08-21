import { grooveColors, grooveThemes } from "../GrooveProperties";
import clickDetectorConfig from "../clickDetector.js";
import applyOverscroll from "../overscrollFramework.js";

import GrooveMock from "./../GrooveMock.js";

const GrooveMockInstance = !window.Groove
if (GrooveMockInstance) {
  window.Groove = new GrooveMock("./../../mock/apps.json")
}


const setAccentColor = (color) => {
  if (Object.values(grooveColors).includes(color)) {
    document.body.style.setProperty("--accent-color", color);
  } else {
    console.error("Invalid color!", color);
  }
};
const setTheme = (theme) => {
  if (Object.values(grooveThemes).includes(theme)) {
    document.body.classList[theme ? "add" : "remove"]("light-mode");
    document.body.classList.add("showBackground")
  } else {
    console.error("Invalid theme!");
  }
};
window.setAccentColor = setAccentColor;
window.setTheme = setTheme;

window.addEventListener("message", (event) => {
  if (event.data["action"]) {
    if (event.data.action == "setTheme") {
      setTheme(event.data.argument);
    } else if (event.data.action == "setAccentColor") {
      setAccentColor(event.data.argument);
    } else if (event.data.action == "softExit") {
      if(event.data.argument){
        document.body.classList.add("soft-exit-home")
      }else{
        document.body.classList.add("soft-exit")
      }
    
    }
  }
});

const urlParams = new URLSearchParams(window.location.search);
setAccentColor(localStorage["accentColor"] || grooveColors.cobalt);
setTheme(Number(localStorage["theme"]) || grooveThemes.dark);

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
  reloadApp: () => {
    const message = { action: "reloadApp" };
    window.parent.postMessage(message, '*');
  },
}

export {
  appViewEvents, grooveColors, grooveThemes, setAccentColor, setTheme, applyOverscroll
};