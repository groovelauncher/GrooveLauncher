document.querySelector("div.reduce-motion-toggle-switch > div > .metro-toggle-switch").addEventListener("checked", (e) => {
    e.target.parentNode.parentNode.querySelector("p").innerText = e.target.hasAttribute("checked") ? "On" : "Off"
    appViewEvents.setReduceMotion(e.target.hasAttribute("checked"))
})


function handleFileInput(event) {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.ttf')) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const fontData = new Uint8Array(e.target.result);
            fontStore.saveFont(file.name, fontData).then(() => {
                //alert('Font saved successfully!');
                document.getElementById("font-chooser").selectOption(2)
                parent.GrooveBoard.backendMethods.font.set(2)
                document.getElementById("clearfont").style.visibility = "visible"
                document.querySelector("#font-chooser > div:nth-child(3) > span.name").innerText = localStorage["customFontName"] || "custom font"
                lastX = -9999
                setTimeout(() => {
                    lastX = -9999
                }, 100);
            });
        };
        reader.onerror = function () {
            parent.GrooveBoard.alert(
                "Can’t load font",
                "We couldn’t read the font file. Only .ttf fonts are supported. Please try a different file.",
                [, { title: "Ok", style: "default", inline: true, action: () => { } }]
            );
        };

        reader.readAsArrayBuffer(file);
    } else {
        parent.GrooveBoard.alert(
            "Unsupported file format",
            "The font file isn’t valid. Make sure it’s a .ttf file and try uploading again.",
            [, { title: "Ok", style: "default", inline: true, action: () => { } }]
        );
    }
}
document.getElementById("font-chooser").querySelector("input").addEventListener('change', handleFileInput);
// Attach the event listener to the file input
document.getElementById("display-scaling-chooser").addEventListener("selected", (e) => {
    const options = [.8, .9, 1, 1.1, 1.25]
    appViewEvents.setUIScale(options[e.detail.index])
})
document.getElementById("font-chooser").addEventListener("selected", (e) => {
    const index = e.detail.index
    const lastOne = index == document.getElementById("font-chooser").children.length - 1
    if (lastOne) {
        fontStore.hasFont().then(value => {
            if (value) {
                parent.GrooveBoard.backendMethods.font.set(2)
            } else {
                document.getElementById("font-chooser").selectOption(e.detail.prevIndex)
                document.getElementById("font-chooser").querySelector("input").dispatchEvent(new MouseEvent("click"))
            }
        })
    } else {
        parent.GrooveBoard.backendMethods.font.set(index)
    }
    lastX = -9999
    setTimeout(() => {
        lastX = -9999
    }, 100);
})

setTimeout(() => {
    if (localStorage["reducedMotion"] == "true") {
        document.querySelector("div.reduce-motion-toggle-switch > p").innerText = "On"
        document.querySelector("div.reduce-motion-toggle-switch > div > .metro-toggle-switch").setAttribute("checked", "")
        document.body.classList.add("reduced-motion")
    }
    if (!!localStorage.getItem("UIScale")) {
        const uiscale = Number(localStorage.getItem("UIScale"))
        document.getElementById("display-scaling-chooser").selectOption(uiscale == .8 ? 0 : uiscale == .9 ? 1 : uiscale == 1 ? 2 : uiscale == 1.1 ? 3 : 4)
    }
    if (!!localStorage.getItem("font")) {
        const font = Number(localStorage.getItem("font"))
        document.getElementById("font-chooser").selectOption(font)
        setFont(font)
        fontStore.hasFont().then((value) => {
            if (value) {
                document.getElementById("clearfont").style.visibility = "visible"
                document.querySelector("#font-chooser > div:nth-child(3) > span.name").innerText = localStorage["customFontName"] || "custom font"

            } else {
                document.getElementById("clearfont").style.visibility = "hidden"
            }
        });
    } else {
        document.getElementById("clearfont").style.visibility = "hidden"
    }
}, 500);    //reduce-motion-toggle-switch
if (!!localStorage.getItem("font")) {
    const font = Number(localStorage.getItem("font"))
    setFont(font)
}