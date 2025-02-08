const version = "0.5.5";
const whatsnew = `- Added assets manager`
import { css as beautifyCss } from 'js-beautify';
import * as sass from "sass";
import { debounce } from 'lodash';

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
window.addEventListener('keydown', async (e) => {
    if (!editor.state.focused) return
    if ((e.shiftKey && e.altKey && e.code === 'KeyF') ||
        (e.ctrlKey && e.shiftKey && e.code === 'KeyI')) {
        e.preventDefault();
        // editor.setValue(editor.getValue().trim());
        await beautify();
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
            cursor: pointer !important;
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
function showPopup(title, message) {
    const popup = document.createElement("div");
    popup.className = "popup";

    // Add styles
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #2d2d2d;
        border-radius: 8px;
        padding: 20px;
        min-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 1000;
    `;

    popup.innerHTML = `
        <div class="popup-header" style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        ">
            <h3 style="margin: 0; color: #fff;">${title}</h3>
            <button class="close-popup" style="
                background: none;
                border: none;
                color: #fff;
                font-size: 20px;
                cursor: pointer !important;
                padding: 0 5px;
            ">×</button>
        </div>
        <div class="popup-body" style="color: #ccc;">
            ${message}
        </div>
    `;

    popup.querySelector(".close-popup").addEventListener("click", () => {
        popup.remove();
    });

    document.body.appendChild(popup);
}
// Add background shade style to popups
const style = document.createElement('style');
style.textContent = `
    .popup::before {
        content: '';
        position: fixed;
        top: -99999px;
        left: -99999px;
        right: -99999px;
        bottom: -99999px;
        background: rgba(0, 0, 0, 0.5);
        z-index: -1;
    }
`;
document.head.appendChild(style);
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
document.querySelector("#selector-frame").addEventListener("pointermove", debounce((e) => {
    const rect = document.querySelector("#selector-frame").getBoundingClientRect();
    const [x, y] = [e.clientX - rect.left, e.clientY - rect.top];
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
}, 16)); // 16ms debounce for smooth 60fps

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
        if (element.matches(selector.replaceAll(" &", ""))) {
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
async function beautify() {
    const cursor = editor.getCursor();
    await ensureRootInEditor(editor)
    editor.setValue(beautifyCss(editor.getValue(), {
        indent_size: 4,
        space_in_empty_paren: true,
        brace_style: "end-expand"
    }));
    editor.setCursor(cursor);
}
document.querySelector("#selector-frame").addEventListener("click", async (e) => {
    if (!selectorOn || !lastEl) return;
    const selector = getElementSelector(lastEl);
    navigator.clipboard.writeText(selector);

    let currentContent = editor.getValue();
    const selectorParts = selector.split(/\s*>\s*|\s+/);

    function findSelectorPosition(content, selector) {
        const regex = new RegExp(`${selector}\\s*{[^}]*}`, 'g');
        const matches = [...content.matchAll(regex)];
        return matches.length > 0 ? matches[matches.length - 1].index : -1;
    }

    let currentPosition = 0;
    let nestedContent = '';
    let remainingParts = [...selectorParts];
    let finalLine = 0;

    while (remainingParts.length > 0) {
        const currentSelector = remainingParts[0];
        const position = findSelectorPosition(currentContent, currentSelector);

        if (position !== -1) {
            let bracketCount = 1;
            let i = currentContent.indexOf('{', position) + 1;

            while (bracketCount > 0 && i < currentContent.length) {
                if (currentContent[i] === '{') bracketCount++;
                if (currentContent[i] === '}') bracketCount--;
                i++;
            }

            currentPosition = i - 1;
            finalLine = currentContent.substr(0, currentPosition).split('\n').length;
            remainingParts.shift();
        } else {
            break;
        }
    }

    if (remainingParts.length > 0) {
        let indentation = '    '.repeat(selectorParts.length - remainingParts.length);

        remainingParts.forEach((part, index) => {
            nestedContent += `${indentation}${part} {\n`;
            indentation += '    ';
        });

        remainingParts.forEach(() => {
            indentation = indentation.slice(4);
            nestedContent += `${indentation}}\n`;
        });

        if (currentPosition > 0) {
            currentContent = currentContent.slice(0, currentPosition) +
                '\n' + nestedContent +
                currentContent.slice(currentPosition);
            finalLine += 1;
        } else {
            currentContent += '\n' + nestedContent;
            finalLine = currentContent.split('\n').length - remainingParts.length;
        }
    }

    editor.setValue(currentContent);
    await beautify();

    // Set cursor position and focus
    editor.setCursor(finalLine - 1, 4);
    editor.focus();

    showToast('Selector copied and nested structure added');
    document.querySelector("#selectorBtn").style.removeProperty("background-color");
    document.querySelector("div.preview").classList.remove("selector-mode");
    selectorOn = false;
    const iframeWindow = document.querySelector("iframe").contentWindow;
    iframeWindow.document.body.classList.remove("selector-mode");
});
if (localStorage["te_editor_version"] != version) {
    showPopup("New version! v" + version, whatsnew == "" ? "No info" : whatsnew)

}
localStorage.setItem("te_editor_version", version)

function ensureRootInEditor(editor) {
    // Get the CSS content from the editor
    let cssContent = editor.getValue();

    // Match the :root selector and its contents
    const rootRegex = /:root\s*{[^}]*}/;

    // Match the metadata block at the top of the file
    const metadataRegex = /^(\/\*[^*]*\*\/\s*)+/;

    // Find the metadata block, if any
    const metadataMatch = cssContent.match(metadataRegex);
    const metadataBlock = metadataMatch ? metadataMatch[0] : '';

    // Remove the metadata block temporarily
    if (metadataBlock) {
        cssContent = cssContent.replace(metadataRegex, '').trim();
    }

    // Find the :root{} block
    const rootMatch = cssContent.match(rootRegex);

    if (rootMatch) {
        // Remove the existing :root{} block
        cssContent = cssContent.replace(rootRegex, '').trim();

        // Add the :root{} block after the metadata
        cssContent = `${metadataBlock}:root ${rootMatch[0].slice(5)}\n\n${cssContent}`;
    } else {
        // Add :root{} block after the metadata if it doesn't exist
        cssContent = `${metadataBlock}:root {\n  /* Assets will be added here! */\n}\n\n${cssContent}`;
    }

    // Update the editor with the modified CSS content
    editor.setValue(cssContent);
}

document.querySelector("#assetsBtn").addEventListener("click", (e) => {
    if (document.querySelector("#assets-menu")) {
        document.querySelector("#assets-menu").remove()
    } else {
        showAssetsMenu()
    }
});

function getFontAssets() {
    // Get the CSS content from the editor
    const css = editor.getValue();

    // Regex to match everything inside :root{}
    const rootRegex = /:root\s*{([^}]*)}/g;
    const rootMatch = rootRegex.exec(css);

    if (rootMatch) {
        const rootContent = rootMatch[1];

        // Regex to match CSS variables (custom properties) with data:image URLs

        const dataImageRegex = /--.*:\s*url\((['"]?)data:(?:@file\/x-font|font).*\);/g;
        const matches = [...rootContent.matchAll(dataImageRegex)];
        // Create an object to store the results
        const imageAssets = {};

        if (matches.length > 0) {
            matches.forEach(match => {
                const property = match[0].split(':')[0].trim();
                const value = match[0].split(':').slice(1).join(':');

                // Save the variable name and its data URL value in JSON object
                imageAssets[property] = value;
            });
        }

        return imageAssets;
    }

    return {};
}
function removeFontFaces() {
    document.body.querySelectorAll('link.custom-font-face').forEach(style => style.remove())
}
function createFontFace(name, url) {
    const style = document.createElement('style');
    style.className = 'custom-font-face';
    style.textContent = `@font-face { font-family: "${name}"; src: url("${url}"); }`
    document.body.appendChild(style);
}
async function createFontsAssets() {
    removeFontFaces()
    var returnee = []
    const fonts = getFontAssets()
    Object.entries(fonts).forEach(([name, font]) => {
        const asset = document.createElement('div');
        asset.className = 'assets-menu-item';
        asset.innerHTML = `<div class="assets-menu-item-preview"></div><div class="asset-menu-item-title"></div>`
        asset.querySelector('.asset-menu-item-title').textContent = String(name).substring(2).replaceAll("-", " ");
        try {
            const dataUri = extractDataUriFromUrl(font)[0];
            const blobUrl = dataUriToBlobUrl(dataUri);
            const fontName = "custom-font-" + name
            createFontFace(fontName, blobUrl)
            asset.querySelector('.assets-menu-item-preview').textContent = "Aa";
            asset.querySelector('.assets-menu-item-preview').style.fontFamily = "\"" + fontName + "\""
        } catch (error) {
            setTimeout(() => {
                asset.remove()
            }, 200);
        }
        function onClick() {
            navigator.clipboard.writeText(`var(${name})`);
            showToast(`${name.substring(2)} image variable is copied to clipboard`);
        }
        asset.addEventListener("click", onClick)
        returnee.push(asset)
    })
    if (returnee.length == 0) {
        const noResults = document.createElement("p")
        noResults.className = "no-results"
        noResults.textContent = "No fonts found"
        returnee.push(noResults)
    }
    return returnee
}
function extractDataUriFromUrl(css) {
    const dataUriRegex = /url\((['"]?)([^'"]*data:[^'"]+)(['"]?)\)/g;

    let matches;
    const dataUris = [];

    while ((matches = dataUriRegex.exec(css)) !== null) {
        // The second capturing group contains the data URI
        const dataUri = matches[2];
        dataUris.push(dataUri);
    }

    return dataUris;
}
function dataUriToBlobUrl(dataUri) {
    // Split the data URI into its components (e.g., 'data:image/png;base64,...')
    const [header, data] = dataUri.split(',');

    // Extract the MIME type from the header
    const mime = header.match(/:(.*?);/)[1];

    // Decode the Base64 data
    const byteString = atob(data);

    // Convert the Base64 string into a Uint8Array
    const byteNumbers = new Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
        byteNumbers[i] = byteString.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    // Create a Blob from the Uint8Array
    const blob = new Blob([byteArray], { type: mime });

    // Create a URL for the Blob
    const blobUrl = URL.createObjectURL(blob);
    setTimeout(() => {
        //revoke
        URL.revokeObjectURL(blobUrl)
    }, 10000);
    return blobUrl;
}

function getImageAssets() {
    var returnee = {};
    // Get the CSS content from the editor
    const css = editor.getValue();

    // Regex to match everything inside :root{}
    const rootRegex = /:root\s*{([^}]*)}/g;
    const rootMatch = rootRegex.exec(css);

    if (rootMatch) {
        const rootContent = rootMatch[1];

        // Regex to match CSS variables (custom properties) with data:image URLs
        const dataImageRegex = /--.*:\s*url\((['"]?)data:image.*\);/g;
        const matches = [...rootContent.matchAll(dataImageRegex)];
        // Create an object to store the results
        const imageAssets = {};

        if (matches.length > 0) {
            matches.forEach(match => {
                const property = match[0].split(':')[0].trim();
                const value = match[0].split(':').slice(1).join(':');

                // Save the variable name and its data URL value in JSON object
                imageAssets[property] = value;
            });
        }

        returnee = imageAssets;
    }
    return returnee;
}
window.getImageAssets = getImageAssets;
async function createImagesAssets() {
    var returnee = []
    const images = getImageAssets();

    //wallpaper asset
    (() => {
        const asset = document.createElement('div');
        asset.className = 'assets-menu-item';
        asset.innerHTML = `<div class="assets-menu-item-preview"></div><div class="asset-menu-item-title"></div>`
        asset.querySelector('.asset-menu-item-title').textContent = "Wallpaper";

        asset.querySelector('.assets-menu-item-preview').innerHTML = `<i class="fas fa-image"></i>`;

        function onClick() {
            navigator.clipboard.writeText(`var(--wallpaper-url)`);
            showToast(`Wallpaper image variable is copied to clipboard`);
        }
        asset.addEventListener("click", onClick)
        returnee.push(asset)
    })();

    Object.entries(images).forEach(([name, image]) => {
        const asset = document.createElement('div');
        asset.className = 'assets-menu-item';
        asset.innerHTML = `<div class="assets-menu-item-preview"></div><div class="asset-menu-item-title"></div>`
        asset.querySelector('.asset-menu-item-title').textContent = String(name).substring(2).replaceAll("-", " ");
        try {
            const dataUri = extractDataUriFromUrl(image)[0];
            const blobUrl = dataUriToBlobUrl(dataUri);
            asset.querySelector('.assets-menu-item-preview').style.backgroundImage = `url(${blobUrl})`;
        } catch (error) {
            setTimeout(() => {
                asset.remove()
            }, 200);
        }
        function onClick() {
            navigator.clipboard.writeText(`var(${name})`);
            showToast(`${name.substring(2)} image variable is copied to clipboard`);
        }
        asset.addEventListener("click", onClick)
        returnee.push(asset)
    })
    if (returnee.length == 0) {
        const noResults = document.createElement("p")
        noResults.className = "no-results"
        noResults.textContent = "No images found"
        returnee.push(noResults)
    }
    return returnee
}
function getColorAssets() {
    const colors = {
        "lime": "#A4C400",
        "green": "#60A917",
        "emerald": "#008A00",
        "teal": "#00ABA9",
        "cyan": "#1BA1E2",
        "cobalt": "#3E65FF",
        "indigo": "#6A00FF",
        "violet": "#AA00FF",
        "pink": "#F472D0",
        "magenta": "#D80073",
        "crimson": "#A20025",
        "red": "#E51400",
        "orange": "#FA6800",
        "amber": "#F0A30A",
        "yellow": "#E3C800",
        "brown": "#825A2C",
        "olive": "#6d8764",
        "steel": "#647687",
        "mauve": "#76608A",
        "taupe": "#87794E",
        "accent color": "var(--accent-color)"
    };
    return colors;
}
async function createColorsAssets() {
    var returnee = []
    const colors = getColorAssets()
    Object.entries(colors).forEach(([name, color]) => {
        const asset = document.createElement('div');
        asset.className = 'assets-menu-item';
        asset.innerHTML = `<div class="assets-menu-item-preview"></div><div class="asset-menu-item-title"></div>`
        asset.querySelector('.asset-menu-item-title').textContent = String(name).charAt(0).toUpperCase() + String(name).slice(1);
        asset.querySelector('.assets-menu-item-preview').style.backgroundColor = color;
        function onClick() {
            navigator.clipboard.writeText(color);
            showToast(`${String(name).charAt(0).toUpperCase() + String(name).slice(1)} color value is copied to clipboard`);
        }
        asset.addEventListener("click", onClick)
        returnee.push(asset)
    })
    return returnee
}
var lastOpenedMenu = 0
function showAssetsMenu() {
    const menu = document.createElement('div');
    menu.id = "assets-menu";

    const topBar = document.createElement('div');
    topBar.className = 'assets-menu-topbar';

    const items = [
        { title: 'Fonts', icon: 'fa-font' },
        { title: 'Images', icon: 'fa-image' },
        { title: 'Colors', icon: 'fa-palette' }
    ];

    items.forEach((item, index) => {
        const button = document.createElement('button');
        button.innerHTML = `<i class="fas ${item.icon}"></i> ${item.title}`;
        button.className = 'assets-menu-button';
        button.addEventListener('click', () => {
            lastOpenedMenu = index
            loadAssetItems()
        })
        topBar.appendChild(button);
    });

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = `<i class="fas fa-times"></i>`;
    closeBtn.className = 'assets-menu-close';
    closeBtn.addEventListener('click', () => menu.remove());
    topBar.appendChild(closeBtn);

    const assetsView = document.createElement('div');
    assetsView.className = 'assets-menu-view';

    async function loadAssetItems() {
        assetsView.scrollTop = 0;
        assetsView.innerHTML = '';
        var assets = []
        switch (lastOpenedMenu) {
            case 0:
                assets = await createFontsAssets()
                break;
            case 1:
                assets = await createImagesAssets()
                break;
            case 2:
                assets = await createColorsAssets()
                break;
        }
        assets.forEach((asset, index) => {
            assetsView.appendChild(asset);
        })
    }
    window.loadAssetItems = loadAssetItems.bind(this);
    loadAssetItems()

    menu.appendChild(topBar);
    menu.appendChild(assetsView);
    document.querySelector("div.preview").appendChild(menu);
    assetsDragAndDrop()
}

function isValidCSSVariableName(name) {
    // Regex to check for valid characters (letters, numbers, hyphens, underscores)
    if (name == null || name == "" || name == undefined) return false
    const validNameRegex = /^[a-zA-Z0-9_-]+$/;
    return validNameRegex.test(name);
}
window.isValidCSSVariableName = isValidCSSVariableName
const allowedTypes = [
    "image/jpeg", "image/png", "image/gif", "image/svg+xml", "image/webp",
    "font/woff", "font/woff2", "font/ttf", "font/otf"
];

function assetsDragAndDrop() {

    const dropZone = document.getElementById("assets-menu");

    dropZone.addEventListener("dragover", (event) => {
        clearTimeout(window.dropZoneTimeout)
        event.preventDefault(); // Allow drop
        dropZone.classList.add("dragging")
    });

    dropZone.addEventListener("dragleave", () => {
        clearTimeout(window.dropZoneTimeout)
        window.dropZoneTimeout = setTimeout(() => {
            dropZone.style.borderColor = "#aaa"; // Reset border color
            dropZone.classList.remove("dragging")
        }, 100);

    });

    dropZone.addEventListener("drop", (event) => {
        clearTimeout(window.dropZoneTimeout)
        event.preventDefault(); // Prevent default action
        dropZone.classList.remove("dragging")
        dropZone.classList.add("drag-success")
        setTimeout(() => {
            dropZone.classList.remove("drag-success")
        }, 1000);
        window.dragTimesTried = 0
        const file = event.dataTransfer.files[0]; // Get the dropped file
        if (file && allowedTypes.includes(file.type)) {
            selectName()
            function selectName() {
                window.dragTimesTried += 1;
                const input = prompt((window.dragTimesTried <= 1) ? `Enter a name for the ${file.type.split("/")[0]}:` : `Invalid name, please enter a valid name for the ${file.type.split("/")[0]}:`);
                if (input == null) {
                    //user cancelled asset
                    showToast("Asset creation cancelled", 5000, "var(--metro-color-yellow)")
                } else if (isValidCSSVariableName(input)) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const dataUri = e.target.result;
                        //get css add --name: url(datauri) at the end of the root and editor.setValue
                        beautify()
                        ensureRootInEditor(editor)
                        beautify()
                        const css = window.editor.getValue();
                        const rootRegex = /:root\s*{([^}]*)}/g;
                        const rootMatch = rootRegex.exec(css);
                        if (rootMatch) {
                            const rootContent = rootMatch[1];
                            const newRootContent = `${rootContent}--${input}: url('${dataUri}');`;
                            const newCss = css.replace(rootRegex, `:root {${newRootContent}}`);
                            editor.setValue(newCss);
                            showToast("Asset created", 5000, "var(--metro-color-green)")
                            try {
                                window.loadAssetItems()
                            } catch (error) {

                            }
                        } else {
                            //asset couldnt be created unknown error
                            showToast("Asset creation failed", 5000, "var(--metro-color-red)")

                        }

                    };
                    reader.readAsDataURL(file); // Read file as Data URI
                    delete window.dragTimesTried
                } else {
                    selectName()
                }
            }
        } else {
            showToast("Only font and image assets are allowed", 5000, "var(--metro-color-red)")
        }
    });
}