const snowStorm = {
    start: () => {
        snowStorm.stop();
        const snowHolder = document.createElement("div")
        snowHolder.classList.add("snowHolder")
        snowHolder.innerHTML = `<div class="snow"></div>`.repeat(200)
        document.body.append(snowHolder)
    },
    stop: () => {
        const snowHolder = document.querySelector(".snowHolder")
        if (snowHolder) snowHolder.remove()
    },
    translate: (percentage) => {
        const snowHolder = document.querySelector(".snowHolder")
        if (!snowHolder) return;
        snowHolder.style.setProperty("--translate", percentage + "vw");
    }
}
export { snowStorm }
export function isChristmas() {
    const today = new Date();
    const start = new Date(today.getFullYear(), 11, 1); // December 1st
    const end = new Date(today.getFullYear(), 0, 6);   // January 6th

    return today >= start || today <= end;
}