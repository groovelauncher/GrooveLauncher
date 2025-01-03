import jQuery from "jquery";
import GrooveBoard from "../GrooveBoard";
const $ = jQuery;
import perlin from "../perlin";

import { GridStack } from "gridstack";

window.GridStack = GridStack;
const tileListInnerContainer = document.querySelector(
  "div.tile-list-inner-container"
);
Math.pow2 = (x, y) => {
  return Math.pow(Math.abs(x), y) * (x > 0 ? 1 : -1)
}
const grid = GridStack.init({
  column: 4,
  disableResize: true,
  disableDrag: true,
  float: false,
  animate: false
});
var isDragging
var lastDragEl
function _removeDragScale(el) {
  el.style.removeProperty("width")
  el.style.removeProperty("height")
}
grid.on("dragstart", function (event, el) {
  // el.classList.add("grid-dragging")
  scrollers.tile_page_scroller.cancelScroll()
  lastDragEl = el
  isDragging = true
  _removeDragScale(el)
  /*$(el).css({
    left: $(el).position().left + 15,
    top: $(el).position().top + 15
  })*/
});
grid.on('drag', function (event, el) {
  console.log("bababa")
  Groove.triggerHapticFeedback("CLOCK_TICK")
  _removeDragScale(el)
});
grid.on('change', function (event, items) {
});
window.addEventListener("pointermove", (e) => {
  if (isDragging && false) {

    requestAnimationFrame(() => {
      $(lastDragEl).css({
        left: $(lastDragEl).position().left + 15,
        top: $(lastDragEl).position().top + 15
      })
    })
    lastDragEl.style.removeProperty("width")
    lastDragEl.style.removeProperty("height")
  }
})
grid.on("dragstop", function (event, el) {
  setTimeout(() => {
    GrooveBoard.backendMethods.homeConfiguration.save()
  }, 500);
  isDragging = false
  //$("div.groove-home-tile.grid-dragging").removeClass("grid-dragging").css("transition", "")
});
window.tileListGrid = grid;
var homeTileEditEnabled = false;
function hashStringToNumber(str, max) {
  try {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to a 32-bit integer
    }
    // Ensure the hash is positive
    hash = Math.abs(hash);
    // Map to a range between 0 and 500
    return hash % (max || 100);
  } catch (error) {
    return 0
  }
}
const homeTileEditSwitch = {
  on: (immediate = false, callback = () => { }) => {
    clearTimeout(window.homeTileEditTimeout)
    window.homeTileEditTimeout = setTimeout(() => { homeTileEditSwitch.off() }, 30000);
    GrooveBoard.backendMethods.navigation.push(
      "homeTileMenuOn",
      () => { },
      homeTileEditSwitch.off
    );
    scrollers.main_home_scroller.enabled = false;
    homeTileEditEnabled = true;
    tileListGrid.enableMove(true);
    $("div.groove-home-tile").removeClass("home-menu-selected");
    $("div.tile-list-page").addClass("home-menu-back-intro");
    if (immediate) {
      $("div.tile-list-page")
        .addClass("home-menu-back")
        .removeClass("home-menu-back-intro");
      if (callback && typeof callback == "function") callback();
      shakeDistanceModifier.on();
    } else {
      window.homeTileMenuCreationSecondTimeout = setTimeout(() => {
        $("div.tile-list-page")
          .addClass("home-menu-back")
          .removeClass("home-menu-back-intro");
        if (callback && typeof callback == "function") callback();
        shakeDistanceModifier.on();
        Groove.triggerHapticFeedback("CONFIRM")
      }, 500);
    }
    perlin.seed()
    const homeTileEditShakeStart = Date.now()
    window.homeTileEditShake = setInterval(() => {

      tileListGrid.engine.nodes.forEach(e => {
        const packageName = e.el.getAttribute("packagename")
        const distance = (Date.now() - homeTileEditShakeStart) / (2000 + hashStringToNumber(packageName, 1000))
        const hash = hashStringToNumber(e.el.getAttribute("packagename"), 500)
        e.el.style.setProperty("--shake-x",
          perlin.get(distance, hash) * 1.5
          * 10
          + "px")
        e.el.style.setProperty("--shake-y",
          perlin.get(distance, hash + 1000) * 1.5
          * 10
          + "px")
      })

    }, 0);
  },
  off: (immediate) => {
    clearTimeout(window.homeTileEditTimeout)
    clearInterval(window.homeTileEditShake)

    GrooveBoard.backendMethods.navigation.invalidate("homeTileMenuOn");
    shakeDistanceModifier.off();
    $("div.groove-home-tile").removeClass("home-menu-selected");

    $("div.tile-list-page").addClass("home-menu-back-outro");
    scrollers.main_home_scroller.enabled = true;
    homeTileEditEnabled = false;
    tileListGrid.enableMove(false);
    clearTimeout(window.homeTileMenuCreationFirstTimeout);
    clearTimeout(window.homeTileMenuCreationSecondTimeout);
    $("div.groove-home-menu").remove();

    $("div.tile-list-page").removeClass("home-menu-back home-menu-back-intro");
    window.homeTileMenuDestroyTimeout = setTimeout(() => {
      homeTileMenuClean();
      $("div.tile-list-page").removeClass("home-menu-back-outro");
    }, 500);
  },
};
const shakeDistanceModifier = {
  on: () => {
    $({ someValue: 0 }).animate(
      { someValue: 5 },
      {
        duration: 200,
        step: function () {
          $("body").css("--shake-distance", this.someValue / 1.5 + "px");
          $("body").css(
            "--shake-scale-distance",
            (1 - this.someValue / 5) * 0.05 + 0.95
          );
        },
      }
    );
  },
  off: () => {
    $({ someValue: 5 }).animate(
      { someValue: 0 },
      {
        duration: 100,
        step: function () {
          $("body").css("--shake-distance", this.someValue / 1.5 + "px");
          $("body").css(
            "--shake-scale-distance",
            (1 - this.someValue / 5) * 0.05 + 0.95
          );
        },
      }
    );
  },
};

