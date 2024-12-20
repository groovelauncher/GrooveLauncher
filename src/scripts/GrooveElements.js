import GrooveBoard from "./GrooveBoard";
import * as colorContrastDetector from "./colorContrastDetector"
window.colorContrastDetector = colorContrastDetector
const GrooveElements = {
  wHomeTile: wHomeTile,
  wAppTile: wAppTile,
  wLetterTile: wLetterTile,
  wAppMenu: wAppMenu,
  wTileMenu: wTileMenu,
  wAppView: wAppView,
  wAlertView: wAlertView,
  wListView, wListView,
  wListViewItem: wListViewItem
};
function wHomeTile(
  // imageIcon = false,
  icon = "",
  iconbg = "none",
  title = "Unknown",
  packageName = "com.unknown",
  color = "default",
  supportedSizes
) {
  if (!supportedSizes) supportedSizes = ["s"];
  const homeTile = document.createElement("div");
  homeTile.classList.add("groove-element");
  homeTile.classList.add("groove-home-tile");
  //homeTile.setAttribute("imageIcon", imageIcon);
  homeTile.setAttribute("icon", icon);
  homeTile.setAttribute("icon-bg", iconbg);
  homeTile.setAttribute("title", title);
  homeTile.setAttribute("packageName", packageName);
  homeTile.setAttribute("color", color);
  homeTile.setAttribute("supportedsizes", supportedSizes.join(","));
  homeTile.style.backgroundColor = color;
  homeTile.innerHTML = `
    <div class="groove-element groove-home-inner-tile">
    ${//imageIcon ?
    `
            <img loading="lazy" class="groove-element groove-home-tile-imageicon" src="">
        `
    /*: `
          <p class="groove-element groove-home-tile-icon"></p>
      `*/
    }
        <p class="groove-element groove-home-tile-title"></>
    </div>
    `;
  //if (!imageIcon)
  //homeTile.querySelector("p.groove-home-tile-icon").innerText = icon;
  //else 
  homeTile.querySelector("img.groove-home-tile-imageicon").src = icon;
  homeTile.querySelector("p.groove-home-tile-title").innerText = title;
  if (iconbg) homeTile.querySelector(".groove-home-inner-tile").style.backgroundImage = `url('${iconbg}')`;
  requestAnimationFrame(() => {
    const appPreference = GrooveBoard.backendMethods.getAppPreferences(packageName)
    if (appPreference.textColor == "auto") {
      colorContrastDetector.getAverageColor(iconbg).then((color) => {
        homeTile.querySelector("p.groove-home-tile-title").style.color = colorContrastDetector.getTextColor(color);
      });
    } else {
      homeTile.querySelector("p.groove-home-tile-title").style.color = appPreference.textColor == "dark" ? "#000000" : "#FFFFFF";
    }

  })
  return homeTile;
}
function getImage(url) {
  return new Promise(function (resolve, reject) {
    var img = new Image()
    img.onload = function () {
      resolve(img)
    }
    img.onerror = function () {
      reject(url)
    }
    img.src = url
  })
}
function getTextColor(imagePath) {
  return new Promise((resolve) => {
    getImage(imagePath).then((img) => {
      const color = colorThief.getColor(img);
      //console.log("color", color);
      const [r, g, b] = color.map((val) => val / 255).map((val) => {
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
      });
      const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

      // Return luminance value
      //console.log("luminance", luminance)
      resolve(luminance > 0.5 ? '#000000' : '#FFFFFF');
    })
  });
}
function wAppTile(
  //imageIcon = false,
  icon = "",
  iconbg = "none",
  title = "Unknown",
  packageName = "com.unknown",
  letterTile = false
) {
  const appTile = document.createElement("div");
  appTile.innerHTML = `
    ${!letterTile ?
      `
            <div class="groove-element groove-app-tile-icon"><img loading="lazy" class="groove-element groove-app-tile-imageicon" src=""></div>
        `
      : `
          <p class="groove-element groove-app-tile-icon"></p>
      `
    }
        <p class="groove-element groove-app-tile-title"></>
    `;
  appTile.classList.add("groove-element");
  appTile.classList.add("groove-app-tile");
  //appTile.setAttribute("imageIcon", imageIcon);
  appTile.setAttribute("icon", icon);
  appTile.setAttribute("icon-bg", iconbg);
  appTile.setAttribute("title", title);
  appTile.setAttribute("packageName", packageName);
  appTile.querySelector("p.groove-app-tile-title").innerText = title;
  if (!letterTile) appTile.querySelector("img.groove-app-tile-imageicon").src = icon; else appTile.querySelector("p.groove-app-tile-icon").innerText = icon;
  if (iconbg && iconbg != "none") appTile.querySelector(".groove-app-tile-imageicon").style.background = "url('" + iconbg + "')";
  else appTile.querySelector("p.groove-app-tile-icon").innerText = icon;

  return appTile;
}
function wLetterTile(letter) {
  const el = wAppTile(letter, "", "", "", true);
  el.querySelector(".groove-app-tile-title").remove();
  el.classList.add("groove-letter-tile");
  el.removeAttribute("title");
  el.removeAttribute("packageName");
  return el;
}
function wAppMenu(packageName, entries = {}) {
  const appMenu = document.createElement("div");
  appMenu.classList.add("groove-element");
  appMenu.classList.add("groove-app-menu");
  appMenu.classList.add("grid-stack-item");

  appMenu.setAttribute("packageName", packageName);
  Object.entries(entries).forEach((entry) => {
    const appMenuEntry = document.createElement("div");
    appMenuEntry.classList.add("groove-element");
    appMenuEntry.classList.add("groove-app-menu-entry");
    appMenuEntry.addEventListener("flowClick", function (e) {
      appMenuClose();
      if (entry[1] && typeof entry[1] == "function") entry[1]();
    });
    appMenuEntry.innerText = entry[0];
    appMenu.appendChild(appMenuEntry);
  });
  return appMenu;
}
function wTileMenu(el) {
  const appSizeDictionary = { s: [1, 1], m: [2, 2], w: [4, 2], l: [4, 4] };
  var currentSize = () => {
    try {
      return Object.entries(appSizeDictionary).filter(
        (e) => e[1][0] == el.gridstackNode.w && e[1][1] == el.gridstackNode.h
      )[0][0];
    } catch {
      return "l";
    }
  };

  const supportedSizes = el.getAttribute("supportedsizes").split(",");
  const tileMenu = document.createElement("div");
  var previousSize = () => {
    if (currentSize() == 0) {
      return supportedSizes.slice(-1)[0];
    } else if (supportedSizes[supportedSizes.indexOf(currentSize()) - 1]) {
      return supportedSizes[supportedSizes.indexOf(currentSize()) - 1];
    } else {
      return supportedSizes.slice(-1)[0];
    }
  };
  tileMenu.classList.add("groove-element");
  tileMenu.classList.add("groove-tile-menu");
  tileMenu.setAttribute("packageName", el.getAttribute("packageName"));
  tileMenu.innerHTML = `
   <div class="groove-tile-menu-button groove-tile-menu-unpin-button"><p>󰐃</p></div>
   <div class="groove-tile-menu-button groove-tile-menu-resize-button"><p>󰁍</p></div>
   `;
  tileMenu
    .querySelector("div.groove-tile-menu-unpin-button")
    .addEventListener("flowClick", (e) => {
      el.classList.add("delete-anim");
      setTimeout(() => {
        tileListGrid.removeWidget(el);
        GrooveBoard.backendMethods.homeConfiguration.save()
        if (
          document
            .querySelector("div.tile-list-inner-container")
            .getAttribute("gs-current-row") == "0"
        ) {
          homeTileEditSwitch.off();
        }
      }, 200);
    });
  tileMenu
    .querySelector("div.groove-tile-menu-resize-button")
    .addEventListener("flowClick", (e) => {
      GrooveBoard.backendMethods.resizeTile(el, previousSize(), true);
      updateButton();
    });
  function updateButton() {
    tileMenu
      .querySelector("div.groove-tile-menu-resize-button > p")
      .style.setProperty(
        "transform",
        `rotate(${currentSize() == "l"
          ? 90
          : currentSize() == "w"
            ? 0
            : currentSize() == "m"
              ? 45
              : 225
        }deg)`
      );
  }
  updateButton();

  return tileMenu;
}
function wAppView(packageName) {
  const appView = document.createElement("iframe");
  appView.classList.add("groove-element");
  appView.classList.add("groove-app-view");
  appView.setAttribute("packageName", packageName);
  appView.src = "./apps/" + packageName + "/index.html" + `?theme=${document.body.classList.contains("light-mode") ? "light" : "dark"}&accentColor=${getComputedStyle(document.body).getPropertyValue("--accent-color").slice(1)}&tileColumns=${tileListGrid.getColumn()}`
  return appView;
}
function wAlertView(title, body, actions, unsafe = false) {
  const alertView = document.createElement("div")
  alertView.classList.add("groove-element");
  alertView.classList.add("groove-alert-view");
  alertView.append(`<div class="groove-element groove-alert-foreground">
      <h1 class="groove-alert-title"></h1>
      <${unsafe ? "div" : "p"} class="groove-alert-body"></${unsafe ? "div" : "p"}>
      <div class="groove-alert-actions"></div>
    </div>
    <div class="groove-element groove-alert-background"></div>`)
  alertView.querySelector(".groove-alert-title").innerText = title
  alertView.querySelector(".groove-alert-body")[unsafe ? "innerHTML" : "innerText"] = body
  Object.entries(actions).forEach(entry => {
    const button = document.createElement("button")
    button.classList.add("groove-element");
    button.classList.add("groove-alert-action");
    button.innerText = entry[0]
    button.addEventListener("flowClick", entry[0])
    alertView.querySelector(".groove-alert-actions").append(button)
  })
  alertView.querySelector(".groove-alert-actions")
  return alertView
}
function wListView(elements = []) {
  /*
<div class="list-view-item">
              <p class="list-view-item-title">home+theme</p>
              <p class="list-view-item-description">color</p>
            </div>*/
  const listView = document.createElement("div");
  listView.classList.add("groove-element");
  listView.classList.add("groove-list-view");
  try {
    elements.forEach(e => {
      const item = wListViewItem(e.title, e.description)
      listView.append(item)
    })
  } catch (error) {
    console.error("Corrupted list view data")
  }
  return listView
}
function wListViewItem(title, description) {
  const listViewItem = document.createElement("div");
  listViewItem.classList.add("groove-element");
  listViewItem.classList.add("groove-list-view-item");
  listViewItem.innerHTML = `<p class="groove-list-view-item-title"></p>
              <p class="groove-list-view-item-description"></p>`
  listViewItem.querySelector("p.groove-list-view-item-title").innerText = title
  listViewItem.querySelector("p.groove-list-view-item-description").innerText = description
  if (description == undefined || description == "") {
    listViewItem.classList.add("single-line")
  }
  return listViewItem;
}
export default GrooveElements;
