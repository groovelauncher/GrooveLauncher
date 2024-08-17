import {
  grooveColors,
  grooveTileColumns,
  grooveThemes,
} from "./GrooveProperties";
import appViewEvents from "./appViewEvents"
import canvasImageFit from "./canvasImageFit";
window.grooveTileColumns = grooveTileColumns;
window.grooveColors = grooveColors;
window.grooveThemes = grooveThemes;
const tileListInnerContainer = document.querySelector(
  "div.tile-list-inner-container"
);

import GrooveElements from "./GrooveElements";
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
        options.imageIcon,
        options.icon,
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
        title: "Unknown",
        packageName: "com.unknown",
      },
      options
    );
    const el = GrooveElements.wAppTile(
      options.imageIcon,
      options.icon,
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
      "pin to start": () => {
        const findTile = $(
          `div.inner-page.app-list-page > div.app-list > div.app-list-container > div.groove-element.groove-app-tile[packagename="${packageName}"]`
        )[0];
        const iconpack = findTile.classList.contains("iconpack0")
          ? 0
          : findTile.classList.contains("iconpack1")
            ? 1
            : 2;
        const el = GrooveBoard.boardMethods.createHomeTile(
          [1, 1],
          {
            packageName: findTile.getAttribute("packagename"),
            title: findTile.getAttribute("title"),
            icon: findTile.getAttribute("icon"),
            imageIcon: findTile.getAttribute("imageicon") == "true",
            //  supportedSizes: ["s", "m", "w", "l"]
            supportedSizes: ["s", "m", "w", "l"],
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
        Groove.uninstallApp(packageName);
      },
    });
    document.querySelector("div.app-list-page").appendChild(el);
    if (document.querySelectorAll(`div.groove-home-tile[packagename="${packageName}"]`).length > 1) {
      el.querySelector("div:nth-child(1)").classList.add("disabled")
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
var appSortCategories = {};
window.appSortCategories = appSortCategories;
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
  reloadApps: function (callback) {
    const apps = JSON.parse(Groove.retrieveApps());
    let array = apps;
    array.sort(sortObjectsByLabel);
    window["allappsarchive"] = array;
    array.forEach((entry) => {
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
        const el = boardMethods.createAppTile({
          title: app.label,
          packageName: app.packageName,
          imageIcon: ipe ? false : true,
          icon: ipe ? ipe.icon : Groove.getAppIconURL(app.packageName),
        });
        if (ipe) {
          if (ipe.pack == 0) el.classList.add("iconpack0");
          else if (ipe.pack == 1) el.classList.add("iconpack1");
          else el.classList.add("iconpack2");
        }
      });
    });
    scrollers.app_page_scroller.refresh();
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
    back: (action = true) => {
      if (backendMethods.navigation.history.length <= 1) return;
      if (action == false)
        backendMethods.navigation.lastPush.backAction = () => { };
      const act = backendMethods.navigation.history.pop();
      //console.log("HISTORY BACK", act.change);
      act.backAction();
      listHistory();
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
            () => {
              backendMethods.closeInternalApp(packageName)
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
  destroyInternalApp: (packageName) => {
    if (!window.launchedInternalApps) window.launchedInternalApps = new Set();
    if (window.launchedInternalApps.has(packageName)) {
      document.querySelectorAll(`iframe.groove-element.groove-app-view[packageName="${packageName}"]`).forEach(e => e.remove())
      appTransition.onResume(true)
      window.launchedInternalApps.delete(packageName)
    } else {
      console.log("App is not open!")
      return;
    }

  },
  closeInternalApp: (packageName) => {
    //Alert app
    try {
      appViewEvents.softExit(document.querySelector(`iframe.groove-element.groove-app-view[packageName="${packageName}"]`))
      setTimeout(() => {
        backendMethods.destroyInternalApp(packageName)
      }, 250);
    } catch (error) {
      console.log("Soft exit failed! Destroying process")
      backendMethods.destroyInternalApp(packageName)
    }
  },
  setAccentColor: (color, doNotSave = false) => {
    if (Object.values(grooveColors).includes(color)) {
      document.body.style.setProperty("--accent-color", color);
      document.querySelectorAll("iframe.groove-app-view").forEach(e => appViewEvents.setAccentColor(e, color))
      if (!doNotSave) localStorage.setItem("accentColor", color)
    } else {
      console.error("Invalid color!");
    }
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
  setTileColumns: (int, doNotSave) => {
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
  homeConfiguration: {
    save: () => {
      if (window.cantSaveHomeConfig) return;
      const config = [];
      document.querySelectorAll("div.tile-list-inner-container > div.groove-home-tile").forEach(el => {
        if (el["gridstackNode"]) {
          try {
            config.push({
              p: el.getAttribute("packagename"),        // packageName
              t: el.getAttribute("title"),              // title
              ii: el.getAttribute("imageicon") == "true", // imageIcon
              i: el.getAttribute("icon"),               // icon
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
        if (document.querySelectorAll(`div.groove-home-tile[packagename="${tile.p}"]`).length > 0) return

        const homeTile = GrooveElements.wHomeTile(tile.ii, tile.i, tile.t, tile.p, "", tile.s)
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
    context: new OffscreenCanvas(
      window.innerWidth,
      window.innerHeight + 50
    ).getContext("2d"),
    load: async (url) => {
      if (window.lastClippedWallpaper)
        URL.revokeObjectURL(window.lastClippedWallpaper);
      const image = await new Promise((resolve, reject) => {
        let img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
      });
      let ctx = backendMethods.wallpaper.context;
      ctx.canvas.width = window.innerWidth;
      ctx.canvas.height = window.innerHeight + 50;
      ctx.filter = "brightness(.8)";
      canvasImageFit.cover(
        ctx,
        image,
        0,
        0,
        ctx.canvas.width,
        ctx.canvas.height
      );
      const rurl = await URL.createObjectURL(await ctx.canvas.convertToBlob());
      //document.querySelector("#wallpapertest").style.setProperty("background-image", `url(${rurl})`)
      window.lastClippedWallpaper = rurl;
      backendMethods.wallpaper.recalculateOffsets();
      $("div.tile-list-inner-container")
        .css("--wallpaper-src", `url(${rurl})`)
        .addClass("wallpaper-behind");
      return rurl;
    },
    recalculateOffsets: (scrollpos) => {
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
    remove: () => {
      if (window.lastClippedWallpaper)
        URL.revokeObjectURL(window.lastClippedWallpaper);
      $("div.tile-list-inner-container")
        .css("--wallpaper-src", "")
        .removeClass("wallpaper-behind");
    },
  },
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
window.addEventListener('message', (event) => {
  if (event.data["action"]) {
    if (event.data.action == "setTheme") {
      backendMethods.setTheme(event.data.argument);
    } else if (event.data.action == "setAccentColor") {
      backendMethods.setAccentColor(event.data.argument);
    } else if (event.data.action == "setTileColumns") {
      backendMethods.setTileColumns(event.data.argument);
      backendMethods.homeConfiguration.save()
    }else if (event.data.action == "reloadApp") {
      window.location.reload()
    }
  }
});

export default { boardMethods, backendMethods };
