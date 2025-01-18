import { css as beautifyCss } from 'js-beautify';
import * as sass from "sass";
window.sass = sass
window.beautifyCss = beautifyCss
const editor = CodeMirror.fromTextArea(document.getElementById('cssEditor'), {
    mode: 'text/x-scss',
    lineNumbers: true,
    theme: 'base16-dark',
    indentUnit: 4, // Sets tab width to 4 spaces
    tabSize: 4,    // Adjusts the tab size display
    indentWithTabs: false, // Use spaces instead of actual tab characters
});
window.editor = editor
editor.display.wrapper.classList.add('code-editor');
function refreshPreview() {
    const css = editor.getValue();
    const preview = document.getElementById('previewArea');
    const style = document.createElement('style');
    style.textContent = css;
    preview.innerHTML = '';
    preview.appendChild(style);
    const element = document.createElement(document.getElementById('elementSelector').value);
    element.textContent = 'Preview Element';
    preview.appendChild(element);
}
var scale = 1
function rescale() {
    const preview = document.querySelector('div.preview');
    const device = document.getElementById('device');
    const previewWidth = preview.getBoundingClientRect().width;
    const previewHeight = preview.getBoundingClientRect().height;
    const originalSize = {
        width: 376 / (376 / 480) + 100,
        height: 745.8 / (376 / 480) + 100,
    }
    const deviceWidth = originalSize.width;
    const deviceHeight = originalSize.height;

    const scaleWidth = previewWidth / deviceWidth;
    const scaleHeight = previewHeight / deviceHeight;
    scale = Math.min(.75, Math.min(scaleWidth, scaleHeight));

    device.style.transform = `scale(${scale})`;
    console.log(scale)
}

window.addEventListener('resize', rescale);
rescale();

var resizing = false
var lastSize = 50
document.querySelector("div.CodeMirror-gutter").addEventListener("pointerdown", (e) => {
    resizing = e.pageX
    lastSize = (document.querySelector("div.editor").clientWidth / window.innerWidth * 100) || editorSize
    document.body.classList.add("resizing")
})
var editorSize = 50
window.addEventListener("pointermove", (e) => {
    if (resizing) {
        console.log(e.pageX - resizing)
        const sc = (e.pageX - resizing) / window.innerWidth * 100
        editorSize = (lastSize - sc) || 0
        editorSize = (editorSize || 0)
        editorSize = editorSize < 0 ? 0 : editorSize > 100 ? 100 : editorSize
        localStorage.te_editor_size = editorSize
        document.querySelector("div.editor").style.width = editorSize + "%"
        rescale()
    }
})
window.addEventListener("pointerup", () => {
    resizing = false
    document.body.classList.remove("resizing")
})
if (localStorage.te_editor_size) {
    editorSize = localStorage.te_editor_size
    lastSize = localStorage.te_editor_size
    document.querySelector("div.editor").style.width = localStorage.te_editor_size + "%"
    rescale()
}

const toastContainer = document.createElement('div');
toastContainer.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    display: flex;
    flex-direction: column-reverse;
    gap: 10px;
    z-index: 9999;
    display:flex;
    align-items:end;
