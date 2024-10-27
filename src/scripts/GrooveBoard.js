import { normalizeSync } from 'normalize-diacritics';
window.normalizeDiacritics = (input = "") => {
  return normalizeSync(input)
}

import {
  grooveColors,
  grooveTileColumns,
  grooveThemes,
} from "./GrooveProperties";
import appViewEvents from "./appViewEvents"
import canvasImageFit, { contain } from "./canvasImageFit";
import imageStore from "./imageStore";
import fontStore from "./fontStore";
window.grooveTileColumns = grooveTileColumns;
window.grooveColors = grooveColors;
window.grooveThemes = grooveThemes;
const tileListInnerContainer = document.querySelector(
  "div.tile-list-inner-container"
);
import jQuery from "jquery";
var $ = jQuery
function hexToRgb(hex) {
  // Remove the hash at the start if it's there
  hex = hex.replace(/^#/, '');

  // Parse the hex string
  let r = parseInt(hex.slice(0, 2), 16);
  let g = parseInt(hex.slice(2, 4), 16);
  let b = parseInt(hex.slice(4, 6), 16);

  // Return the RGB string
  return `rgb(${r}, ${g}, ${b})`;
}
import GrooveElements from "./GrooveElements";

function alert(title = "Alert!", message = "Message", actions = [{ title: "" }]) {
  var items = ""
  actions.forEach(element => {
    if (!element["style"]) element.style = "cancel"
    items += `<button class="groove-element groove-element-alert-action${element["style"] == "default" ? " default" : element["style"] == "destructive" ? " destructive" : ""}">
        ${element.title}
      </button>`

  });
  $("body").append(`
    <div class="groove-element groove-element-alert">
      <p class="groove-element-alert-title">${title}</p>
      <p class="groove-element-alert-body">${message}</p>
      ${items}
  </div>`)
  if ($("div.groove-element-alert-layer:not(.taken)").length == 0) {
    $("body").append(`
    <div class="groove-element groove-element-alert-layer">
     
  </div>`)
  }
  var alertmenu = $("div.groove-element.groove-element-alert").last()
  if (actions.length <= 2) alertmenu.addClass("inline")
  actions.forEach((element, index) => {
    if (element["action"]) {
      if (typeof element["action"] == "function") {
        alertmenu.children("button.groove-element-alert-action").eq(index).on("click", function () {
          setTimeout(() => {
            actions[index].action()
          }, 200);
        })
      }
    }
  });
  function closeW(params) {
    if ($("div.groove-element.groove-element-alert").length == 1) {
      var layer = $("div.groove-element-alert-layer").addClass("taken")
      layer.addClass("exit")
      setTimeout(() => {
        layer.remove()
      }, 200);
    }
    alertmenu.addClass("exit")
    setTimeout(() => {
      alertmenu.remove()
    }, 200);
  }
  alertmenu.click(function (e) {
    if (e.target == this) closeW()
  })
  alertmenu.children("button").click(closeW)
  return alertmenu[0]
}
const boardMethods = {
  finishLoading: () => {
    $(window).trigger("finishedLoading");
    const loader = document.getElementById("loader");
    loader.classList.add("finished");
    setTimeout(() => {
      loader.remove();
      appTransition.onResume(false, true);
    }, 500);
  },
  createHomeTile: (size = [1, 1], options = {}, append = false) => {
    options = Object.assign(
      {
        imageIcon: false,
        icon: "",
        iconbg: "none",
        title: "Unknown",
        packageName: "com.unknown",
        supportedSizes: ["s", "m"],
      },
      options
    );
    setTimeout(() => {
      scrollers.tile_page_scroller.refresh();
    }, 0);

    var config = {
      w: size[0],
      h: size[1],
    };

    const widget = window.tileListGrid.addWidget(
      GrooveElements.wHomeTile(
        options.icon,
        options.iconbg,
        options.title,
        options.packageName,
        "",
        options.supportedSizes
      ),
      config
    );
    if (window.scrollers) window.scrollers.tile_page_scroller.refresh();
    return widget;

    options = Object.assign(
      {
        imageIcon: false,
        icon: "",
        title: "Unknown",
        packageName: "com.unknown",
        color: "default",
      },
      options
    );
    switch (String(size)) {
      case "1,1":
        break;
      case "2,1":
        el.classList.add("");
        break;
      case "2,2":
        break;

      default:
        break;
    }
    const el = GrooveElements.wHomeTile(
      options.imageIcon,
      options.icon,
      options.title,
      options.packageName,
      options.color
    );
    document
      .querySelector("div.tile-list-page div.tile-list-inner-container")
      .appendChild(el);
    return el;
  },
  createAppTile: (options) => {
    options = Object.assign(
      {
        imageIcon: false,
        icon: "",
        iconbg: "none",
        title: "Unknown",
        packageName: "com.unknown",
      },
      options
    );
    const el = GrooveElements.wAppTile(
      options.icon,
      options.iconbg,
      options.title,
      options.packageName
    );
    document
      .querySelector(
        "#main-home-slider > div > div:nth-child(2) > div > div.app-list > div.app-list-container"
      )
      .appendChild(el);
    return el;
  },
  createLetterTile: (letter) => {
    const el = GrooveElements.wLetterTile(letter);
    document
      .querySelector(
        "#main-home-slider > div > div:nth-child(2) > div > div.app-list > div.app-list-container"
      )
      .appendChild(el);
    return el;
  },
  createAppMenu: (packageName) => {
    const el = GrooveElements.wAppMenu(packageName, {
      "pin to home": () => {
        const findTile = $(
          `div.inner-page.app-list-page > div.app-list > div.app-list-container > div.groove-element.groove-app-tile[packagename="${packageName}"]`
        )[0];
        const iconpack = findTile.classList.contains("iconpack0")
          ? 0
          : findTile.classList.contains("iconpack1")
            ? 1
            : 2;
        const el = GrooveBoard.boardMethods.createHomeTile(
          [2, 2],
          {
            packageName: findTile.getAttribute("packagename"),
            title: findTile.getAttribute("title"),
            icon: findTile.getAttribute("icon"),
            iconbg: findTile.getAttribute("icon-bg"),
            imageIcon: findTile.getAttribute("imageicon") == "true",
            //  supportedSizes: ["s", "m", "w", "l"]
            supportedSizes: ["s", "m", "w"],
          },
          true
        );

        el.classList.add("iconpack" + iconpack);
        scrollers.tile_page_scroller.refresh();
        setTimeout(() => {
          scrollers.main_home_scroller.scrollTo(0, 0, 500);
          setTimeout(() => {
            scrollers.tile_page_scroller.scrollTo(
              0,
              -el.offsetTop - el.offsetHeight / 2 + window.innerHeight / 2,
              500
            );
          }, 300);
        }, 300);

        backendMethods.homeConfiguration.save()
      },
      uninstall: () => {
        if (GrooveBoard.backendMethods.packageManagerProvider.get() == 0) {
          Groove.uninstallApp(packageName, 0);
        } else {
          parent.GrooveBoard.alert(
            "Uninstall this app?",
            "This app, plus any information it contains, will be deleted from your device.",
            [{
              title: "Yes", style: "default", inline: true, action: () => {
                Groove.uninstallApp(packageName, GrooveBoard.backendMethods.packageManagerProvider.get());
              }
            }, { title: "No", style: "default", inline: true, action: () => { } }]
          );
        }




      },
    });
    document.querySelector("div.app-list-page").appendChild(el);
    if (document.querySelectorAll(`div.groove-home-tile[packagename="${packageName}"]`).length > 0) {
      el.querySelector("div:nth-child(1)").classList.add("disabled")
    }
    if (allappsarchive.filter(e => e.packageName == packageName)[0].type == 0) {
      el.querySelector("div:nth-child(2)").remove()
      el.style.setProperty("--full-height", "89px")
    }
    return el;
  },
  createTileMenu: (el) => {
    document.querySelectorAll(".groove-tile-menu").forEach((i) => i.remove());
    const tileMenu = GrooveElements.wTileMenu(el);
    el.appendChild(tileMenu);
    return el;
  },
  createAppView: (packageName) => {
    const appView = GrooveElements.wAppView(packageName);
    document.body.appendChild(appView);
    return appView;
  },
};
window.appSortCategories = {};
function getLabelRank(char) {
  if (/^\d+$/.test(char)) {
    return 1; // Numbers
  } else if (/^[A-Za-z]+$/.test(char)) {
    return 2; // Letters (both uppercase and lowercase)
  } else {
    return 3; // Special characters
  }
}
function getLabelSortCategory(label) {
  const firstletter = String(label)[0];
  const labelRank = getLabelRank(
    window.normalizeDiacritics(String(label)[0]).toLocaleLowerCase("en")
  );
  if (labelRank == 1) {
    return "0-9";
  }
  if (labelRank == 2) {
    return window
      .normalizeDiacritics(firstletter)
      .toLocaleLowerCase("en")
      .toLocaleUpperCase("en");
  } else {
    return "&";
  }
}
function sortObjectsByLabel(a, b) {
  let labelA = window
    .normalizeDiacritics(String(a.label))
    .toLocaleLowerCase("en");
  let labelB = window
    .normalizeDiacritics(String(b.label))
    .toLocaleLowerCase("en");
  // Get the ranks for the first characters in the labels
  let rankA = getLabelRank(labelA[0]);
  let rankB = getLabelRank(labelB[0]);
  if (rankA === rankB) {
    // If ranks are the same, sort by label case-insensitively
    return labelA.localeCompare(labelB, "en", { sensitivity: "base" });
  } else {
    // Otherwise, sort by rank
    return rankA - rankB;
  }
}
const originalWidgetSizes = [98.5, 209, 319.543];
function sortObjectsByKey(a, b) {
  let labelA = window.normalizeDiacritics(String(a[0])).toLocaleLowerCase("en");
  let labelB = window.normalizeDiacritics(String(b[0])).toLocaleLowerCase("en");
  // Get the ranks for the first characters in the labels
  let rankA = getLabelRank(labelA[0]);
  let rankB = getLabelRank(labelB[0]);
  if (rankA === rankB) {
    // If ranks are the same, sort by label case-insensitively
    return labelA.localeCompare(labelB, "en", { sensitivity: "base" });
  } else {
    // Otherwise, sort by rank
    return rankA - rankB;
  }
}
// Output: [{ label: "1" }, { label: "2" }, { label: "A" }, { label: "a" }, { label: "B" }, { label: "c" }, { label: "#" }, { label: "@" }]
const backendMethods = {
  reset: async () => {
    try {
      const databases = await indexedDB.databases();
      for (const db of databases) {
        await indexedDB.deleteDatabase(db.name);
        console.log(`Deleted database: ${db.name}`);
      }
    } catch (error) {
      console.error('Error accessing databases: ', error);
    }
    localStorage.clear()
  },
  reloadApps: function (callback) {
    document.querySelector("#main-home-slider > div > div:nth-child(2) > div > div.app-list > div.app-list-container").querySelectorAll(".groove-letter-tile, .groove-app-tile").forEach(e => e.remove())
    //appSortCategories = {}
    Object.keys(appSortCategories).forEach(key => {
      delete appSortCategories[key];
    })
    var apps = backendMethods.reloadAppDatabase()
    apps.forEach((entry) => {
      const labelSortCategory = getLabelSortCategory(entry.label);
      if (!!!appSortCategories[labelSortCategory])
        appSortCategories[labelSortCategory] = [];
      appSortCategories[labelSortCategory].push(entry);
    });
    appSortCategories = Object.fromEntries(
      Object.entries(appSortCategories).sort(sortObjectsByKey)
    );
    Object.keys(appSortCategories).forEach((labelSortCategory) => {
      let letter = boardMethods.createLetterTile(
        labelSortCategory == "0-9"
          ? "#"
          : labelSortCategory == "&"
            ? ""
            : labelSortCategory.toLocaleLowerCase("en")
      );
      appSortCategories[labelSortCategory].forEach((app) => {
        const ipe = window.iconPackDB[app.packageName];
        const iconurl = JSON.parse(Groove.getAppIconURL(app.packageName))
        const appdetail = backendMethods.getAppDetails(app.packageName)
        // console.log("bavk",appdetail.icon.background)

        const el = boardMethods.createAppTile({
          title: appdetail.label,
          packageName: app.packageName,
          imageIcon: true,
          icon: appdetail.icon.foreground,
          iconbg: appdetail.icon.background,
        });
        /* if (ipe) if (ipe["accent"]) {
           el.querySelector("img.groove-app-tile-imageicon").style.backgroundColor = `var(--metro-color-${ipe.accent})`
         }
         console.log("ipe", ipe)
         console.log("el", el)*/

      });
    });
    scrollers.app_page_scroller.refresh();
  },
  getAppDetails: (packageName) => {
    if (!window["allappsarchive"]) backendMethods.reloadAppDatabase(); else if (window["allappsarchive"].length == 0) backendMethods.reloadAppDatabase();
    const search = window["allappsarchive"].filter(e => e.packageName == packageName)[0]
    const icon = JSON.parse(Groove.getAppIconURL(packageName))
    var returnee = { packageName: "com.unknown." + Math.random().toFixed(4) * 10000, label: "Unknown", type: 0, icon: icon }
    if (search) returnee = Object.assign(returnee, search)
    if (Object.keys(iconPackDB).includes(packageName)) {
      //          icon: ipe ? (new URL("./assets/defaulticonpack/" + ipe.icon + ".svg", window.location.href.toString()).toString()) : iconurl.foreground,
      const idb = iconPackDB[packageName]
      returnee.icon.foreground = new URL("./assets/defaulticonpack/" + idb.icon + ".svg", window.location.href.toString())
      returnee.icon.background = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>`
      if (idb["accent"]) {
        var color = "transparent"
        if (grooveColors[idb.accent]) color = grooveColors[idb.accent]; else color = idb.accent;
        if (color.startsWith("#")) try {
          color = hexToRgb(color)
        } catch (error) {

        };
        returnee.icon.background = `data:image/svg+xml,<svg viewBox="0 0 62 62" xmlns="http://www.w3.org/2000/svg">  <rect width="62" height="62" style="fill: ${color};"></rect></svg>`//`data:image/svg+xml,<svg viewBox="0 0 1 1" xmlns="http://www.w3.org/2000/svg"><rect width="1" height="1" style="fill: red;"></rect></svg>`
        //el.querySelector("img.groove-app-tile-imageicon").style.backgroundColor = `var(--metro-color-${idb.accent})`
        //<svg viewBox="0 0 1 1" xmlns="http://www.w3.org/2000/svg"><rect width="1" height="1" style="fill: rgb(255, 0, 0);"></rect></svg>
      }
    }
    return returnee;
  },
  reloadAppDatabase: () => {
    var apps = JSON.parse(Groove.retrieveApps());
    apps.sort(sortObjectsByLabel);
    window["allappsarchive"] = apps;
    return apps
  },
  refreshInsets: () => {
    if (window.stopInsetUpdate) return;
    window.windowInsetsRaw = JSON.parse(Groove.getSystemInsets());
    const uiScale = Number(
      getComputedStyle(document.body).getPropertyValue("--ui-scale")
    );
    window.windowInsets = () => {
      return {
        left: window.windowInsetsRaw.left / uiScale,
        right: window.windowInsetsRaw.right / uiScale,
        top: window.windowInsetsRaw.top / uiScale,
        bottom: window.windowInsetsRaw.bottom / uiScale,
      };
    };

    Object.keys(windowInsetsRaw).forEach((element) => {
      document.body.style.setProperty(
        "--window-raw-inset-" + element,
        windowInsetsRaw[element] + "px"
      );
    });
  },
  navigation: {
    history: [],
    push: (change, forwardAction, backAction) => {
      GrooveBoard.backendMethods.navigation.invalidate(change);
      //console.log("HISTORY PUSH", change);
      forwardAction();
      backendMethods.navigation.history.push({
        forwardAction: forwardAction,
        change: change,
        backAction,
      });
      history.pushState(change, "", window.location.href); // Explicitly using the current URL
      listHistory();
    },
    back: (action = true, homeBack = false) => {
      if (backendMethods.navigation.history.length <= 1) return;
      if (action == false)
        backendMethods.navigation.lastPush.backAction = () => { };
      const act = backendMethods.navigation.history.pop();
      //console.log("HISTORY BACK", act.change);
      act.backAction(homeBack);
      listHistory();
    },
    home: () => {
      const actions = backendMethods.navigation.history.slice(1).reverse()
      let count = actions.length - 1;

      const countdown = setInterval(() => {
        backendMethods.navigation.back(true, true)
        count--;
        if (count < 0) {
          clearInterval(countdown);
        }
      }, 100);
      scrollers.tile_page_scroller.scrollTo(0, 0, 500)
    },
    get lastPush() {
      if (GrooveBoard.backendMethods.navigation.history.length == 0)
        return undefined;
      return GrooveBoard.backendMethods.navigation.history.slice(-1)[0];
    },
    invalidate: (change) => {
      if (GrooveBoard.backendMethods.navigation.history.length == 0)
        return undefined;
      //console.log("HISTORY INVA", change);
      if (GrooveBoard.backendMethods.navigation.lastPush.change == change) {
        GrooveBoard.backendMethods.navigation.back(false);
      }
      listHistory();
    },
  },
  getTileSize: function (w, h) {
    const padding = 12;
    const column = document
      .querySelector("div.tile-list-inner-container")
      .classList.contains("gs-4")
      ? 4
      : document
        .querySelector("div.tile-list-inner-container")
        .classList.contains("gs-6")
        ? 6
        : 8;
    const base =
      document.querySelector("div.tile-list-inner-container").clientWidth /
      column -
      padding;
    return [w * base + (w - 1) * padding, h * base + (h - 1) * padding];
  },
  scaleTiles: function () {
    const scale =
      GrooveBoard.backendMethods.getTileSize(1, 1)[0] / originalWidgetSizes[0];
    document
      .querySelector("div.tile-list-inner-container")
      .style.setProperty("--tile-zoom", scale);
  },
  resizeTile: function (el, size, animate) {
    const appSizeDictionary = { s: [1, 1], m: [2, 2], w: [4, 2], l: [4, 4] };
    const supportedSizes = el.getAttribute("supportedsizes").split(",");
    if (!appSizeDictionary[size] || !el["gridstackNode"]) return;
    const chosenSize = appSizeDictionary[size];
    if (size == "s") {
      el.removeAttribute("gs-w");
      el.removeAttribute("gs-h");
    } else {
      el.setAttribute("gs-w", chosenSize[0]);
      el.setAttribute("gs-h", chosenSize[1]);
    }
    const fitRightBorder = Math.min(
      0,
      tileListGrid.getColumn() - (chosenSize[0] + el.gridstackNode.x)
    );
    //tileListGrid.update(el.gridstackNode, { w: chosenSize[0], h: chosenSize[1] })
    tileListGrid.moveNode(el.gridstackNode, {
      x: el.gridstackNode.x + fitRightBorder,
    });
    tileListGrid.moveNode(el.gridstackNode, {
      w: chosenSize[0],
      h: chosenSize[1],
    });
    const animClassName =
      "tile-size-change-anim-" +
      size +
      (supportedSizes.slice(-1)[0] == size ? "-2" : "");
    el.classList.add(animClassName);
    setTimeout(() => {
      el.classList.remove(animClassName);
    }, 250);
    backendMethods.homeConfiguration.save()
  },
  launchInternalApp: (packageName) => {
    if (!window.launchedInternalApps) window.launchedInternalApps = new Set();
    if (window.launchedInternalApps.has(packageName)) { console.log("App is already open!"); return; }
    else {
      $.ajax({
        url: './apps/' + packageName + '/index.html',
        type: 'HEAD',
        error: function () {
          console.log("This app doesn't exist!")
        },
        success: function () {
          backendMethods.navigation.push(
            "appOpened/" + packageName,
            () => { },
            (homeBack = false) => {
              backendMethods.closeInternalApp(packageName, homeBack)
            }
          );

          const appView = boardMethods.createAppView(packageName)
          window.launchedInternalApps.add(packageName);
          clearTimeout(window.appTransitionLaunchError)
          //console.log("Launch internal app:", packageName);
        }
      });

    }
  },
  destroyInternalApp: (packageName, homeBack = false) => {
    if (!window.launchedInternalApps) window.launchedInternalApps = new Set();
    if (window.launchedInternalApps.has(packageName)) {
      document.querySelectorAll(`iframe.groove-element.groove-app-view[packageName="${packageName}"]`).forEach(e => e.remove())
      appTransition.onResume(!homeBack)
      window.launchedInternalApps.delete(packageName)
    } else {
      console.log("App is not open!")
      return;
    }

  },
  closeInternalApp: (packageName, homeBack = false) => {
    //Alert app
    try {
      appViewEvents.softExit(document.querySelector(`iframe.groove-element.groove-app-view[packageName="${packageName}"]`), homeBack)
      setTimeout(() => {
        backendMethods.destroyInternalApp(packageName, homeBack)
      }, 150);
    } catch (error) {
      console.log("Soft exit failed! Destroying process")
      backendMethods.destroyInternalApp(packageName, homeBack)
    }
  },
  setAccentColor: (color, doNotSave = false) => {
    if (Object.values(grooveColors).includes(color)) {

    } else {
      console.error("Custom color detected!");
    }
    document.body.style.setProperty("--accent-color", color);
    document.querySelectorAll("iframe.groove-app-view").forEach(e => appViewEvents.setAccentColor(e, color))
    if (!doNotSave) localStorage.setItem("accentColor", color)
  },
  setTheme: (theme, doNotSave = false) => {
    if (Object.values(grooveThemes).includes(theme)) {
      document.body.classList[theme ? "add" : "remove"]("light-mode");
      Groove.setNavigationBarAppearance(theme ? "dark" : "light");
      Groove.setStatusBarAppearance(theme ? "dark" : "light");
      document.querySelectorAll("iframe.groove-app-view").forEach(e => appViewEvents.setTheme(e, theme))
      if (!doNotSave) localStorage.setItem("theme", theme)
    } else {
      console.error("Invalid theme!");
    }
  },
  setTileColumns: (int, doNotSave = false) => {
    if (Object.values(grooveTileColumns).includes(int)) {
      tileListGrid.column(
        int,
        int < tileListGrid.getColumn() ? "compact" : "none"
      );
      if (!doNotSave) localStorage.setItem("tileColumns", int)

    } else {
      console.error("Invalid tile size!");
    }
  },
  setReduceMotion: (bool, doNotSave = false) => {
    bool = !!bool
    if (bool) document.body.classList.add("reduced-motion"); else document.body.classList.remove("reduced-motion")
    if (!doNotSave) localStorage.setItem("reducedMotion", bool)
  },
  setUIScale: (scale, doNotSave = false) => {
    scale = scale < .25 ? .25 : scale > 4 ? 4 : scale
    Groove.setUIScale(scale)
    if (!doNotSave) localStorage.setItem("UIScale", scale)
  },
  packageManagerProvider: {
    set: (id, doNotSave = false) => {
      id = (id == 0 || id == 1 || id == 2) ? id : 0
      if (!doNotSave) localStorage.setItem("packageManagerProvider", id)
    },
    get: () => {
      return (!localStorage["packageManagerProvider"] || localStorage["packageManagerProvider"] == "0") ? 0 : localStorage["packageManagerProvider"] == "1" ? 1 : 2
    }
  },
  homeConfiguration: {
    save: () => {
      if (window.cantSaveHomeConfig) return;
      const config = [];
      document.querySelectorAll("div.tile-list-inner-container > div.groove-home-tile").forEach(el => {
        if (el["gridstackNode"]) {
          try {
            config.push({
              p: el.getAttribute("packagename"),        // packageName
              /*t: el.getAttribute("title"),              // title
              ii: el.getAttribute("imageicon") == "true", // imageIcon
              i: el.getAttribute("icon"),               // icon
              ib: el.getAttribute("icon-bg"),            // icon background*/
              s: el.getAttribute("supportedsizes").split(","),     // supportedSizes
              w: el.gridstackNode.w,                    // width
              h: el.gridstackNode.h,                    // height
              x: el.gridstackNode.x,                    // left
              y: el.gridstackNode.y                     // top
            })
          } catch (error) {
            console.error("1 tile couldn't be saved")
          }
        }
      })
      localStorage.setItem("homeConfiguration", JSON.stringify(config))
    },
    load: () => {
      window.cantSaveHomeConfig = true
      document.querySelectorAll("div.tile-list-inner-container > div.groove-home-tile").forEach(e => e.remove())
      tileListGrid.batchUpdate(true)
      const config = JSON.parse(localStorage.getItem("homeConfiguration")) || []

      config.forEach(tile => {
        const appdetail = backendMethods.getAppDetails(tile.p)
        if (document.querySelectorAll(`div.groove-home-tile[packagename="${tile.p}"]`).length > 0) return

        const homeTile = GrooveElements.wHomeTile(appdetail.icon.foreground, appdetail.icon.background, appdetail.label, tile.p, "", tile.s)
        if (iconPackDB[tile.p]) {
          if (iconPackDB[tile.p].pack == 0) {
            homeTile.classList.add("iconpack0")
          }
        }
        const el = window.tileListGrid.addWidget(
          homeTile,
          {
            w: tile.w,
            h: tile.h,
            x: tile.l,
            y: tile.t
          }
        );
        el.setAttribute("gs-x", tile.l)
        el.setAttribute("gs-y", tile.t)
        el.setAttribute("gs-w", tile.w)
        el.setAttribute("gs-h", tile.h)
        tileListGrid.moveNode(el.gridstackNode, {
          w: tile.w,
          h: tile.h,
          x: tile.x,
          y: tile.y
        })

      })
      /*
            const loadData = {}
            config.forEach(tile => {
              console.log("tile",tile)
              const homeTile = GrooveElements.wHomeTile(tile.ii, tile.i, tile.t, tile.p, "", tile.s)
              loadData[tile.p] = {
                w: tile.w,
                h: tile.h,
                x: tile.x,
                y: tile.y,
                content: homeTile.innerHTML
              }
            })
            console.log(loadData)
            tileListGrid.load(Object.values(loadData))*/
      tileListGrid.batchUpdate(false)
      window.cantSaveHomeConfig = false
    },
  },
  wallpaper: {
    context: window["OffscreenCanvas"] ? new OffscreenCanvas(
      window.innerWidth,
      window.innerHeight + 50
    ).getContext("2d") : document.createElement("canvas"),
    load: async (image, doNotSave = false) => {
      if (window.lastClippedWallpaper)
        URL.revokeObjectURL(window.lastClippedWallpaper);
      /*const image = await new Promise((resolve, reject) => {
        let img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
      });*/
      let ctx = backendMethods.wallpaper.context;
      ctx.canvas.width = Math.max(window.innerWidth, window.innerHeight) + 100;
      ctx.canvas.height = Math.max(window.innerWidth, window.innerHeight) + 100;
      ctx.filter = "brightness(.8)";
      canvasImageFit.cover(
        ctx,
        image,
        0,
        0,
        ctx.canvas.width,
        ctx.canvas.height
      );
      const blob = await getCanvasBlob(ctx.canvas)
      const rurl = await backendMethods.wallpaper.loadBlob(blob)
      if (!doNotSave) {
        await imageStore.saveImage("wallpaper", blob);
      }
      return rurl;
    },
    loadBlob: async (blob) => {
      const rurl = await URL.createObjectURL(blob);
      //document.querySelector("#wallpapertest").style.setProperty("background-image", `url(${rurl})`)
      window.lastClippedWallpaper = rurl;
      backendMethods.wallpaper.recalculateOffsets();

      $("div.slide-page.slide-page-home")
        .css("background-image", `url(${rurl})`)
        .addClass("wallpaper-behind");
      setTimeout(() => {
        window.canPressHomeButton = true
      }, 200);
      return rurl;
    },
    recalculateOffsets: (scrollpos) => {
      return
      if (tileListInnerContainer.classList.contains("wallpaper-behind")) {
        const tileZoom =
          tileListInnerContainer.style.getPropertyValue("--tile-zoom");
        var scroll = scrollpos ? scrollpos.y : scrollers.tile_page_scroller.y;
        $("div.tile-list-inner-container > div.groove-home-tile").each(
          (index, el) => {
            const elRect = el.getBoundingClientRect();

            el.style.setProperty(
              "--wallpaper-offset-x",
              el.offsetLeft +
              tileListInnerContainer.offsetLeft +
              5 +
              tileListInnerContainer.parentNode.parentNode.offsetLeft +
              "px"
            );
            el.style.setProperty(
              "--wallpaper-offset-y",
              el.offsetTop +
              tileListInnerContainer.offsetTop +
              scroll +
              5 +
              "px"
            );
          }
        );
      }
    },
    remove: async () => {
      if (window.lastClippedWallpaper)
        URL.revokeObjectURL(window.lastClippedWallpaper);
      $("div.slide-page.slide-page-home")
        .css("background", "")
        .removeClass("wallpaper-behind");
      if (await imageStore.hasImage("wallpaper")) imageStore.removeImage("wallpaper")
    },
  },
  font: {
    get: () => { Number(localStorage["font"] || 0) },
    set: async (font, doNotSave = false) => {
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
            resultFont = 2
            document.body.classList.add("font-2")
          }
          break;
      }
      if (!doNotSave) localStorage.setItem("font", resultFont)
      fontStore.loadFont()
      document.querySelectorAll("iframe.groove-app-view").forEach(e => appViewEvents.setFont(e, font))
    },
    remove: () => {
      fontStore.clearFont()
    }
  },
  appInstall: (packagename) => {
    GrooveBoard.backendMethods.reloadApps()
  },
  appUninstall: (packagename) => {
    const tileElem = document.querySelector(`div.groove-home-tile[packagename="${packagename}"]`)
    if (tileElem) tileListGrid.removeWidget(tileElem)
    GrooveBoard.backendMethods.reloadApps()
  },
  serveConfig: () => {
    var response = { "uiscale": "1", "theme": "1", "accentcolor": "#3E65FF" }
    if (localStorage["UIScale"]) response.uiscale = localStorage.UIScale
    if (localStorage["accentColor"]) response.accentcolor = localStorage.accentColor
    if (localStorage["theme"]) response.theme = localStorage.theme
    return response;
  },
  setupNeeded: () => {
    if (localStorage["lastVersion"] == undefined) return true;
    else if (localStorage["lastVersion"] != Groove.getAppVersion()) return true;
    else return false;
  }
};
function listHistory() {
  return
  console.log(
    "%c" +
    GrooveBoard.backendMethods.navigation.history
      .map((e, index) => index - -1 + ": " + JSON.stringify(e))
      .join("\n"),
    "background: #222; color: #bada55"
  );
}
window.addEventListener("backButtonPress", function () {
  backendMethods.navigation.back();
});
window.addEventListener("homeButtonPress", function () {
  //if(!!window.canPressHomeButton)
  backendMethods.navigation.home();
});
window.addEventListener("appInstall", function (e) {
  backendMethods.appInstall(e.detail.packagename)
});
window.addEventListener("appUninstall", function (e) {
  backendMethods.appUninstall(e.detail.packagename)
});
window.addEventListener('message', (event) => {
  if (event.data["action"]) {
    if (event.data.action == "setTheme") {
      backendMethods.setTheme(event.data.argument);
    } else if (event.data.action == "setAccentColor") {
      backendMethods.setAccentColor(event.data.argument);
    } else if (event.data.action == "setTileColumns") {
      backendMethods.setTileColumns(event.data.argument);
      backendMethods.homeConfiguration.save()
    } else if (event.data.action == "setReduceMotion") {
      backendMethods.setReduceMotion(event.data.argument);
    } else if (event.data.action == "setUIScale") {
      backendMethods.setUIScale(event.data.argument);
    } else if (event.data.action == "reloadApp") {
      window.location.reload()
    }
  }
});
function getCanvasBlob(canvas, mimeType = 'image/png') {
  if (canvas["convertToBlob"]) {
    // If the canvas is an OffscreenCanvas, use convertToBlob
    return canvas.convertToBlob({ type: mimeType });
  } else if (canvas instanceof HTMLCanvasElement) {
    // If the canvas is a regular HTMLCanvasElement, use toBlob
    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      }, mimeType);
    });
  } else {
    return Promise.reject(new Error('Invalid canvas type'));
  }
}

export default { boardMethods, backendMethods, alert };
