import { grooveColors, grooveThemes } from "../GrooveProperties";
import "../flowTouch.js";
import applyOverscroll from "../overscrollFramework.js";
import fontStore from "../fontStore.js";
import GrooveMock from "./../GrooveMock.js";

const GrooveMockInstance = !window.Groove
if (GrooveMockInstance) {
  window.Groove = new GrooveMock("./../../mock/apps.json")
}


const setAccentColor = (color) => {
  if (Object.values(grooveColors).includes(color)) {
  } else {
    console.error("Custom color detected!", color);
  }
  document.body.style.setProperty("--accent-color", color);

};
const setTheme = (theme) => {
  if (Object.values(grooveThemes).includes(theme)) {
    document.body.classList[theme ? "add" : "remove"]("light-mode");
    document.body.classList.add("showBackground")
  } else {
    console.error("Invalid theme!");
  }
};
const setFont = (font) => {
  font = Number(font)
  font = font < 0 ? 0 : font > 2 ? 2 : font
  document.body.classList.remove("font-1")
  document.body.classList.remove("font-2")
  var resultFont = 0
  console.log("font set ", font)
  switch (font) {
    case 0:
      resultFont = 0
      break;
    case 1:
      resultFont = 1
      document.body.classList.add("font-1")
      break;
    case 2:
      if (fontStore.hasFont()) {
        fontStore.loadFont()
        resultFont = 2
        document.body.classList.add("font-2")

      }
      break;
  }
}
function setReduceMotion(bool) {
  bool = !!bool
  if (bool) document.body.classList.add("reduced-motion"); else document.body.classList.remove("reduced-motion")
}
window.setAccentColor = setAccentColor;
window.setTheme = setTheme;
window.setFont = setFont;
window.setReduceMotion = setReduceMotion;

window.addEventListener("message", (event) => {
  if (event.data["action"]) {
    if (event.data.action == "setTheme") {
      setTheme(event.data.argument);
    } if (event.data.action == "setFont") {
      setFont(event.data.argument);
    } else if (event.data.action == "setAccentColor") {
      setAccentColor(event.data.argument);
    } else if (event.data.action == "softExit") {
      if (event.data.argument) {
        document.body.classList.add("soft-exit-home")
      } else {
        document.body.classList.add("soft-exit")
      }

    }
  }
});

const urlParams = new URLSearchParams(window.location.search);
setAccentColor(localStorage["accentColor"] || grooveColors.violet);
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
  setReduceMotion: (bool) => {
    setReduceMotion(bool)
    const message = { action: "setReduceMotion", argument: bool };
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