window.homeTileEditSwitch = homeTileEditSwitch;

$("#app-page-icon").on("flowClick", function () {
  window.scrollers.main_home_scroller.scrollTo(-window.innerWidth, 0, 750);
  $("#search-icon").addClass("shown");
});

const resizeObserver = new ResizeObserver((entries) => {
  for (let entry of entries) {
    GrooveBoard.backendMethods.scaleTiles();
    if (window["scrollers"]) scrollers.tile_page_scroller.refresh();
  }
});
resizeObserver.observe(document.querySelector("div.tile-list-inner-container"));

$(window).on("click", function (e) {
  if (
    e.target.classList.contains("groove-home-tile") &&
    !e.target.classList.contains("groove-letter-tile")
  ) {
    if ($("div.tile-list-page").hasClass("home-menu-back")) {
      $("div.groove-home-tile").removeClass("home-menu-selected");
      e.target.classList.add("home-menu-selected");
      GrooveBoard.boardMethods.createTileMenu(e.target);
    } else if (e.target.canClick) {
      e.target.classList.add("app-transition-selected");
      appTransition.onPause();
      const packageName = e.target.getAttribute("packageName")
      setTimeout(() => {
        Groove.launchApp(packageName);
      }, (packageName.startsWith("groove.internal") && false ? 500 : 1000) * window.animationDurationScale);
    }
  } else if (
    e.target ==
    document.querySelector("#main-home-slider > div > div:nth-child(1)") ||
    e.target.classList.contains("tile-list-container") ||
    e.target.classList.contains("home-menu-back") ||
    e.target.classList.contains("home-menu-back-intro") ||
    e.target.classList.contains("app-page-icon-banner")
  ) {
    //  if (homeTileEditEnabled) homeTileEditSwitch.off()
  }
});

