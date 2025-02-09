const selectableElements = {
    home: {
        tileMenu: ["div.groove-home-tile", "button.update-read-more", "button.update-dismiss", "#app-page-icon"],
        appMenu: ["div.groove-app-tile", "div.letter-selector-letter", "#search-icon", "input.app-list-search"]
    },
    settings: {

    }
}
const borders = {
    tileMenu: {
        right: () => {
            console.log("borderr")
        }
    }
}
window.dpadcurrentscreen = "tileMenu";
const getAllSelectors = (() => {
    const selectors = [];
    Object.values(selectableElements).forEach(group => {
        Object.values(group).forEach(menu => {
            selectors.push(...menu);
        });
    });
    return selectors;
})();

function getMostTopLeftElement(filter = "all") {
    let allElements = [];
    if (filter === "all") {
        allElements = getAllSelectors.flatMap(selector => Array.from(document.querySelectorAll(selector)));
    } else if (filter === "onscreen") {
        allElements = getAllSelectors.flatMap(selector => Array.from(document.querySelectorAll(selector))).filter(el => isOnScreen(el));
    } else {
        const groupSelectors = selectableElements[filter] || {};
        const menuSelectors = Object.values(groupSelectors).flat();
        allElements = menuSelectors.flatMap(selector => Array.from(document.querySelectorAll(selector)));
    }

    if (!allElements.length) return null;
    let topLeftEl = null;
    let minTop = Infinity;
    let minLeft = Infinity;

    allElements.forEach(el => {
        if (!isVisible(el)) return;
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return;
        if (rect.top < minTop || (rect.top === minTop && rect.left < minLeft)) {
            minTop = rect.top;
            minLeft = rect.left;
            topLeftEl = el;
        }
    });

    return topLeftEl;
}
setInterval(() => {
    const focusElement = document.querySelector("[groove-navigation-focus]");
    if (!isVisible(focusElement)) {
        const el = getMostTopLeftElement();
        if (el) {
            focusElement(el);
        }
    }

}, 1000);
function focusElement(el) {
    document.querySelectorAll("[groove-navigation-focus]").forEach(el => el.removeAttribute("groove-navigation-focus"));
    el.setAttribute("groove-navigation-focus", "");
}
const directionalClosest = {
    // Adjustable factor to experiment with.
    craziness: 0.5,
    cache: null,
    clearCache() {
        this.cache = null;
    },
    // Returns all navigable elements (cached) from selectable selectors.
    getNavElements() {
        if (this.cache) return this.cache;
        const currentFocusedEl = document.querySelector('[groove-navigation-focus]');
        let foundGroup = null;
        // Find which group the current element belongs to
        if (currentFocusedEl) {
            for (const groupKey in selectableElements) {
                const group = selectableElements[groupKey];
                for (const menuKey in group) {
                    for (const sel of group[menuKey]) {
                        if (currentFocusedEl.matches(sel)) {
                            foundGroup = menuKey;
                            break;
                        }
                    }
                    if (foundGroup) break;
                }
                if (foundGroup) break;
            }
        }
        const elems = new Set();
        if (foundGroup) {
            // Gather only elements from the same group
            for (const groupKey in selectableElements) {
                const group = selectableElements[groupKey];
                if (group[foundGroup]) {
                    group[foundGroup].forEach(selector => {
                        document.querySelectorAll(selector).forEach(el => {
                            if (isVisible(el)) elems.add(el);
                        });
                    });
                }
            }
        } else {
            // Gather all selectors
            getAllSelectors.forEach(selector => {
                document.querySelectorAll(selector).forEach(el => {
                    if (isVisible(el)) elems.add(el);
                });
            });
        }
        this.cache = Array.from(elems);
        return this.cache;
    },
    top(current) {
        const currentCenter = getCenter(current);
        const idealVector = { x: 0, y: -1 };
        let best = current;
        let bestScore = Infinity;
        this.getNavElements().forEach(candidate => {
            if (candidate === current) return;
            const candidateCenter = getCenter(candidate);
            if (candidateCenter.y >= currentCenter.y) return;
            const score = candidateScore(candidate, currentCenter, idealVector);
            if (score < bestScore) {
                bestScore = score;
                best = candidate;
            }
        });
        return best;
    },
    bottom(current) {
        const currentCenter = getCenter(current);
        const idealVector = { x: 0, y: 1 };
        let best = current;
        let bestScore = Infinity;
        this.getNavElements().forEach(candidate => {
            if (candidate === current) return;
            const candidateCenter = getCenter(candidate);
            if (candidateCenter.y <= currentCenter.y) return;
            const score = candidateScore(candidate, currentCenter, idealVector);
            if (score < bestScore) {
                bestScore = score;
                best = candidate;
            }
        });
        return best;
    },
    left(current) {
        const currentCenter = getCenter(current);
        const idealVector = { x: -1, y: 0 };
        let best = current;
        let bestScore = Infinity;
        this.getNavElements().forEach(candidate => {
            if (candidate === current) return;
            const candidateCenter = getCenter(candidate);
            if (candidateCenter.x >= currentCenter.x) return;
            const score = candidateScore(candidate, currentCenter, idealVector);
            if (score < bestScore) {
                bestScore = score;
                best = candidate;
            }
        });
        return best;
    },
    right(current) {
        const currentCenter = getCenter(current);
        const idealVector = { x: 1, y: 0 };
        let best = current;
        let bestScore = Infinity;
        this.getNavElements().forEach(candidate => {
            if (candidate === current) return;
            const candidateCenter = getCenter(candidate);
            if (candidateCenter.x <= currentCenter.x) return;
            const score = candidateScore(candidate, currentCenter, idealVector);
            if (score < bestScore) {
                bestScore = score;
                best = candidate;
            }
        });
        return best;
    }
};