`;
document.body.appendChild(toastContainer);

function showToast(message, duration = 3000, color = "rgba(0, 0, 0, 0.8)") {
    const toast = document.createElement('div');
    toast.style.cssText = `
        background: linear-gradient(90deg,${color}, rgba(0, 0, 0, 0.8)), linear-gradient(90deg,rgba(0, 0, 0, 0.8),rgba(0, 0, 0, 0.8));
        color: white;
        padding: 12px 24px;
        border-radius: 999px;
        transition: all 0.3s ease-in-out;
        opacity: 0;
        width:max-content;
    `;
    toast.textContent = message;
    toastContainer.appendChild(toast);

    // Force reflow to enable transition
    toast.offsetHeight;
    toast.style.opacity = '1';
    toast.addEventListener("click", () => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toastContainer.removeChild(toast), 300);
    })
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toastContainer.removeChild(toast), 300);
    }, duration);
}
window.addEventListener('keydown', (e) => {
    if (!editor.state.focused) return
    if ((e.shiftKey && e.altKey && e.code === 'KeyF') ||
        (e.ctrlKey && e.shiftKey && e.code === 'KeyI')) {
        e.preventDefault();
        // editor.setValue(editor.getValue().trim());
        const cursor = editor.getCursor();
        editor.setValue(beautifyCss(editor.getValue(), { indent_size: 4, space_in_empty_paren: true }));
        editor.setCursor(cursor);
        //editor.setValue(formatted);
        showToast('Style formatted');
    }
    if ((e.metaKey || e.ctrlKey) && e.code === 'KeyS') {
        e.preventDefault();
        localStorage.te_style = editor.getValue()
        showToast('Style saved');
    }
});
if (localStorage.te_style) editor.setValue(localStorage.te_style);
var selectorOn = false
document.querySelector("#selectorBtn").addEventListener("click", (e) => {
    if (!selectorOn) e.target.style.backgroundColor = "var(--metro-color-violet)";
    else e.target.style.removeProperty("background-color")
    document.querySelector("div.preview").classList[selectorOn ? "remove" : "add"]("selector-mode")
    selectorOn = !selectorOn

    const iframeWindow = document.querySelector("iframe").contentWindow;
    iframeWindow.document.body.classList[!selectorOn ? "remove" : "add"]("selector-mode")

})
let currentBlobUrl = null;
async function uninstallThemes() {
    // Get the iframe's window context
    const iframeWindow = document.querySelector("iframe").contentWindow;
    iframeWindow.GrooveBoard.backendMethods.destroyInternalApp("groove.internal.tweaks")
    await iframeWindow.styleManagerInstance.removeAll()
}
var lastcsstext = ""
function compile() {
    const cssText = editor.getValue()
    const titleMatch = cssText.match(/\/\* title: (.*?) \*\//);
    const authorMatch = cssText.match(/\/\* author: (.*?) \*\//);
    const iconMatch = cssText.match(/\/\* icon: (.*?) \*\//);
    const descriptionMatch = cssText.match(/\/\* description: (.*?) \*\//);

    let metadata = {
        title: titleMatch ? titleMatch[1] : 'No title',
        author: authorMatch ? authorMatch[1] : 'No author',
        icon: iconMatch ? iconMatch[1] : 'No icon',
        description: descriptionMatch ? descriptionMatch[1] : 'No description',
    };
    const showWarning = lastcsstext != cssText
    lastcsstext = cssText
    console.log("metadata", titleMatch, metadata)
    if (titleMatch == null) {
        const cursor = editor.getCursor()
        cursor.line += 2
        editor.setValue(`/* title: Unnamed Style */\n\n` + editor.getValue())
        editor.setCursor(cursor)
        showToast("No title specified!", 10000, "var(--metro-color-red)")
        throw new Error("No title specified!");
    } else if (metadata.title == "Unnamed Style" || metadata.title == "No title") {
        if (showWarning) showToast("No title specified!", 5000, "var(--metro-color-yellow)")
    }
    if (metadata.author == "No author") {
        if (showWarning) showToast("No author specified!", 5000, "var(--metro-color-yellow)")
    }
    if (metadata.icon == "No icon") {
        if (showWarning) showToast("No icon specified!", 5000, "var(--metro-color-yellow)")
    }
    if (metadata.description == "No description") {
        if (showWarning) showToast("No description specified!", 5000, "var(--metro-color-yellow)")
    }
    try {
        return sass.compileString(editor.getValue()).css
    } catch (error) {
        setTimeout(() => {
            document.querySelector("#runBtn").style.removeProperty("background-color")
        }, 500);
        editor.setCursor({
            line: error.span.start.line,
            ch: error.span.start.column
        })
        showToast(error.message, 10000, "var(--metro-color-red)")
        editor.focus()
        throw new Error()
    }
}
async function preview() {

    await uninstallThemes()
    const iframeWindow = document.querySelector("iframe").contentWindow;
    // Revoke the old blob URL if it exists
    if (currentBlobUrl) {
        iframeWindow.URL.revokeObjectURL(currentBlobUrl);
    }

    // Create new blob from editor content using the iframe's window
    const css = editor.getValue();
    const blob = new iframeWindow.Blob([css], { type: 'text/css' });
    currentBlobUrl = iframeWindow.URL.createObjectURL(blob);

    showToast('CSS blob URL created: ' + currentBlobUrl);
    console.log(currentBlobUrl);
    iframeWindow.Groove.launchApp(`groove.internal.tweaks?installStyle=${currentBlobUrl}`)
}
async function run(css) {
    try {


        document.querySelector("#runBtn > i").classList.remove("fa-play")
        document.querySelector("#runBtn > i").classList.add("fa-stop")

        await uninstallThemes()

        const iframeWindow = document.querySelector("iframe").contentWindow;
        iframeWindow.styleManagerInstance.installStyle(css)
        iframeWindow.GrooveBoard.backendMethods.refreshStyles()
        setTimeout(() => {
            iframeWindow.GrooveBoard.backendMethods.refreshStyles()
        }, 500);
        setTimeout(() => {
            iframeWindow.GrooveBoard.backendMethods.refreshStyles()
        }, 1000);
        isRunning = !isRunning
    } catch (error) {
        isRunning = false

        document.querySelector("#runBtn > i").classList.add("fa-play")
        document.querySelector("#runBtn > i").classList.remove("fa-stop")
    }
}
var isRunning = false
document.querySelector("#runBtn").addEventListener("click", async () => {
    if (!isRunning) {
        document.querySelector("#runBtn").style.backgroundColor = "var(--metro-color-green)"
        await run(compile())
    } else {
        document.querySelector("#runBtn > i").classList.add("fa-play")
        document.querySelector("#runBtn > i").classList.remove("fa-stop")
        document.querySelector("#runBtn").style.removeProperty("background-color")
        isRunning = false
        const iframeWindow = document.querySelector("iframe").contentWindow;
        await iframeWindow.styleManagerInstance.removeAll()
        iframeWindow.GrooveBoard.backendMethods.refreshStyles()
        setTimeout(() => {
            iframeWindow.GrooveBoard.backendMethods.refreshStyles()
        }, 500);
    }

});

document.querySelector("#previewBtn").addEventListener("click", async () => {
    compile()
    await preview()
});
if (beautifyCss(editor.getValue()) == "") {
    editor.setValue(`/* title: Unnamed Style */