$(window).on("pointerdown", function (e) {
  if (homeTileEditEnabled) {
    clearTimeout(window.homeTileEditTimeout)
    window.homeTileEditTimeout = setTimeout(() => { homeTileEditSwitch.off() }, 30000);
  }
  if (e.target.classList.contains("groove-home-tile") && !homeTileEditEnabled) {
    e.target.canClick = true;
    e.target.homeTileMenuState = false;
    e.target.appRect = e.target.getBoundingClientRect();
    clearTimeout(window.homeTileMenuCreationFirstTimeout);
    clearTimeout(window.homeTileMenuCreationSecondTimeout);
    $("div.groove-home-menu").remove();
    window.homeTileMenuCreationFirstTimeout = setTimeout(() => {
      e.target.canClick = false;

      homeTileEditSwitch.on(false, () => {
        e.target.classList.add("home-menu-selected");
        GrooveBoard.boardMethods.createTileMenu(e.target);
        generateShakeAnimations();
        e.target.homeTileMenuState = true;
        e.target.dispatchEvent(new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
          clientX: e.target.getBoundingClientRect().left,
          clientY: e.target.getBoundingClientRect().top
        }));
        e.target.dispatchEvent(new TouchEvent('touchstart', {
          bubbles: true,
          cancelable: true,
          clientX: e.target.getBoundingClientRect().left,
          clientY: e.target.getBoundingClientRect().top
        }));
        e.target.dispatchEvent(new PointerEvent('pointerdown', {
          bubbles: true,
          cancelable: true,
          clientX: e.target.getBoundingClientRect().left,
          clientY: e.target.getBoundingClientRect().top
        }));
      });
      e.target.classList.add("home-menu-selected");
    }, 500);
  } else if (
    e.target.classList.contains("groove-home-tile") &&
    homeTileEditEnabled
  ) {
    $("div.groove-home-tile").removeClass("home-menu-selected");
    e.target.classList.add("home-menu-selected");
    GrooveBoard.boardMethods.createTileMenu(e.target);
  }
});
$(
  "#main-home-slider > div > div.slide-page, #main-home-slider > div > div.slide-page > div.inner-page, #main-home-slider > div > div.slide-page > div.inner-page > div.tile-list-container, div.tile-list-inner-container"
).on("flowClick", () => {
  if (homeTileEditEnabled) homeTileEditSwitch.off();
});
$(window).on("pointerup", function (e) {
  $("div.groove-home-tile").each((index, element) => {
    if (element["homeTileMenuState"] == false) {
      if (element["homeTileMenu"]) element["homeTileMenu"].remove();
      delete element["homeTileMenuState"];
      delete element["homeTileMenu"];
      delete element["appRect"];
      homeTileEditSwitch.off();
    } else if (element["homeTileMenuState"] == true) {
    }
  });
});

function homeTileMenuClean() {
  document.querySelectorAll(".groove-tile-menu").forEach((i) => i.remove());
  // GrooveBoard.backendMethods.navigation.invalidate("homeTileMenuOn")
  $("div.groove-home-tile").removeClass("home-menu-selected");
  clearTimeout(window.homeTileMenuCreationFirstTimeout);
  clearTimeout(window.homeTileMenuCreationSecondTimeout);
  $("div.tile-list-page").removeClass("home-menu-back-intro home-menu-back");
}
function appImmediateClose() {
  $("div.groove-home-tile").each((index, element) => {
    if (element["homeTileMenuState"] == false) {
      if (element["homeTileMenu"]) element["homeTileMenu"].remove();
      delete element["homeTileMenuState"];
      delete element["appRect"];
      homeTileMenuClean();
    } else if (element["homeTileMenuState"] == true) {
    }
  });
}

