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
const usedProperties = ["pointerdown", "lastPointerPosition", "supportsFlowTouch", "deletePropertiesTimeout"]
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
    clearTimeout(el.deletePropertiesTimeout)
    el.supportsFlowTouch = window.getComputedStyle(el).getPropertyValue("--flow-touch") == "true"
    el.classList.add("active")
    el.pointerDown = true
    el.lastPointerPosition = [e.pageX, e.pageY]
    if (el.supportsFlowTouch) {
        el.style.setProperty("--flow-rotate-x", "0deg")
        el.style.setProperty("--flow-rotate-y", "0deg")
        el.style.setProperty("--flow-rotate-z", "0deg")
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
            if (el.classList.contains("metro-toggle-switch")) {
                clearInterval(el.mtsanim)
                clearTimeout(el.mtstime)
                const isChecked = el.hasAttribute("checked")
                const animstart = Date.now()
                const duration = 200
                if (isChecked) {
                    el.removeAttribute("checked")
                } else {
                    el.setAttribute("checked", "")
                }
                el.mtsanim = setInterval(() => {
                    var transition = (Date.now() - animstart) / duration
                    transition = transition > 1 ? 1 : transition < 0 ? 0 : transition
                    el.style.setProperty("--transition", isChecked ? easing.easeInExpo(1 - transition) : easing.easeOutExpo(transition))
                }, 0)
                el.mtstime = setTimeout(() => {
                    clearInterval(el.mtsanim)
                    el.style.removeProperty("--transition")
                    el.dispatchEvent(new CustomEvent("checked", { isChecked: isChecked }))
                }, duration)
            }
            el.dispatchEvent(event);
        }
        el.classList.remove("active")
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
})


export default clickDetectorConfig;