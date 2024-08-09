import jquery from "jquery"
const $ = jquery
const clickDetectorConfig = {
    tapDistanceThreshold: 5,
    touchUpDistanceThreshold: 200
}
var pointerDownElements = {}
const getElementFromPointerId = (pid) => Object.entries(pointerDownElements).filter(e => e[0] == String(pid))[0][1]
window.pointerDownElements = pointerDownElements
const usedProperties = ["pointerdown", "lastPointerPosition", "supportsFlowTouch"]
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
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const result = [centerX - pageX, centerY - pageY]
        result[0] = Math.min(Math.max(result[0], -100), 100)
        result[1] = Math.min(Math.max(result[1], -100), 100)
        el.style.setProperty("--flow-rotate-x", result[0] * -5 / Math.pow(rect.width, 1) + "deg")
        el.style.setProperty("--flow-rotate-y", result[1] * 5 / Math.pow(rect.height, 1) + "deg")
    }
}
window.addEventListener("pointerdown", (e) => {
    const el = e.target
    el.supportsFlowTouch = window.getComputedStyle(el).getPropertyValue("--flow-touch") == "true"
    el.classList.add("active")
    console.log(e.pointerId)
    el.pointerDown = true
    el.lastPointerPosition = [e.pageX, e.pageY]
    if (el.supportsFlowTouch) {
        el.style.setProperty("--flow-rotate-x", "0deg")
        el.style.setProperty("--flow-rotate-y", "0deg")
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
        }
        el.classList.remove("active")
        deleteProperties(el)
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
    //console.log(hypotenuse)
})


export default clickDetectorConfig;