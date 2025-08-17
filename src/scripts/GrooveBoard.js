import { normalize } from 'normalize-diacritics-es';
window.normalizeDiacritics = (input = "") => {
  return normalize(input)
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
import LocaleStore from "./localeManager";
import { localization } from "./localeManager";
import liveTileManager from './liveTileManager';
import StyleManager from './styleManager';
const styleManagerInstance = new StyleManager();
window.grooveTileColumns = grooveTileColumns;
window.grooveColors = grooveColors;
window.grooveThemes = grooveThemes;
const tileListInnerContainer = document.querySelector(
  "div.tile-list-inner-container"
);
import jQuery from "jquery";
var $ = jQuery
function hexToRgbObject(hex) {
  hex = hex.replace(/^#/, '');
  let r = parseInt(hex.slice(0, 2), 16);
  let g = parseInt(hex.slice(2, 4), 16);
  let b = parseInt(hex.slice(4, 6), 16);
  return { r, g, b }
}


function rgbObjectToHex(r, g, b) {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

function adjustColor(hex, amount) {
  let { r, g, b } = hexToRgbObject(hex);

  // Adjust the color
  r = Math.min(255, Math.max(0, r + amount));
  g = Math.min(255, Math.max(0, g + amount));
  b = Math.min(255, Math.max(0, b + amount));

  return rgbObjectToHex(r, g, b);
}

function hexToRgb(hex) {
  const { r, g, b } = hexToRgbObject(hex);
  return `rgb(${r}, ${g}, ${b})`;
}
import GrooveElements from "./GrooveElements";

function alert(title = "Alert!", message = "Message", actions = [{ title: "" }], inline) {
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
  if ((actions.length <= 2 && !inline)) alertmenu.addClass("inline")
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
  function closeW() {
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
  alertmenu.on("click", function (e) {
    // Only close if the click is directly on the alert background, not on a button or its descendants
    if (e.target.classList.contains("groove-element-alert-action")) {
      closeW();
    }
  });
  alertmenu.children("button").on("click", closeW);
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
      if (document.body.classList.contains("rtl")) scrollers.main_home_scroller.scrollTo(-window.innerWidth, 0, 0)
    }, 750);
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

    // Apply tile preferences to home tile
    backendMethods.applyTilePreferences(widget, options.packageName);

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

    // Apply tile preferences
    backendMethods.applyTilePreferences(el, options.packageName);

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
    var entries = {}
    entries[window.i18n.t("common.app_menu.pin_to_home")] = () => {
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
        scrollers.main_home_scroller.scrollTo(0, 0, 750);
        setTimeout(() => {
          scrollers.tile_page_scroller.scrollTo(
            0,
            -el.offsetTop - el.offsetHeight / 2 + window.innerHeight / 2,
            500
          );
        }, 300);
      }, 300);

      backendMethods.homeConfiguration.save()
    }
    entries[window.i18n.t("common.app_menu.app_info")] = () => {
      Groove.launchAppInfo(packageName)
    }
    entries[window.i18n.t("common.app_menu.uninstall")] = () => {
      if (GrooveBoard.backendMethods.packageManagerProvider.get() == 0) {
        Groove.uninstallApp(packageName, 0);
      } else {
        parent.GrooveBoard.alert(
          window.i18n.t("common.alerts.uninstall.title"),
          window.i18n.t("common.alerts.uninstall.message"),
          [{
            title: window.i18n.t("common.actions.yes"), style: "default", inline: true, action: () => {
              Groove.uninstallApp(packageName, GrooveBoard.backendMethods.packageManagerProvider.get());
            }
          }, { title: window.i18n.t("common.actions.no"), style: "default", inline: true, action: () => { } }]
        );
      }
    }
    const el = GrooveElements.wAppMenu(packageName, entries);
    el.fullHeight = 219
    el.elementHeight = 65
    document.querySelector("div.app-list-page").appendChild(el);
    const items = {
      pin: el.querySelector("div:nth-child(1)"),
      info: el.querySelector("div:nth-child(2)"),
      uninstall: el.querySelector("div:nth-child(3)")
    }
    if (document.querySelectorAll(`div.groove-home-tile[packagename="${packageName}"]`).length > 0) {
      items.pin.classList.add("disabled")
    }
    if (packageName.startsWith("groove.internal")) {
      items.info.remove()
      el.fullHeight -= el.elementHeight
    }
    if (allappsarchive.filter(e => e.packageName == packageName)[0].type == 0) {
      items.uninstall.remove()
      el.fullHeight -= el.elementHeight
    }
    el.style.setProperty("--full-height", el.fullHeight + "px")

    return el;
  },
  createTileMenu: (el) => {
    document.querySelectorAll(".groove-tile-menu").forEach((i) => i.remove());
    const tileMenu = GrooveElements.wTileMenu(el);
    el.appendChild(tileMenu);
    return el;
  },
  createAppView: (packageName, args) => {
    const appView = GrooveElements.wAppView(packageName, args);
    document.body.appendChild(appView);
    return appView;
  },
  liveTiles: {
    init: {
      alarms: undefined,
      people: undefined,
      photos: undefined,
      weather: undefined,
      example: undefined
    },
    defaults: () => {
      const iconpackdbentries = Object.keys(iconPackDB)
      const installedApps = allappsarchive.map(e => e.packageName).filter(e => iconpackdbentries.includes(e) || e == "test.example")
      return Object.fromEntries(installedApps.filter(e =>
        e == "test.example" ? true : (["alarms", "people", "photos", "weather"].includes(iconPackDB[e].icon))
      ).map(
        e => [e, e == "test.example" ? boardMethods.liveTiles.init.example : boardMethods.liveTiles.init[iconPackDB[e].icon]]
      )
      )
    },
    get: () => Object.assign(localStorage.getItem("liveTiles") || {}, boardMethods.liveTiles.defaults()),
    //setTileProvider: (provider) => {}
    getProviders: () => window.liveTileProviders || [],
    refresh: () => {
      const initializeLiveTiles = boardMethods.liveTiles.get()
      const homeTiles = document.querySelector("#main-home-slider div.tile-list-inner-container").querySelectorAll("div.groove-home-tile")
      homeTiles.forEach(i => {
        const packageName = i.getAttribute("packagename")
        if (window.liveTiles[packageName]) {
          delete initializeLiveTiles[packageName]
          return
        };
        if (initializeLiveTiles[packageName]) {
          liveTileManager.registerLiveTileWorker(packageName, initializeLiveTiles[packageName])
        }
        delete initializeLiveTiles[packageName]
      })
      Object.keys(initializeLiveTiles).forEach(packageName => {
        //console.log("unregisterLiveTileWorker", packageName)
        liveTileManager.unregisterLiveTileWorker(packageName)
      })
      Object.entries(window.liveTiles).forEach(liveTileBundle => {
        const packageName = liveTileBundle[0]
        const liveTile = liveTileBundle[1]
        if (liveTile.uid == GrooveBoard.boardMethods.liveTiles.init.people) {
          liveTile.worker.postMessage({
            action: "contacts-data",
            data: { timestamp: Date.now(), contacts: window.contactsCache }
          })

        }
      })
      Object.entries(window.liveTiles).forEach(liveTileBundle => {
        const packageName = liveTileBundle[0]
        const liveTile = liveTileBundle[1]
        if (liveTile.uid == GrooveBoard.boardMethods.liveTiles.init.photos) {
          liveTile.worker.postMessage({
            action: "photos-data",
            data: { timestamp: Date.now(), photos: window.photosCache }
          })

        }
      })
      Object.entries(window.liveTiles).forEach(liveTileBundle => {
        const packageName = liveTileBundle[0]
        const liveTile = liveTileBundle[1]
        if (liveTile.uid == GrooveBoard.boardMethods.liveTiles.init.photos) {
          liveTile.worker.postMessage({
            action: "notifications-data",
            data: { timestamp: Date.now(), notifications: JSON.parse(Groove.getAllNotifications()) }
          })

        }
      })
    }
    //getAppProvider:
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
      }
    } catch (error) {
      console.error('Error accessing databases: ', error);
    }
    localStorage.clear()
  },
  reloadApps: function (callback) {
    document.querySelector("#main-home-slider > div > div:nth-child(2) > div > div.app-list > div.app-list-container").querySelectorAll(".groove-letter-tile, .groove-app-tile").forEach(e => e.remove());
    Object.keys(appSortCategories).forEach(key => {
      delete appSortCategories[key];
    });

    var appsWithPreferences = JSON.parse(JSON.stringify(backendMethods.reloadAppDatabase())).map(e => {
      const appPreference = GrooveBoard.backendMethods.getAppPreferences(e.packageName);
      if (appPreference.label != "auto") e.label = appPreference.label;
      return e;
    }).filter(e => {
      const appPreference = GrooveBoard.backendMethods.getAppPreferences(e.packageName);
      return appPreference.shown
    });

    appsWithPreferences.forEach((entry) => {
      const labelSortCategory = getLabelSortCategory(entry.label);
      if (!!!appSortCategories[labelSortCategory])
        appSortCategories[labelSortCategory] = [];
      appSortCategories[labelSortCategory].push(entry);
    });

    // Sort apps within each letter category
    Object.keys(appSortCategories).forEach((labelSortCategory) => {
      appSortCategories[labelSortCategory].sort((a, b) => a.label.localeCompare(b.label));
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
        const iconurl = JSON.parse(Groove.getAppIconURL(app.packageName));
        const appdetail = backendMethods.getAppDetails(app.packageName);

        const el = boardMethods.createAppTile({
          title: appdetail.label,
          packageName: app.packageName,
          imageIcon: true,
          icon: appdetail.icon.foreground,
          iconbg: appdetail.icon.background,
        });
      });
    });
    scrollers.app_page_scroller.refresh();
  },
  getAppDetails: (packageName, rawDetails = false) => {
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
    if (!rawDetails) {
      const appPreference = backendMethods.getAppPreferences(packageName)
      if (appPreference.label != "auto") returnee.label = appPreference.label
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
    push: (change, forwardAction, backAction, homeBack = true) => {
      GrooveBoard.backendMethods.navigation.invalidate(change);
      forwardAction();
      backendMethods.navigation.history.push({
        forwardAction: forwardAction,
        change: change,
        backAction,
        homeBack
      });
      history.pushState(change, "", window.location.href);
      listHistory();
    },
    back: (action = true, homeBack = false) => {
      if (backendMethods.navigation.history.length <= 1) return;
      if (action == false)
        backendMethods.navigation.lastPush.backAction = () => { };
      const act = backendMethods.navigation.history.pop();
      if (homeBack && act.homeBack) {
        act.backAction(homeBack);
      } else if (!homeBack) {
        act.backAction(homeBack);
      }
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
      }, 100 * animationDurationScale);
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
      backendMethods.getTileSize(1, 1)[0] / originalWidgetSizes[0];
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
      window.tileListGrid.getColumn() - (chosenSize[0] + el.gridstackNode.x)
    );
    //window.tileListGrid.update(el.gridstackNode, { w: chosenSize[0], h: chosenSize[1] })
    window.tileListGrid.moveNode(el.gridstackNode, {
      x: el.gridstackNode.x + fitRightBorder,
    });
    window.tileListGrid.moveNode(el.gridstackNode, {
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
  launchInternalApp: (packageName, args) => {
    if (!window.launchedInternalApps) window.launchedInternalApps = new Set();
    if (window.launchedInternalApps.has(packageName)) {
      console.log("App is already open!");
      //pass args here
      return;
    }
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

          const appView = boardMethods.createAppView(packageName, args)
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
      }, 150 * animationDurationScale);
    } catch (error) {
      console.log("Soft exit failed! Destroying process")
      backendMethods.destroyInternalApp(packageName, homeBack)
    }
  },
  setAccentColorShades: () => {
    if (!document.querySelector("#main-home-slider > div > div.slide-page.slide-page-home")) return
    var accentColor = getComputedStyle(document.body).getPropertyValue("--accent-color");
    const hasWallpaper = document.querySelector("#main-home-slider > div > div.slide-page.slide-page-home").classList.contains("wallpaper-behind") && localStorage.alternativeWallpaper != "true"
    if (hasWallpaper) accentColor = "#7f7f7f"
    const highContrast = localStorage["highContrast"] == "true"
    const lightMode = document.body.classList.contains("light-mode")
    if (highContrast) accentColor = "#000000";
    accentColor = String(accentColor).startsWith("#") ? accentColor : "#AA00FF";
    var rgb;
    try { rgb = hexToRgbObject(accentColor) } catch (error) { rgb = { r: 170, g: 0, b: 255 } }
    for (let i = 0; i < 4; i++) {
      document.body.style.setProperty(
        `--accent-color-shade-${i}`,
        adjustColor(accentColor, i * 60 * ((hasWallpaper && !highContrast) ? -.5 : 1))
      );
    }
  },
  setAccentColor: (color, doNotSave = false) => {
    document.body.style.setProperty("--accent-color", color);
    backendMethods.setAccentColorShades();
    document.querySelectorAll("iframe.groove-app-view").forEach(e => appViewEvents.setAccentColor(e, color))
    if (!doNotSave) localStorage.setItem("accentColor", color)
    if (window.Groove) Groove.setAccentColor(color)
    if (Object.values(grooveColors).includes(color)) {
      //Groove.setAppIconColor(Object.entries(grooveColors).filter(e => e[1].toLowerCase() == color.toLowerCase())[0][0])
    } else {
      console.error("Custom color detected!");
      //Groove.setAppIconColor("default")
    }
  },
  setTheme: (theme, doNotSave = false) => {
    if (Object.values(grooveThemes).includes(theme)) {
      var applyTheme
      if (theme == 2) applyTheme = Number(localStorage.getItem("autoTheme")); else applyTheme = theme
      document.body.classList[applyTheme ? "add" : "remove"]("light-mode");
      if (window.Groove) Groove.setNavigationBarAppearance(applyTheme ? "dark" : "light");
      if (window.Groove) Groove.setStatusBarAppearance(applyTheme ? "dark" : "light");
      document.querySelectorAll("iframe.groove-app-view").forEach(e => appViewEvents.setTheme(e, applyTheme))
      if (!doNotSave) {
        localStorage.setItem("theme", theme)
        setTimeout(() => {
          localStorage.setItem("theme", theme)
        }, 100);
      }
    } else {
      console.error("Invalid theme!");
    }
    backendMethods.setAccentColorShades();
  },
  setTileColumns: (int, doNotSave = false) => {
    if (Object.values(grooveTileColumns).includes(int)) {
      if (window.tileListGrid) window.tileListGrid.column(
        int,
        int < window.tileListGrid.getColumn() ? "compact" : "none"
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
    backendMethods.setAccentColorShades();
  },
  setHighContrast: (bool, doNotSave = false) => {
    bool = !!bool
    if (bool) document.body.classList.add("high-contrast"); else document.body.classList.remove("high-contrast")
    if (!doNotSave) localStorage.setItem("highContrast", bool)
    backendMethods.setAccentColorShades();
  },
  setUIScale: (scale, doNotSave = false) => {
    scale = scale < .25 ? .25 : scale > 4 ? 4 : scale
    Groove.setUIScale(scale)
    if (!doNotSave) localStorage.setItem("UIScale", scale)
  },
  setTextDirection: (direction, doNotSave = false) => {
    if (direction == "ltr") {
      document.body.classList.remove("rtl");
    } else if (direction == "rtl") {
      document.body.classList.add("rtl");
    } else {
      console.error("Invalid text direction!");
      return;
    }
    if (!doNotSave) localStorage.setItem("textDirection", direction)
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
      try {
        boardMethods.liveTiles.refresh()
      } catch (error) {
        console.error("Couldn't refresh live tiles!")
      }
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
      window.tileListGrid.batchUpdate(true)
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

        // Apply tile preferences to home tile
        backendMethods.applyTilePreferences(homeTile, tile.p);

        el.setAttribute("gs-x", tile.l)
        el.setAttribute("gs-y", tile.t)
        el.setAttribute("gs-w", tile.w)
        el.setAttribute("gs-h", tile.h)
        window.tileListGrid.moveNode(el.gridstackNode, {
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
            window.tileListGrid.load(Object.values(loadData))*/
      window.tileListGrid.batchUpdate(false)
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
      backendMethods.setAccentColorShades();
      return rurl;
    },
    loadBlob: async (blob) => {
      const rurl = await URL.createObjectURL(blob);
      //document.querySelector("#wallpapertest").style.setProperty("background-image", `url(${rurl})`)
      window.lastClippedWallpaper = rurl;
      backendMethods.wallpaper.recalculateOffsets();

      $("div.slide-page.slide-page-home").addClass("wallpaper-behind");
      $("body").css("--wallpaper-url", `url(${rurl})`)
      setTimeout(() => {
        window.canPressHomeButton = true
      }, 200);
      backendMethods.setAccentColorShades();
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
        .removeClass("wallpaper-behind");
      $("body").css("--wallpaper-url", "")

      if (await imageStore.hasImage("wallpaper")) imageStore.removeImage("wallpaper")
    },
    alternative: () => {
      if (localStorage.getItem("alternativeWallpaper") == "true") {
        document.body.classList.add("alternative-wallpaper")
      } else {
        document.body.classList.remove("alternative-wallpaper")
      }
    }
  },
  font: {
    get: () => { Number(localStorage["font"] || 0) },
    set: async (font, doNotSave = false) => {
      font = Number(font)
      font = font < 0 ? 0 : font > 2 ? 2 : font
      document.body.classList.remove("font-1")
      document.body.classList.remove("font-2")
      var resultFont = 0
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
    backendMethods.reloadApps()
  },
  appUpdate: (packagename) => {
    backendMethods.reloadApps()
    boardMethods.liveTiles.refresh()
  },
  appUninstall: (packagename) => {
    const tileElem = document.querySelector(`div.groove-home-tile[packagename="${packagename}"]`)
    if (tileElem) {
      window.tileListGrid.removeWidget(tileElem)
      boardMethods.liveTiles.refresh()
    }
    backendMethods.reloadApps()
  },
  serveConfig: () => {
    var response = { "uiscale": "1", "theme": "1", "accentcolor": "#AA00FF" }
    if (localStorage["UIScale"]) response.uiscale = localStorage.UIScale
    if (localStorage["accentColor"]) response.accentcolor = localStorage.accentColor
    if (localStorage["theme"]) response.theme = localStorage.theme
    return response;
  },
  setupNeeded: () => {
    if (localStorage["lastVersion"] == undefined) return true;
    else if (localStorage["lastVersion"] != Groove.getAppVersion()) return true;
    else return false;
  },
  localization: localization,
  defaultLiveTiles: {
    refresh: () => {
      window.defaultLiveTiles = {}
      Object.values(GrooveBoard.boardMethods.liveTiles.init).reverse().forEach(liveTileID => {
        const match = boardMethods.liveTiles.getProviders().find(item => item.id === liveTileID);
        if (match) {
          match.metadata.provide.forEach(packageName => {
            window.defaultLiveTiles[packageName] = liveTileID
          })
        }
      })
    }
  },
  getAppPreferences: (packageName) => {
    //const rawAppDetails = backendMethods.getAppDetails(packageName, true)
    var defaultPref = {
      label: "auto",
      icon: {
        foreground: "auto",
        background: "auto"
      },
      textColor: "auto",
      accent: "auto",
      shown: true,
      liveTile: "auto"
    }

    if (localStorage["perAppPreferences"]) {
      const perAppPreferences = JSON.parse(localStorage["perAppPreferences"])
      if (perAppPreferences[packageName]) {
        var appPreference = perAppPreferences[packageName]
        defaultPref = Object.assign(defaultPref, appPreference)
      }
    }
    if (packageName.startsWith("groove.internal")) {
      defaultPref.shown = true
      defaultPref.label = "auto"
    }
    return defaultPref
  },
  animationDurationScale: {
    set: (scale) => {
      scale = scale < 0 ? 0 : scale > 10 ? 10 : scale
      window.animationDurationScale = scale
      document.body.style.setProperty("--animation-duration-scale", scale)
      document.querySelector("html").style.setProperty("--animation-duration-scale", scale)
      document.querySelectorAll("iframe.groove-app-view").forEach(e => appViewEvents.setAnimationDurationScale(e, scale))
    },
    get: () => {
      return window.animationDurationScale || window.parent.animationDurationScale || 1
    }
  },
  refreshStyles: () => {
    document.querySelectorAll("link.custom-style").forEach(e => e.remove())
    Object.keys(styleManagerInstance.getMetadata()).forEach(id => {
      styleManagerInstance.applyStyle(id)
    })
  },

  // Tile Preference System
  getGlobalTilePreferences: () => {
    if (!localStorage["globalTilePreferences"]) {
      localStorage["globalTilePreferences"] = JSON.stringify({
        icon: "default",
        background: "default",
        textColor: "default"
      });
    }
    return JSON.parse(localStorage["globalTilePreferences"]);
  },

  getAppTilePreferences: (packageName) => {
    // Try to use WebInterface method first
    if (window.Groove && window.Groove.getAppTilePreferences) {
      try {
        const prefsStr = window.Groove.getAppTilePreferences(packageName);
        if (prefsStr && prefsStr !== "undefined" && prefsStr !== "null") {
          return JSON.parse(prefsStr);
        }
      } catch (error) {
        console.log("Error getting app tile preferences via WebInterface:", error);
      }
    }

    // Fallback to localStorage - check new format first, then old format
    const defaultPrefs = { icon: "default", background: "default", textColor: "default" };

    // Check new perAppTilePreferences format (used by Groove Settings)
    if (localStorage["perAppTilePreferences"]) {
      try {
        const perAppPrefs = JSON.parse(localStorage["perAppTilePreferences"]);
        if (perAppPrefs[packageName]) {
          return perAppPrefs[packageName];
        }
      } catch (error) {
        console.log("Error reading perAppTilePreferences:", error);
      }
    }

    // Check old individual key format  
    const key = `groove_app_tiles_${packageName}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultPrefs;
  },

  setAppTilePreferences: (packageName, preferences) => {
    // Try to use WebInterface method first
    if (window.Groove && window.Groove.setAppTilePreferences) {
      try {
        window.Groove.setAppTilePreferences(packageName, JSON.stringify(preferences));
      } catch (error) {
        console.log("Error setting app tile preferences via WebInterface:", error);
      }
    }

    // Also save to localStorage as backup
    const key = `groove_app_tiles_${packageName}`;
    localStorage.setItem(key, JSON.stringify(preferences));

    // Trigger refresh
    window.dispatchEvent(new CustomEvent('tilePreferencesChanged', {
      detail: { packageName, preferences }
    }));
  },

  getEffectiveTilePreferences: (packageName) => {
    const appPrefs = backendMethods.getAppTilePreferences(packageName);
    const globalPrefs = backendMethods.getGlobalTilePreferences();

    return {
      icon: appPrefs.icon === "default" ? globalPrefs.icon : appPrefs.icon,
      background: appPrefs.background === "default" ? globalPrefs.background : appPrefs.background,
      textColor: appPrefs.textColor === "default" ? globalPrefs.textColor : appPrefs.textColor
    };
  },

  refreshAllTiles: () => {
    // Refresh home tiles directly
    setTimeout(() => {
      document.querySelectorAll('.groove-home-tile[packagename]').forEach(tile => {
        const packageName = tile.getAttribute('packagename');
        if (packageName) {
          backendMethods.applyTilePreferences(tile, packageName);
        }
      });
    }, 50);

    // Refresh app list tiles
    setTimeout(() => {
      document.querySelectorAll('.groove-app-tile[packagename]').forEach(tile => {
        const packageName = tile.getAttribute('packagename');
        if (packageName) {
          backendMethods.applyTilePreferences(tile, packageName);
        }
      });
    }, 100);
  },

  applyTilePreferences: (tileElement, packageName) => {
    if (!tileElement || !packageName) return;

    const prefs = backendMethods.getEffectiveTilePreferences(packageName);

    // Determine if this is a home tile or app tile
    const isHomeTile = tileElement.classList.contains('groove-home-tile');
    const isAppTile = tileElement.classList.contains('groove-app-tile');

    let iconElement, titleElement, backgroundTarget;

    if (isHomeTile) {
      iconElement = tileElement.querySelector('.groove-home-tile-imageicon');
      titleElement = tileElement.querySelector('.groove-home-tile-title');
      backgroundTarget = tileElement.querySelector('.groove-home-inner-tile'); // Apply background to inner tile
    } else if (isAppTile) {
      iconElement = tileElement.querySelector('.groove-app-tile-imageicon');
      titleElement = tileElement.querySelector('.groove-app-tile-title');
      backgroundTarget = iconElement; // For app tiles, apply background to icon element
    }

    // Apply background preference
    if (backgroundTarget) {
      if (prefs.background === 'accent_color') {
        // Use the CSS variable for accent color
        backgroundTarget.style.backgroundColor = 'var(--accent-color)';
        backgroundTarget.style.backgroundImage = 'none'; // Clear any existing background image
      } else {
        backgroundTarget.style.backgroundColor = '';
        backgroundTarget.style.backgroundImage = ''; // Reset background image
      }
    }

    // Apply text color preference only to home tiles (not app list tiles)
    if (titleElement && isHomeTile) {
      if (prefs.textColor === 'light') {
        titleElement.style.color = '#FFFFFF';
      } else if (prefs.textColor === 'dark') {
        titleElement.style.color = '#000000';
      } else {
        titleElement.style.color = '';
      }
    }

    // Apply icon preference (monochrome, icon packs, etc.)
    if (prefs.icon === 'monochrome' && iconElement) {
      // Check if monochrome is supported
      if (window.Groove && window.Groove.supportsMonochromeIcons && window.Groove.supportsMonochromeIcons() === "true") {
        iconElement.style.filter = 'grayscale(1) brightness(0) invert(1)';
        // Adjust filter based on text color for better contrast
        if (prefs.textColor === 'dark' || (prefs.textColor === 'default' && prefs.background === 'accent_color')) {
          iconElement.style.filter = 'grayscale(1) brightness(0)';
        }
      }
    } else if (iconElement) {
      iconElement.style.filter = '';
    }
  }

};
backendMethods.animationDurationScale.set(1)
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

var appUninstallLimbo = {}
window.addEventListener("appInstall", function (e) {
  if (appUninstallLimbo[e.detail.packagename]) {
    clearTimeout(appUninstallLimbo[e.detail.packagename])
    backendMethods.appUpdate(e.detail.packagename)
  } else {
    backendMethods.appInstall(e.detail.packagename)
  }
});
window.addEventListener("appUninstall", function (e) {
  clearTimeout(appUninstallLimbo[e.detail.packagename])
  appUninstallLimbo[e.detail.packagename] = setTimeout(() => {
    backendMethods.appUninstall(e.detail.packagename)
    clearOldAppPreferences()
  }, 20000)
});

// Listen for tile preferences changes and refresh tiles
window.addEventListener("tilePreferencesChanged", function (e) {
  backendMethods.refreshAllTiles();
});

function clearOldAppPreferences() {
  setTimeout(() => {
    if (localStorage["perAppPreferences"]) {
      const allApps = window["allappsarchive"].map(e => e.packageName) || []
      if (localStorage["perAppPreferences"]) {
        const perAppPreferences = JSON.parse(localStorage["perAppPreferences"])
        Object.keys(perAppPreferences).forEach(e => {
          if (!allApps.includes(e)) {
            delete perAppPreferences[e]
          }
        })
        localStorage["perAppPreferences"] = JSON.stringify(perAppPreferences)
      }
    }
  }, 2000)
}
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
    } else if (event.data.action == "setHighContrast") {
      backendMethods.setHighContrast(event.data.argument);
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

window.addEventListener("load", () => {
  backendMethods.animationDurationScale.set(window["Groove"] ? Groove.getAnimationDurationScale() : 1)
  window.addEventListener("animationDurationScaleChange", function (e) {
    backendMethods.animationDurationScale.set(window["Groove"] ? Groove.getAnimationDurationScale() : 1)
  });
})
window.addEventListener("systemThemeChange", function (e) {
  localStorage["autoTheme"] = e.detail.theme == "dark" ? "0" : "1"
  if (localStorage["theme"] == "2") {
    backendMethods.setTheme(2, true);
  }
})