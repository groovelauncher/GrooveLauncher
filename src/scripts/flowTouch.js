import jquery from "jquery"
import easing from "./easings"
const $ = jquery
const clickDetectorConfig = {
    tapDistanceThreshold: 5,
    touchUpDistanceThreshold: 200
}
var pointerDownElements = {}
const getElementFromPointerId = (pid) => Object.entries(pointerDownElements).filter(e => e[0] == String(pid))[0][1]
window.pointerDownElements = pointerDownElements
const usedProperties = ["pointerdown", "lastPointerPosition", "supportsFlowTouch", "deletePropertiesTimeout", "checked", "lastDragTransition"]
const usedStyleProperties = ["flow-rotate-x", "flow-rotate-y"]
function deleteProperties(el) {
    usedProperties.forEach(property => {
        delete el[property]
    });
    usedStyleProperties.forEach(property => {
        el.style.removeProperty("--" + property)
    });
}
function flowTouchRotate(el, pageX, pageY) {
    if (el.supportsFlowTouch) {
        const rect = el.getBoundingClientRect();
        //const boxcenter = [el.offsetLeft + el.offsetWidth * .5, el.offsetTop + el.offsetHeight * .5]
        const boxcenter = [rect.left + rect.width * .5, rect.top + rect.height * .5]
        const boxhypotenuse = Math.sqrt(Math.pow(rect.width, 2) + Math.pow(rect.height, 2))
        const distance = [boxcenter[0] - pageX, boxcenter[1] - pageY]
        const hypotenuse = Math.sqrt(distance[0] * distance[0] + distance[1] * distance[1])
        const perspective = 500
        const maxDegree = 20
        var rotateX = Math.atan(hypotenuse / perspective) * (180 / Math.PI);
        rotateX = rotateX > maxDegree ? maxDegree : rotateX <= -maxDegree ? -maxDegree : rotateX
        const rotateY = Math.atan(distance[0] / distance[1]) * (180 / Math.PI) + (distance[1] <= 0 ? (distance[0] < 0 ? -180 : 180) : 0) //-15
        // Set the CSS variables

        el.style.setProperty("--flow-rotate-x", rotateX + "deg")
        el.style.setProperty("--flow-rotate-y", rotateY + "deg")
    }
}
window.addEventListener("pointerdown", (e) => {

    const el = e.target
    if (el.classList.contains("metro-toggle-switch")) metroToggleSwitch.pointerDown(el);
    clearTimeout(el.deletePropertiesTimeout)
    el.supportsFlowTouch = window.getComputedStyle(el).getPropertyValue("--flow-touch") == "true"
    clearTimeout(el["activeRemoveTimeout"])
    el.classList.add("active")
    el.classList.add("e_active")
    el.pointerDown = true
    el.lastPointerPosition = [e.pageX, e.pageY]
    if (el.supportsFlowTouch) {
        el.style.setProperty("--flow-rotate-x", "0deg")
        el.style.setProperty("--flow-rotate-y", "0deg")
        el.style.setProperty("--flow-rotate-z", "0deg")
    }
    if (focusedElements.length) {
        focusedElements.forEach(element => {
            if (element !== event.target && !element.contains(event.target)) element.blurElement()
        });
    }
    pointerDownElements[e.pointerId] = el
    flowTouchRotate(el, e.pageX, e.pageY)

})
window.addEventListener("pointerup", (e) => {
    if (!!pointerDownElements[e.pointerId]) {
        const el = getElementFromPointerId(e.pointerId)
        const hypotenuse = Math.sqrt(Math.pow(el.lastPointerPosition[0] - e.pageX, 2) + Math.pow(el.lastPointerPosition[1] - e.pageY, 2))

        if (hypotenuse <= clickDetectorConfig.tapDistanceThreshold) {
            const event = new CustomEvent("flowClick", { pageX: e.pageX, pageY: e.pageY, target: el });
            el.dispatchEvent(event);

            if (el.classList.contains("metro-dropdown-menu")) { metroDropdownMenu.click(el) }
            if (el.classList.contains("metro-dropdown-option")) { metroDropdownMenu.select($(el).parent()[0], $(el).index()) }
            if (el.classList.contains("metro-toggle-switch")) metroToggleSwitch.pointerUp(el, true)
        } else {
            if (el.classList.contains("metro-toggle-switch")) metroToggleSwitch.pointerUp(el, false)
        }
        el.activeRemoveTimeout = setTimeout(() => {
            el.classList.remove("active")
        }, 250);
        el.classList.remove("e_active")

        el.deletePropertiesTimeout = setTimeout(() => {
            deleteProperties(el)
        }, 500);
        delete pointerDownElements[e.pointerId]

    }

})
window.addEventListener("pointermove", (e) => {
    if (!pointerDownElements[e.pointerId]) return
    const el = getElementFromPointerId(e.pointerId)
    const hypotenuse = Math.sqrt(Math.pow(el.lastPointerPosition[0] - e.pageX, 2) + Math.pow(el.lastPointerPosition[1] - e.pageY, 2))
    flowTouchRotate(el, e.pageX, e.pageY)
    if (hypotenuse > clickDetectorConfig.touchUpDistanceThreshold) {
        el.classList.remove("active")
        deleteProperties(el)
        delete pointerDownElements[e.pointerId]
    }

    if (el.classList.contains("metro-toggle-switch")) metroToggleSwitch.pointerMove(el, e)

})


