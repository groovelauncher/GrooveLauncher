const GrooveElements = {
    wHomeTile: wHomeTile,
    wAppTile: wAppTile,
    wLetterTile: wLetterTile
}
function wHomeTile(imageIcon = false, icon = "", title = "Unknown", packageName = "com.unknown", color = "default") {
    const homeTile = document.createElement("div")
    homeTile.classList.add("groove-element")
    homeTile.classList.add("groove-home-tile")
    homeTile.setAttribute("imageIcon", imageIcon)
    homeTile.setAttribute("icon", icon)
    homeTile.setAttribute("title", title)
    homeTile.setAttribute("packageName", packageName)
    homeTile.setAttribute("color", color)
    homeTile.style.backgroundColor = color
    homeTile.innerHTML = `
    ${imageIcon ? `
            <img class="groove-element groove-home-tile-imageicon" src="">
        `: `
            <p class="groove-element groove-home-tile-icon"></p>
        `
        }
        <p class="groove-element groove-home-tile-title"></>
    `
    if (imageIcon) homeTile.querySelector("p.groove-home-tile-icon").innerText = icon; else homeTile.querySelector("img.groove-home-tile-imageicon").src = icon;
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
    const el = wAppTile(false,letter,"","")
    el.querySelector(".groove-app-tile-title").remove()
    el.classList.add("groove-letter-tile")
    el.removeAttribute("title")
    el.removeAttribute("packageName")
    return el
}
export default GrooveElements;