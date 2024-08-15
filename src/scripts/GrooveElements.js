import GrooveBoard from "./GrooveBoard"

const GrooveElements = {
    wHomeTile: wHomeTile,
    wAppTile: wAppTile,
    wLetterTile: wLetterTile,
    wAppMenu: wAppMenu,
    wTileMenu: wTileMenu,
}
function wHomeTile(imageIcon = false, icon = "", title = "Unknown", packageName = "com.unknown", color = "default", supportedSizes) {
    if (!supportedSizes) supportedSizes = ["s"]
    const homeTile = document.createElement("div")
    homeTile.classList.add("groove-element")
    homeTile.classList.add("groove-home-tile")
    homeTile.setAttribute("imageIcon", imageIcon)
    homeTile.setAttribute("icon", icon)
    homeTile.setAttribute("title", title)
    homeTile.setAttribute("packageName", packageName)
    homeTile.setAttribute("color", color)
    homeTile.setAttribute("supportedsizes", supportedSizes.join(","))
    homeTile.style.backgroundColor = color
    homeTile.innerHTML = `
    <div class="groove-element groove-home-inner-tile">
    ${imageIcon ? `
            <img class="groove-element groove-home-tile-imageicon" src="">
        `: `
            <p class="groove-element groove-home-tile-icon"></p>
        `
        }
        <p class="groove-element groove-home-tile-title"></>
    </div>
    `
    if (!imageIcon) homeTile.querySelector("p.groove-home-tile-icon").innerText = icon; else homeTile.querySelector("img.groove-home-tile-imageicon").src = icon;
    homeTile.querySelector("p.groove-home-tile-title").innerText = title
    return homeTile
}
function wAppTile(imageIcon = false, icon = "", title = "Unknown", packageName = "com.unknown") {
    const appTile = document.createElement("div")
    appTile.innerHTML = `
    ${imageIcon ? `
            <div class="groove-element groove-app-tile-icon"><img class="groove-element groove-app-tile-imageicon" src=""></div>
        `: `
            <p class="groove-element groove-app-tile-icon"></p>
        `
        }
        <p class="groove-element groove-app-tile-title"></>
    `
    appTile.classList.add("groove-element")
    appTile.classList.add("groove-app-tile")
    appTile.setAttribute("imageIcon", imageIcon)
    appTile.setAttribute("icon", icon)
    appTile.setAttribute("title", title)
    appTile.setAttribute("packageName", packageName)
    appTile.querySelector("p.groove-app-tile-title").innerText = title
    if (imageIcon) appTile.querySelector("img.groove-app-tile-imageicon").src = icon; else appTile.querySelector("p.groove-app-tile-icon").innerText = icon;

    return appTile
}
function wLetterTile(letter) {
    const el = wAppTile(false, letter, "", "")
    el.querySelector(".groove-app-tile-title").remove()
    el.classList.add("groove-letter-tile")
    el.removeAttribute("title")
    el.removeAttribute("packageName")
    return el
}
function wAppMenu(packageName, entries = {}) {

    const appMenu = document.createElement("div")
    appMenu.classList.add("groove-element")
    appMenu.classList.add("groove-app-menu")
    appMenu.classList.add("grid-stack-item")

    appMenu.setAttribute("packageName", packageName)
    Object.entries(entries).forEach(entry => {
        const appMenuEntry = document.createElement("div")
        appMenuEntry.classList.add("groove-element")
        appMenuEntry.classList.add("groove-app-menu-entry")
        appMenuEntry.addEventListener("flowClick", function (e) {
            appMenuClose()
            if (entry[1] && typeof entry[1] == "function") entry[1]()
        })
        appMenuEntry.innerText = entry[0]
        appMenu.appendChild(appMenuEntry)
    });
    return appMenu
}
function wTileMenu(el) {
    const appSizeDictionary = { s: [1, 1], m: [2, 2], w: [4, 2], l: [4, 4] }
    var currentSize = () => { try { return Object.entries(appSizeDictionary).filter(e => e[1][0] == el.gridstackNode.w && e[1][1] == el.gridstackNode.h)[0][0] } catch { return "l" } }

    const supportedSizes = el.getAttribute("supportedsizes").split(",")
    const tileMenu = document.createElement("div")
    var previousSize = () => {
        if (currentSize() == 0) {
            return supportedSizes.slice(-1)[0]
        } else if (supportedSizes[supportedSizes.indexOf(currentSize()) - 1]) {
            return supportedSizes[supportedSizes.indexOf(currentSize()) - 1]
        } else {
            return supportedSizes.slice(-1)[0]
        }
    }
    tileMenu.classList.add("groove-element")
    tileMenu.classList.add("groove-tile-menu")
    tileMenu.setAttribute("packageName", el.getAttribute("packageName"))
    tileMenu.innerHTML = `
   <div class="groove-tile-menu-button groove-tile-menu-unpin-button"><p>󰐃</p></div>
   <div class="groove-tile-menu-button groove-tile-menu-resize-button"><p>󰁍</p></div>
   `
    tileMenu.querySelector("div.groove-tile-menu-unpin-button").addEventListener("flowClick", e => {
        el.classList.add("delete-anim")
        setTimeout(() => {
            tileListGrid.removeWidget(el)
            if (document.querySelector("div.tile-list-inner-container").getAttribute("gs-current-row") == "0") {
                homeTileEditSwitch.off()
            }
        }, 200);
    })
    tileMenu.querySelector("div.groove-tile-menu-resize-button").addEventListener("flowClick", (e) => {
        GrooveBoard.backendMethods.resizeTile(el, previousSize(), true)
        updateButton()
    })
    function updateButton() {
        tileMenu.querySelector("div.groove-tile-menu-resize-button > p").style.setProperty("transform", `rotate(${currentSize() == "l" ? 90 : currentSize() == "w" ? 0 : currentSize() == "m" ? 45 : 225
            }deg)`)
    }
    updateButton()

    return tileMenu
}
export default GrooveElements;