const metroToggleSwitch = {
    animate: (el, from, to) => {
        clearInterval(el.mtsanim)
        clearTimeout(el.mtstime)
        const isChecked = true //!el.hasAttribute("checked")
        const animstart = Date.now()
        const duration = 200
        el.mtsanim = setInterval(() => {
            var transition = from + (to - from) * easing.easeOutExpo((Date.now() - animstart) / duration)
            // (to - from) + ((Date.now() - animstart) / duration) * to
            transition = transition > 1 ? 1 : transition < 0 ? 0 : transition
            el.style.setProperty("--transition", (transition))
        }, 0)
        el.mtstime = setTimeout(() => {
            clearInterval(el.mtsanim)
            el.style.removeProperty("--transition")
            el.dispatchEvent(new CustomEvent("checked", { detail: { isChecked: el.hasAttribute("checked") } }))
        }, duration)
    },
    toggle: (el) => {
        if (el.hasAttribute("checked")) metroToggleSwitch.uncheck(el); else metroToggleSwitch.check(el);
    },
    check: (el) => {
        el.setAttribute("checked", "")
        metroToggleSwitch.animate(el, el.lastDragTransition || 0, 1)
    },
    uncheck: (el) => {
        el.removeAttribute("checked")
        metroToggleSwitch.animate(el, el.lastDragTransition || 1, 0)
    },
    pointerDown: (el) => {
    },
    pointerMove: (el, e) => {
        const drag = e.pageX - el.lastPointerPosition[0]
        var transition = (el.hasAttribute("checked") ? 1 : 0) + drag / (el.offsetWidth - 20)
        transition = transition > 1 ? 1 : transition < 0 ? 0 : transition
        el.lastDragTransition = transition == 0 ? 0.001 : transition
        el.style.setProperty("--transition", (transition))
        //console.log(transition)
    },
    pointerUp: (el, click) => {
        if (click) {
            metroToggleSwitch.toggle(el)
        } else {
            metroToggleSwitch.toggle(el)
        }
    }
}
var focusedElements = new Set()
const metroDropdownMenu = {
    click: (el) => {
        el.blurElement = () => { metroDropdownMenu.blur(el) }
        focusedElements.add("el")
        el.classList.add("clicked")
        el.querySelector("div.metro-dropdown-option").style.marginTop = 0
        const children = el.querySelectorAll("div.metro-dropdown-option")
        el.style.height = children.length * 56 + "px"
        children[el.getAttribute("selected")].style.color = "var(--accent-color)"
    },
    blur: (el) => {
        if (focusedElements.has(el)) {
            focusedElements.remove(el)
            el.classList.remove("clicked")
        } else {
            el.classList.remove("clicked")
        }
        el.style.removeProperty("height")
        el.querySelectorAll("div.metro-dropdown-option").forEach(el => { el.style.removeProperty("color") })
    },
    select: (el, index, event = true, animate = true) => {
        const lastIndex = el.getAttribute("selected")
        el.setAttribute("selected", index)
        metroDropdownMenu.blur(el)
        const children = el.querySelectorAll("div.metro-dropdown-option")
        if (animate) {
            el.querySelector("div.metro-dropdown-option").style.removeProperty("transition")
        } else {
            el.querySelector("div.metro-dropdown-option").style.setProperty("transition", "0s")
        }
        el.querySelector("div.metro-dropdown-option").style.marginTop = index * -48 + "px"
        setTimeout(() => {
            el.querySelector("div.metro-dropdown-option").style.removeProperty("transition")
        }, 10);
        if (event) setTimeout(() => { el.dispatchEvent(new CustomEvent("selected", { detail: { index: index, prevIndex: lastIndex } })) }, 200);
    }
}
document.querySelectorAll("div.metro-dropdown-menu").forEach(el => {
    const index = el.getAttribute("selected") || 0
    el.selectOption = (index) => {
        metroDropdownMenu.select(el, index, false, false)
    }
    metroDropdownMenu.select(el, index, false)
})

export default clickDetectorConfig;


/*document.querySelector("div.first-page > div > div.group > div.picker").addEventListener("flowClick", (e) => {
    if (e.target.classList.contains("clicked")) {
        e.target.classList.remove("clicked")
    } else {
        e.target.classList.add("clicked")
    }
})

window.addEventListener('click', function (event) {
    if (!document.querySelector("div.first-page > div > div.group > div.picker").contains(event.target)) {
        document.querySelector("div.first-page > div > div.group > div.picker").classList.remove("clicked")
    }
});
document.querySelectorAll("div.first-page > div > div.group > div.picker div.picker-option").forEach(e => e.addEventListener("flowClick", (e) => {
    const index = Array.from(e.target.parentNode.children).indexOf(e.target)
    setTimeout(() => {
        appViewEvents.setTheme(1 - index)
    }, 200);
    document.querySelector("div.first-page > div > div.group > div.picker").setAttribute("selected", index)
    document.querySelector("div.first-page > div > div.group > div.picker").classList.remove("clicked")
}))*/