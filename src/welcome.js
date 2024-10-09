import GrooveMock from "./scripts/GrooveMock.js";
import jQuery from "jquery";
window.$ = jQuery
const GrooveMockInstance = !window.Groove
import {GrooveScroll} from "./scripts/overscrollFramework.js";
if (GrooveMockInstance) {
    window.Groove = new GrooveMock("./mock/apps.json")
    document.body.classList.add("groove-mock")
}
import detectDeviceType from "./scripts/detectDeviceType";
import GrooveBoard from "./scripts/GrooveBoard";
window.GrooveBoard = GrooveBoard
import clickDetectorConfig from "./scripts/clickDetector.js";

$(window).on("systemInsetsChange", function () {
    GrooveBoard.backendMethods.refreshInsets()
})
GrooveBoard.backendMethods.refreshInsets()
setTimeout(() => {
    var firstpage = $(".setup-page").eq(0)
    firstpage.addClass("active").addClass("button-anim")
    setTimeout(() => {
        firstpage.removeClass("button-anim")
    }, 500);
}, 1000);
window.currentPage = 0
function goToPage(index) {
    if(index == 0){
        $("#background").removeClass("hide")
    }else{
        $("#background").addClass("hide")
    }
    const oldpage = currentPage
    currentPage = index
    $(".setup-page").eq(0).css("opacity","")
    const p0 = $(".setup-page").eq(oldpage)
    const p1 = $(".setup-page").eq(index)
    p0.removeClass("active")
    if (index > oldpage) {
        p0.addClass("leave-0")
        p1.addClass("enter-0")
    } else {
        p0.addClass("leave-1")
        p1.addClass("enter-1")
    }
    setTimeout(() => {
        p0.removeClass("leave-0 leave-1 enter-0 enter-1 active")
        p1.removeClass("leave-0 leave-1 enter-0 enter-1")
        p1.addClass("active")
        p1.addClass("active").addClass("button-anim")
        setTimeout(() => {
            p1.removeClass("button-anim")
        }, 500);
    }, 800);
}
window.goToPage = goToPage
/*const alert = GrooveBoard.alert(
    "Welcome back :)",
    "You've successfully updated your launcher.",
    [{ title: "Next", style: "default",inline: true, action: () => { } }]
);*/
//alert.querySelector("button").style.visibility = "hidden"
console.log(alert)

function finishSetup() {
    
}
const accent_color_scroller = new GrooveScroll("div.accent-color-catalogue")
$("div.accent-color-catalogue-item").on("flowClick",function () {
    $("div.accent-color-catalogue-item").removeClass("selected")
    $(this).addClass("selected")
})