function getCenter(el) {
    const rect = el.getBoundingClientRect();
    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    };
}

// Scores a candidate element based on distance and angular deviation.
// Lower scores have higher priority.
function candidateScore(candidate, currentCenter, idealVector) {
    const candidateCenter = getCenter(candidate);
    const dx = candidateCenter.x - currentCenter.x;
    const dy = candidateCenter.y - currentCenter.y;
    const distance = Math.hypot(dx, dy);
    if (distance === 0) return Infinity;
    // Normalize candidate direction.
    const candidateVector = { x: dx / distance, y: dy / distance };
    // Dot product with the ideal unit vector.
    const dot = candidateVector.x * idealVector.x + candidateVector.y * idealVector.y;
    // Angle penalty: 0 for perfect alignment, up to 2 for completely opposite.
    const anglePenalty = (1 - dot);
    return distance * (1 + directionalClosest.craziness * anglePenalty);
}

setInterval(() => directionalClosest.clearCache(), 5000);
function borderFunction(screen, direction) {
    if (borders[screen]) {
        if (borders[screen][direction]) {
            try {
                borders[screen][direction]();
            } catch (e) {
                console.error(e);
            }
        }
    }
}
window.addEventListener('keydown', (event) => {
    const current = document.querySelector('[groove-navigation-focus]');
    if (!current) return;
    let next = document.querySelector("[groove-navigation-focus]");
    if (!next) next = getMostTopLeftElement();
    switch (event.key) {
        case 'ArrowUp':
            next = directionalClosest.top(current);
            if (next == current) borderFunction(dpadcurrentscreen, "top");
            break;
        case 'ArrowRight':
            next = directionalClosest.right(current);
            if (next == current) borderFunction(dpadcurrentscreen, "right");
            break;
        case 'ArrowLeft':
            next = directionalClosest.left(current);
            if (next == current) borderFunction(dpadcurrentscreen, "left");
            break;
        case 'ArrowDown':
            next = directionalClosest.bottom(current);
            if (next == current) borderFunction(dpadcurrentscreen, "bottom");
            break;
        default:
            return;
    }
    focusElement(next);
});
window.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === 'RemoteOK') {
        console.log("Enter");
        const current = document.querySelector('[groove-navigation-focus]');
        if (current) {
            current.click();
            const flowClick = new Event('flowClick');
            current.dispatchEvent(flowClick);
            if (current.classList.contains("groove-home-tile")) {

            }
            event.preventDefault();
        }
    }
});
//first focus
export function startNavigationSystem() {
    function attemptFocus() {
        const el = getMostTopLeftElement();
        if (!el) {
            requestAnimationFrame(attemptFocus);
            return;
        }
        focusElement(el);
    }
    attemptFocus();
};
window.getMostTopLeftElement = getMostTopLeftElement;

function isVisible(el) {
    while (el) {
        const style = window.getComputedStyle(el);
        if (
            style.display === 'none' ||
            style.visibility === 'hidden' ||
            style.opacity === '0'
        ) {
            return false;
        }
        el = el.parentElement;
    }
    return true;
}
function isOnScreen(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.right <= window.innerWidth
    );
}