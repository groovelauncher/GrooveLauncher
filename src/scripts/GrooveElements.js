import GrooveBoard from "./GrooveBoard";
import * as colorContrastDetector from "./colorContrastDetector"
window.colorContrastDetector = colorContrastDetector
const GrooveElements = {
  wHomeTile,
  wAppTile,
  wLetterTile,
  wAppMenu,
  wContextMenu,
  wTileMenu,
  wAppView,
  wAlertView,
  wListView,
  wListViewItem,
  wAppBar,
  wAppBarItem
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
  if (iconbg) {
    homeTile.querySelector(".groove-home-inner-tile").style.backgroundImage = `url('${iconbg}')`;
    if (iconbg.includes("data:image/svg+xml")) homeTile.querySelector(".groove-home-inner-tile").classList.add("svg-background");

  }

  requestAnimationFrame(() => {
    const appPreference = GrooveBoard.backendMethods.getAppPreferences(packageName)
    var colorContrastDetectorOutput
    colorContrastDetector.getAverageColor(iconbg).then((color) => {
      if (appPreference.textColor == "auto") {
        homeTile.querySelector("p.groove-home-tile-title").style.color = colorContrastDetector.getTextColor(color);

      }
      const isPlainWhite = color.r >= 250 && color.g >= 250 && color.b >= 250 && color.a >= 250
      if (isPlainWhite) {
        homeTile.querySelector("div.groove-home-inner-tile").style.boxShadow = `0px 0px 0px 1px rgba(170,170,170, 0.3)`
      }
    });
    if (appPreference.textColor != "auto") {
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
function _contextMenu(entries = {}) {
  function contextMenuClose() {

  }
  const contextMenu = document.createElement("div");
  contextMenu.classList.add("groove-element");
  contextMenu.classList.add("groove-context-menu");
  Object.entries(entries).forEach((entry) => {
    const contextMenuEntry = document.createElement("div");
    contextMenuEntry.classList.add("groove-element");
    contextMenuEntry.classList.add("groove-context-menu-entry");
    contextMenuEntry.addEventListener("flowClick", function (e) {
      contextMenuClose();
      if (entry[1] && typeof entry[1] == "function") entry[1]();
    });
    contextMenuEntry.innerText = entry[0];
    contextMenu.appendChild(contextMenuEntry);
  });
  return contextMenu;
}
function wAppMenu(packageName, entries = {}) {
  const appMenu = _contextMenu(entries);
  appMenu.classList.add("groove-element");
  appMenu.classList.add("groove-app-menu");
  appMenu.classList.add("grid-stack-item");
  appMenu.querySelectorAll("div.groove-context-menu-entry").forEach((entry) => { entry.classList.add("groove-app-menu-entry"); entry.addEventListener("flowClick", function () { appMenuClose(); }); });
  appMenu.setAttribute("packageName", packageName);

  return appMenu;
}

function wContextMenu(el, entries = {}) {
  const appMenu = _contextMenu(entries);
  appMenu.classList.add("groove-element");
  appMenu.classList.add("groove-app-menu");
  appMenu.classList.add("grid-stack-item");
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
function wAppView(packageName, args) {
  const appView = document.createElement("iframe");
  appView.classList.add("groove-element");
  appView.classList.add("groove-app-view");
  appView.setAttribute("packageName", packageName);
  appView.src = "./apps/" + packageName + "/index.html" + `?theme=${document.body.classList.contains("light-mode") ? "light" : "dark"}&accentColor=${getComputedStyle(document.body).getPropertyValue("--accent-color").slice(1)}&tileColumns=${tileListGrid.getColumn()}` + (args ? `&launchArgs="${args}"` : "")
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
function wAppBar(elements = []) {
  console.log("elements", elements)
  const appBar = document.createElement("div");
  appBar.classList.add("groove-element");
  appBar.classList.add("groove-app-bar");
  appBar.classList.add("hidden");
  appBar.state = 0
  appBar.innerHTML = `
    <div class="groove-app-bar-toggle">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 5">
        <ellipse cx="2.5" cy="2.5" rx="2.5" ry="2.5"></ellipse>
        <ellipse cx="12.5" cy="2.5" rx="2.5" ry="2.5"></ellipse>
        <ellipse cx="22.5" cy="2.5" rx="2.5" ry="2.5"></ellipse>
      </svg>
    </div>
    <div class="groove-app-bar-top"></div>
    <div class="groove-app-bar-bottom"></div>`
  appBar.append = (item) => {
    appBar.querySelector(item.type == "text" ? ".groove-app-bar-bottom" : ".groove-app-bar-top").append(item)
  }
  appBar.querySelector(".groove-app-bar-toggle").addEventListener("flowClick", () => {
    appBar.setState(appBar.state == 1 ? 2 : 1)
  })
  try {
    elements.forEach(e => {
      console.log("e", e)
      var item
      if (e["size"]) {
        console.log("karar", 0)
        item = wAppBarItem(e.title, e.icon, e["size"], e["action"])
      } else if (e["action"]) {
        console.log("karar", 1)
        item = wAppBarItem(e.title, e.icon, e["action"])
      } else {
        console.log("karar", 2)
        item = wAppBarItem(e.title, e.icon)
      }
      appBar.append(item)
    })
  } catch (error) {
    console.error("Corrupted app bar data")
    throw error
  }
  appBar.setState = (state) => {
    if (appBar.state == 0 && state != 0) {
      appBar.classList.add("jump-up")
      setTimeout(() => {
        appBar.classList.remove("jump-up")
      }, 500);
    }
    appBar.state = state == 0 ? 0 : state == 1 ? 1 : 2
    appBar.classList.remove("shown", "hidden", "expanded")
    appBar.classList.add(state == 0 ? "hidden" : state == 1 ? "shown" : "expanded")
  }
  return appBar
}
function wAppBarItem(title, icon, sizeaction, action) {
  const appBarItem = document.createElement("div");
  appBarItem.classList.add("groove-element");
  appBarItem.classList.add("groove-app-bar-item");
  const type = icon ? (icon.length <= 3 ? "glyph-icon" : "image-icon") : "text"
  appBarItem.type = type
  var nAction;
  var nSize = "23px"
  if (sizeaction) {
    if (typeof sizeaction == "function") {
      nAction = sizeaction
    } else {
      nSize = sizeaction
      if (action) if (typeof action == "function") nAction = action
    }
  }
  appBarItem.classList.add(`groove-app-bar-item-${type}`)
  appBarItem.innerHTML = `${type == "glyph-icon" ? `<div class="groove-app-bar-icon-frame"><p class="groove-app-bar-item-icon" style="font-size:${nSize};">${icon}</p></div>` : type == "image-icon" ? `<div class="groove-app-bar-icon-frame"><img class="groove-app-bar-item-icon" src="${icon}" style="width:${nSize};height:${nSize};"></div>` : ""}
    <p class="groove-app-bar-item-title"></p>`
  appBarItem.querySelector("p.groove-app-bar-item-title").innerText = title
  appBarItem.title = title
  appBarItem.icon = icon
  appBarItem.action = nAction
  appBarItem.addEventListener("flowClick", () => {
    if (nAction) nAction()
  })
  return appBarItem;
}
export default GrooveElements;
