import i18n from "../../../scripts/localeManager";
import GrooveElements from "../../../scripts/GrooveElements";
function updateLocaleInfo() {
    try {
        document.querySelector("#home-tab > div:nth-child(1) > div > div:nth-child(3) > p.groove-list-view-item-description").innerText = i18n.getLocaleName().nativeName
    } catch (error) {
        document.querySelector("#home-tab > div:nth-child(1) > div > div:nth-child(3) > p.groove-list-view-item-description").innerText = i18n.getLocaleName("en-US").nativeName
    }
}

updateLocaleInfo()
window.addEventListener("localeChanged", () => {
    updateLocaleInfo()
})
if (!window.parent.BuildConfig.signed()) document.querySelector("#home-tab > div:nth-child(1) > div > div:nth-child(3)").style.display = "none"
document.querySelector("#home-tab > div:nth-child(1) > div > div:nth-child(3)").addEventListener("flowClick", async () => {
    document.querySelector("body > div.innerAppPage:nth-child(5) > div.loader").style.display = "flex"
    const listView = document.querySelector("#language-tab > div.groove-list-view")
    listView.innerHTML = ""

    // Add the current language first
    const currentLanguageId = localStorage.language
    if (currentLanguageId) {
        const currentItem = GrooveElements.wListViewItem(
            i18n.getLocaleName(currentLanguageId).nativeName,
            i18n.getLocaleName(currentLanguageId).name
        )
        currentItem.classList.add("selected")
        currentItem.locale = {
            languageId: currentLanguageId
        }
        currentItem.addEventListener("flowClick", onItemClick)
        listView.append(currentItem)
    }

    // Load the rest of the languages
    const availableLocales = (await i18n.getAvailableLocales()).userLocales
    document.querySelector("body > div.innerAppPage:nth-child(5) > div.loader").style.display = "none"
    Object.values(availableLocales)
        .sort((a, b) => a.languageId.localeCompare(b.languageId))
        .forEach(locale => {
            // Skip if this is the current language (already added)
            if (locale.languageId === currentLanguageId) return
            if (!i18n.getLocaleName(locale.languageId).nativeName) return false
            const stats = _i18n.availableLocales.userLocales[locale.languageId]
            //if (((stats.translationProgress + stats.approvalProgress) / 2) <= 10) return false
            const nativeName = i18n.getLocaleName(locale.languageId).nativeName
            const displayName = i18n.getLocaleName(locale.languageId).name
            const item = GrooveElements.wListViewItem(
                nativeName || '',
                displayName || ''
            )
            item.stats = stats;
            item.locale = locale;
            if (locale.languageId === localStorage.language) {
                item.classList.add("selected")
            }

            item.addEventListener("flowClick", onItemClick)

            document.querySelector("#language-tab > div.groove-list-view").append(item)
        })
    scrollers.language.refresh()
})
var lastSelected = false
function onItemClick(el) {
    lastSelected = false
    const item = el.target
    const stats = item.stats
    const locale = item.locale
    if (item.classList.contains("expanded")) {
        item.classList.remove("expanded")
        item.querySelector(".expanded-panel")?.remove()
        setTimeout(() => {
            Groove.triggerHapticFeedback("CONFIRM")
        }, 250);
    } else {
        lastSelected = el.target === el.target.parentElement.lastElementChild
        if (item.classList.contains("selected")) {
            document.querySelectorAll(".groove-list-view-item.expanded").forEach(expandedItem => {
                expandedItem.classList.remove("expanded")
                expandedItem.querySelector(".expanded-panel")?.remove()
            })

            item.classList.add("expanded")
            item.innerHTML += `
                <div class="expanded-panel" style="padding-bottom: 16px; pointer-events: none;">
                    <div class="download-container" style="display: none;">
                        <div class="metro-progress-bar" style="--value: 0"></div>
                    </div>
                    <button class="metro-button spinner" style="margin-left: auto;pointer-events: auto;">
                        <img src="./../../assets/loader.png">
                        Update
                    </button>
                </div>
            `
            item.querySelector(".metro-button").addEventListener("flowClick", async () => {
                const button = item.querySelector(".metro-button")
                button.classList.add("loading")
                await i18n.getAvailableLocales()
                item.querySelector(".download-container").style.display = "block"
                button.classList.remove("loading")
                button.style.display = "none"

                i18n.setLocale(locale.languageId, (progress) => {
                    switch (progress.status) {
                        case 'downloading':
                            item.querySelector("div.download-container > div.metro-progress-bar").style.setProperty("--value", progress.totalProgress / 100)
                            break;
                        case 'error':
                            console.error(`Error: ${progress.error}`);
                            break;
                        case 'complete':
                            document.querySelectorAll(".groove-list-view-item.selected").forEach(selectedItem => {
                                selectedItem.classList.remove("selected");
                            });
                            item.classList.add("selected");
                            setTimeout(() => {
                                item.classList.remove("expanded");
                                item.querySelector(".expanded-panel")?.remove();
                            }, 200);
                            break;
                    }
                });
            })
        } else {
            document.querySelectorAll(".groove-list-view-item.expanded").forEach(expandedItem => {
                expandedItem.classList.remove("expanded")
                expandedItem.querySelector(".expanded-panel")?.remove()
            })

            item.classList.add("expanded")
            item.innerHTML += `
                    <div class="expanded-panel" style="padding-bottom: 16px; pointer-events: none;">
                        <div class="stats-container" style="pointer-events: none;">
                            ${stats.translationProgress === 100 && stats.approvalProgress === 100
                    ? `<div class="stats-text" style="opacity: 0.6;font-size: 19px;">Fully translated</div>`
                    : `
                                    <div class="metro-progress-bar" style="--value: ${stats.translationProgress / 100};--value-2: ${stats.approvalProgress / 100};--value-color: var(--metro-color-cyan);--value-2-color: var(--metro-color-green)"></div>
                                    <div class="stats-text" style="opacity: 0.6;font-size: 19px;">
                                        ${stats.translationProgress < 100 ?
                        `<span style="display: flex; align-items: center; gap: 5px;"><div style="width: 10px; height: 10px; background: var(--metro-color-cyan)"></div>${stats.translationProgress}% translated</span>`
                        : ''
                    }
                                        <span style="display: flex; align-items: center; gap: 5px;"><div style="width: 10px; height: 10px; background: var(--metro-color-green)"></div>${stats.approvalProgress}% approved</span>
                                    </div>
                                `
                }
                        </div>
                        <div class="download-container" style="display: none;">
                            <div class="metro-progress-bar" style="--value: 0"></div>
                        </div>
                        <button class="metro-button spinner" style="margin-left: auto;pointer-events: auto;">
                            <img src="./../../assets/loader.png">
                            Apply
                        </button>
                    </div>
                `
            item.querySelector(".metro-button").addEventListener("flowClick", async () => {
                const button = item.querySelector(".metro-button")
                button.classList.add("loading")
                await i18n.getAvailableLocales()
                item.querySelector(".stats-container").style.display = "none"
                item.querySelector(".download-container").style.display = "block"
                button.classList.remove("loading")
                button.style.display = "none"

                i18n.setLocale(locale.languageId, (progress) => {
                    switch (progress.status) {
                        case 'downloading':
                            item.querySelector("div.download-container > div.metro-progress-bar").style.setProperty("--value", progress.totalProgress / 100)
                            break;
                        case 'error':
                            console.error(`Error: ${progress.error}`);
                            break;
                        case 'complete':
                            document.querySelectorAll(".groove-list-view-item.selected").forEach(selectedItem => {
                                selectedItem.classList.remove("selected");
                            });
                            item.classList.add("selected");
                            setTimeout(() => {
                                item.classList.remove("expanded");
                                item.querySelector(".expanded-panel")?.remove();
                            }, 200);
                            break;
                    }
                });
            })
        }
        setTimeout(() => {
            Groove.triggerHapticFeedback("CONFIRM")
            setTimeout(() => {
                Groove.triggerHapticFeedback("CLOCK_TICK")
            }, 125);
        }, 250);
    }
    scrollerRefreshActive = true
    if (!scrollerRefreshRunning) scrollerRefresh()
    setTimeout(() => {
        scrollerRefreshActive = false
        requestAnimationFrame(() => {
            scrollerRefreshRunning = false
        })
    }, 500);
}
var scrollerRefreshActive = false
var scrollerRefreshRunning = false
function scrollerRefresh() {
    if (!scrollerRefreshActive) return;
    scrollerRefreshRunning = true
    scrollers.language.refresh()
    if (lastSelected) {
        scrollers.language.scrollTo(0, scrollers.language.maxScrollY, 0)
    }
    console.log("Scroller refreshed")
    requestAnimationFrame(scrollerRefresh)
}