/* author: - */
/* icon: - */
/* description: - */`)
}
editor.on("change", (e) => {

})
function showContextMenu(e, menuItems = []) {
    e.preventDefault();


    const menu = document.createElement("div");
    menu.className = "context-menu";
    menu.style.cssText = `
        left: ${e.pageX}px;
        top: ${e.pageY}px;
    `;

    menuItems.forEach(item => {
        const menuItem = document.createElement("div");
        menuItem.innerText = item.text;
        menuItem.style.cssText = `
            padding: 8px 12px;
            cursor: pointer;
            white-space: nowrap;
        `;
        menuItem.addEventListener("click", () => {
            item.action();
            document.body.removeChild(menu);
        });
        menuItem.addEventListener("mouseover", () => {
            menuItem.style.backgroundColor = "#444";
        });
        menuItem.addEventListener("mouseout", () => {
            menuItem.style.backgroundColor = "transparent";
        });
        menu.appendChild(menuItem);
    });

    document.body.appendChild(menu);

    const closeMenu = () => {
        menu.remove()
        document.removeEventListener("click", closeMenu);
    };

}
window.addEventListener("pointerdown", (e) => {
    if (!e.target.closest('.context-menu')) {
        document.querySelectorAll("div.context-menu").forEach(e => e.remove());
    }
});
window.addEventListener("blur", () => {
    document.querySelectorAll("div.context-menu").forEach(e => e.remove());
});
function downloadSrc() {
    const cssText = editor.getValue();
    const titleMatch = cssText.match(/\/\* title: (.*?) \*\//);
    const title = titleMatch ? titleMatch[1] : 'unnamed_style';
    const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    const blob = new Blob([editor.getValue()], { type: 'text/scss' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${safeTitle}.scss`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
    showToast('Source code downloaded');
}
function downladDist() {
    const cssText = editor.getValue();
    const titleMatch = cssText.match(/\/\* title: (.*?) \*\//);
    const title = titleMatch ? titleMatch[1] : 'unnamed_style';
    const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    let compiledCss;
    try {
        compiledCss = compile(cssText);
    } catch (error) {
        return;
    }

    const blob = new Blob([compiledCss], { type: 'text/css' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${safeTitle}.css`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
    showToast('Compiled CSS downloaded');
}
document.querySelector("#downloadBtn").addEventListener("click", (e) => {
    if (e.target != document.querySelector("#downloadBtn")) return;
    downladDist()
});
document.querySelector("#downloadBtn > div").addEventListener("click", (e) => {
    const menuItems = [
        { text: "Save as .css", action: downladDist },
        { text: "Save as .scss", action: downloadSrc }
    ];
    showContextMenu(e, menuItems)
});
const selectorBox = document.querySelector("#selector-frame > div")
document.querySelector("#selector-frame").addEventListener("pointerleave", () => {
    selectorBox.style.removeProperty("left")
    selectorBox.style.removeProperty("top")
    selectorBox.style.removeProperty("width")
    selectorBox.style.removeProperty("height")
    selectorBox.style.removeProperty("border-radius")
    selectorBox.style.removeProperty("--selector-text")

})
function elementFromPoint(x, y) {
    try {
        const iframeWindow = document.querySelector("iframe").contentWindow;
        return iframeWindow.document.elementFromPoint(x, y)
    } catch (error) {

    }
    return false;
}
var lastEl
document.querySelector("#selector-frame").addEventListener("pointermove", (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const [x, y] = [e.clientX - rect.left, e.clientY - rect.top];
    console.log('Relative position:', { x, y });
    const el = elementFromPoint(x / scale, y / scale)
    if (el) {
        const iframeWindow = document.querySelector("iframe").contentWindow;
        const box = el.getBoundingClientRect()
        lastEl = el
        selectorBox.style.setProperty("--selector-text", "\"" + getElementSelector(lastEl) + "\"")
        selectorBox.style.setProperty("left", box.left + "px")
        selectorBox.style.setProperty("top", box.top + "px")
        selectorBox.style.setProperty("width", box.width + "px")
        selectorBox.style.setProperty("height", box.height + "px")
        selectorBox.style.setProperty("border-radius", iframeWindow.getComputedStyle(el).getPropertyValue("border-radius"))
        if (y > rect.height / 2) {
            selectorBox.classList.add("alt")
        } else {
            selectorBox.classList.remove("alt")

        }
    }
})

const blacklistedClasses = [
    'ng-star-inserted',
    'ng-trigger',
    'ng-trigger-*',
    'ng-tns-*',
    'cdk-*',
    'mat-*'
];

function shouldIncludeClass(className) {
    return !blacklistedClasses.some(blacklisted => {
        if (blacklisted.endsWith('*')) {
            const prefix = blacklisted.slice(0, -1);
            return className.startsWith(prefix);
        }
        return className === blacklisted;
    });
}

// Modify getElementSelector to filter out blacklisted classes
const static_selectors = [
    "#app",
    "#app div.tile-list-page div.groove-home-tile",
    "#app div.tile-list-page div.groove-home-tile div.groove-tile-menu-unpin-button",
    "#app div.tile-list-page div.groove-home-tile div.groove-tile-menu-resize-button",
    "#app div.tile-list-page div.groove-home-tile div.groove-home-inner-tile",
    "#app div.tile-list-page div.groove-home-tile div.groove-home-inner-tile img.groove-home-tile-imageicon",
    "#app div.tile-list-page div.groove-home-tile div.groove-home-inner-tile p.groove-home-tile-title",
    "#app div.tile-list-page #app-page-icon",
    "#app div.app-list-page #search-icon",
    "#app div.app-list-page input.app-list-search",
    "#app div.app-list-page div.groove-letter-tile",
    "#app div.app-list-page div.groove-letter-tile p.groove-app-tile-icon",
    "#app div.app-list-page div.groove-app-tile",
    "#app div.app-list-page div.groove-app-tile div.groove-app-tile-icon",
    "#app div.app-list-page div.groove-app-tile p.groove-app-tile-title",
    "div.groove-context-menu",
    "div.groove-context-menu > div groove-context-menu-entry",
    "#app div.app-list-page div.letter-selector",
    "#app div.app-list-page div.letter-selector div.letter-selector-row",
    "#app div.app-list-page div.letter-selector div.letter-selector-row div.letter-selector-letter",
    "#app div.app-list-page div.letter-selector div.letter-selector-row div.letter-selector-letter &.disabled"
]
function staticSelectorToSelector(selector) {
    return selector
}
function getElementSelector(element, group = false) {
    if (!element) return '';

    // Check static selectors first
    for (const selector of static_selectors) {
        if (element.matches(selector)) {
            return selector;
        }
    }

    let path = [];
    let current = element;

    while (current && current.tagName) {
        let selector = current.tagName.toLowerCase();
        if (current.id) {
            selector += '#' + current.id;
        } else if (current.className) {
            const filteredClasses = Array.from(current.classList)
                .filter(shouldIncludeClass)
                .join('.');
            if (filteredClasses) {
                selector += '.' + filteredClasses;
            }
        }

        if (!current.id && !current.classList.length) {
            let index = Array.from(current.parentNode?.children || [])
                .filter(child => child.tagName === current.tagName)
                .indexOf(current) + 1;
            if (index > 1) selector += `:nth-of-type(${index})`;
        }

        path.unshift(selector);
        current = current.parentNode;

        if (current === document.body) break;
    }
    var finalSelector = path.join(' > ');
    if (finalSelector.startsWith("html > ")) finalSelector = finalSelector.substring(7);
    return finalSelector;
}
function beautify() {
    const cursor = editor.getCursor();
    editor.setValue(beautifyCss(editor.getValue(), { indent_size: 4, space_in_empty_paren: true }));
    editor.setCursor(cursor);
}
document.querySelector("#selector-frame").addEventListener("click", (e) => {
    if (!selectorOn || !lastEl) return;
    const selector = getElementSelector(lastEl);
    navigator.clipboard.writeText(selector);

    let currentContent = editor.getValue();
    const selectorParts = selector.split(/\s*>\s*|\s+/);

    // Function to find existing selector in content
    function findSelectorPosition(content, selector) {
        const regex = new RegExp(`${selector}\\s*{[^}]*}`, 'g');
        const matches = [...content.matchAll(regex)];
        return matches.length > 0 ? matches[matches.length - 1].index : -1;
    }

    let currentPosition = 0;
    let nestedContent = '';
    let remainingParts = [...selectorParts];

    // Process each selector part
    while (remainingParts.length > 0) {
        const currentSelector = remainingParts[0];
        const position = findSelectorPosition(currentContent, currentSelector);

        if (position !== -1) {
            // Selector exists, find its closing brace
            let bracketCount = 1;
            let i = currentContent.indexOf('{', position) + 1;

            while (bracketCount > 0 && i < currentContent.length) {
                if (currentContent[i] === '{') bracketCount++;
                if (currentContent[i] === '}') bracketCount--;
                i++;
            }

            currentPosition = i - 1; // Position before closing brace
            remainingParts.shift();
        } else {
            break;
        }
    }

    // Build remaining nested structure
    if (remainingParts.length > 0) {
        let indentation = '    '.repeat(selectorParts.length - remainingParts.length);

        remainingParts.forEach((part, index) => {
            nestedContent += `${indentation}${part} {\n`;
            indentation += '    ';
        });

        // Add closing braces
        remainingParts.forEach(() => {
            indentation = indentation.slice(4);
            nestedContent += `${indentation}}\n`;
        });

        // Insert the new content at the appropriate position
        if (currentPosition > 0) {
            currentContent = currentContent.slice(0, currentPosition) +
                '\n' + nestedContent +
                currentContent.slice(currentPosition);
        } else {
            currentContent += '\n' + nestedContent;
        }
    }

    editor.setValue(currentContent);
    beautify();

    showToast('Selector copied and nested structure added');
    document.querySelector("#selectorBtn").style.removeProperty("background-color");
    document.querySelector("div.preview").classList.remove("selector-mode");
    selectorOn = false;
    const iframeWindow = document.querySelector("iframe").contentWindow;
    iframeWindow.document.body.classList.remove("selector-mode");
});
