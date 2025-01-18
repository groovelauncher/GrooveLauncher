import "./script.js"
function m_pointer() {
    document.body.classList.add("mock-pointer")
    if (document.querySelector("div#m_pointer_0000HELLYEAH")) return document.querySelector("div#m_pointer_0000HELLYEAH")
    const p = document.createElement("div")
    p.id = "m_pointer_0000HELLYEAH"
    p.style.cssText = `
        position: fixed;
        transform: translate(-50%, -50%);
        z-index: 999999999;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        pointer-events: none;
        background: rgb(255, 255, 255, .5);
        box-shadow: inset 0px 0px 0px 2px rgb(255, 255, 255, .5;
    `
    document.body.append(p)
    return p
}
document.body.addEventListener("pointerenter", (e) => {
    const p = m_pointer()
    p.style.left = e.pageX + "px"
    p.style.top = e.pageY + "px"
})
window.addEventListener("pointermove", (e) => {
    const p = m_pointer()
    p.style.left = e.pageX + "px"
    p.style.top = e.pageY + "px"
})
document.body.addEventListener("pointerleave", (e) => {
    const p = m_pointer()
    p.remove()
})