$(window).on("finishedLoading", () => {
  scrollers.tile_page_scroller.scroller.animater.hooks.on(
    "time",
    (duration) => {
      tileListInnerContainer.style.setProperty("--wallpaper-scroll-duration", duration + "ms")
    }
  );
  scrollers.tile_page_scroller.scroller.translater.hooks.on(
    "beforeTranslate",
    (point, ee) => {
      GrooveBoard.backendMethods.wallpaper.recalculateOffsets(ee);
    }
  );

  //GrooveBoard.backendMethods.wallpaper.load("./assets/wallpaper.jpg")
});
var wallpaperLastScroll = 0
var wallpaperScroll = 0
$(window).on("finishedLoading", () => {
  window.scrollers.tile_page_scroller.scroller.translater.hooks.on('translate', (e) => {
    if (!document.querySelector("div.slide-page-home.wallpaper-behind")) return;
    const deltaY = wallpaperLastScroll - e.y
    const inBoundaries = (scrollers.tile_page_scroller.y <= 125) && ((scrollers.tile_page_scroller.maxScrollY - scrollers.tile_page_scroller.y) <= 125)
    if (inBoundaries) wallpaperScroll += deltaY / 300;
    wallpaperScroll = wallpaperScroll < 0 ? 0 : wallpaperScroll > 1 ? 1 : wallpaperScroll
    //console.log(wallpaperScroll)
    document.querySelector("div.slide-page-home.wallpaper-behind").style.setProperty("background-position", `50% ${(wallpaperScroll) * -100}px`)
    wallpaperLastScroll = e.y


    $("div.groove-home-tile").each((index, element) => {
      if (element["homeTileMenuState"] == false) {
        if (element["homeTileMenu"]) element["homeTileMenu"].remove();
        delete element["homeTileMenuState"];
        delete element["homeTileMenu"];
        delete element["appRect"];
        homeTileEditSwitch.off();
      } else if (element["homeTileMenuState"] == true) {
      }
    });
  })
  window.scrollers.main_home_scroller.scroller.translater.hooks.on('translate', (e) => {

    $("div.groove-home-tile").each((index, element) => {
      if (element["homeTileMenuState"] == false) {
        if (element["homeTileMenu"]) element["homeTileMenu"].remove();
        delete element["homeTileMenuState"];
        delete element["homeTileMenu"];
        delete element["appRect"];
        homeTileEditSwitch.off();
      } else if (element["homeTileMenuState"] == true) {
      }
    });
  })
})

/*

const mask = document.querySelector("#wallpaper-mask")
const maskHolder = mask.querySelector("div.holder")
function generateWallpaperMask() {

  var scrollY = 0

  if (window["scrollers"]) {
    scrollY = scrollers.tile_page_scroller.y
    scrollY = scrollY >= 125 ? 125 : scrollY <= scrollers.tile_page_scroller.maxScrollY - 125 ? scrollers.tile_page_scroller.maxScrollY - 125 : scrollY

  }
  const tiles = document.querySelectorAll("div.groove-home-tile > div.groove-home-inner-tile");
  tiles.forEach(tile => {
    const computedStyle = window.getComputedStyle(tile.parentElement);
    const rect = {
      left: parseFloat(computedStyle.left) || 0 + tileListInnerContainer.offsetLeft,
      top: (parseFloat(computedStyle.top) || 0) + scrollY,
      width: (parseFloat(computedStyle.width) - 12) || 0,
      height: (parseFloat(computedStyle.height) - 10) || 0
    };
    //console.log(tile.parentElement.style.left, tile.parentElement.style.top)
    let doppelganger = Array.from(maskHolder.children).find(d => d.master === tile);

    if (!doppelganger) {
      doppelganger = document.createElement('div');
      doppelganger.classList.add("doppelganger")
      doppelganger.master = tile;
      maskHolder.appendChild(doppelganger);
    }
    doppelganger.style.left = rect.left + 'px';
    doppelganger.style.top = rect.top + 'px';
    doppelganger.style.width = rect.width + 'px';
    doppelganger.style.height = rect.height + 'px';
  });

  // Remove doppelgangers whose masters no longer exist
  Array.from(maskHolder.children).forEach(doppelganger => {
    if (!Array.from(tiles).includes(doppelganger.master)) {
      maskHolder.removeChild(doppelganger);
    }
  });
  //setTimeout(() => { requestAnimationFrame(generateWallpaperMask) }, 1000)
}

var wallpaperMaskAutoUpdate = true
function updateWallpaperMask() {
  if (wallpaperMaskAutoUpdate) {
    generateWallpaperMask()
    requestAnimationFrame(updateWallpaperMask)
  }
}
updateWallpaperMask()

setTimeout(() => {
  scrollers.tile_page_scroller.scroller.translater.hooks.on(
    "beforeTranslate",
    (point, ee) => {
      generateWallpaperMask()
    }
  );
}, 500);*/