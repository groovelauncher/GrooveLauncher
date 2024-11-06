
function tile(x, y, w, h, content = "") {
    const invalidSize = new Error("invalid size")
    if (w == 1) {
        if (h != 1) {
            throw invalidSize
        }
    } else if (w == 2) {
        if (h != 2) {
            throw invalidSize
        }
    } else if (w == 4) {
        if (!(h == 4 || h == 2)) {
            throw invalidSize
        }
    }
    const ft_tile = document.createElement("div");
    ft_tile.setAttribute("ft-x", calculations.redefine(x, 0))
    ft_tile.setAttribute("ft-x", calculations.redefine(y, 0))
    ft_tile.setAttribute("ft-w", calculations.redefine(w, 1))
    ft_tile.setAttribute("ft-h", calculations.redefine(h, 1))
    ft_tile.ft_x = calculations.redefine(x, 0)
    ft_tile.ft_y = calculations.redefine(y, 0)
    ft_tile.ft_w = calculations.redefine(w, 1)
    ft_tile.ft_h = calculations.redefine(h, 1)
    ft_tile.innerHTML = content
    ft_tile.classList.add("ft-tile")
    return ft_tile;
}
const calculations = {
    redefine: (a, b) => (a == undefined) ? b : a,
    pad_margin: (...vals) => {
        console.log("input", vals)
        if (typeof vals == "object" && vals["length"]) {
            if (vals.length == 2) {
                console.log("sr", 0)
                const val0 = calculations.redefine(vals[0], 10)
                const val1 = calculations.redefine(vals[1], 10)
                return [val0, val1, val0, val1]
            } else {
                if (vals.length == 1) {
                    if (typeof vals[0] == "object" && vals[0]["length"]) {
                        console.log("sr", 1)
                        return calculations.pad_margin(...vals[0])
                    } else {
                        console.log("sr", 3)
                        const val = calculations.redefine(vals[0], 10)
                        return [val, val, val, val]
                    }
                } else {
                    console.log("sr", 2)
                    return [calculations.redefine(vals[0], 10), calculations.redefine(vals[1], 10), calculations.redefine(vals[2], 10), calculations.redefine(vals[3], 10)]
                }
            }
        }
    }

}
window.calculations = calculations
const eventLogTypes = {
    tileAdded: 0,
    tileRemoved: 1,
    tileChanged: 2
}
function spaceDetector(tiles, cols) {
    var space = [];
    function calculate() {
        var rows = 0
        tiles.forEach(tile => rows = Math.max(rows, tile.ft_y + tile.ft_h))
        space = new Array(rows * cols).fill(false)
        //    console.log("sspace", space)
        tiles.forEach(tile => {
            const pointer = tile.ft_x + tile.ft_y * cols
            //console.log(pointer)
            for (let x = 0; x < tile.ft_w; x++) {
                for (let y = 0; y < tile.ft_h; y++) {
                    const rpointer = pointer + x + pointer * cols
                    space[rpointer] = true
                    //console.log("yüzery", x, y)
                }
            }
        })
    }
    function calculateUntil(index) {
        //console.log("iyi ok")
        var rows = 0
        tiles.forEach(tile => rows = Math.max(rows, tile.ft_y + tile.ft_h))
        //    console.log("sspace", space)
        space = new Array(rows * cols).fill(false)
        //console.log("psacew", space)
        Array.from(tiles).slice(0, index).forEach(tile => {
            const pointer = tile.ft_x + tile.ft_y * cols
            //console.log(pointer)
            for (let x = 0; x < tile.ft_w; x++) {
                for (let y = 0; y < tile.ft_h; y++) {
                    const rpointer = pointer + x + pointer * cols
                    space[rpointer] = true
                    //console.log("yüzery", x, y)
                }
            }
        })
    }
    //console.log("sspace", space)
    function isEmpty(x, y) {
        return (space) ? (!space[x + y * cols]) : false
    }
    return { isEmpty, calculate, calculateUntil, space: () => space }
}
function spaceMatrix(radius) {
    if (radius < 1) {
        throw new Error("radius too small")
    }

    const sideLength = radius
    var corners = [[radius, 0], [0, radius], [-radius, 0], [0, -radius]]
    const arith = [[-1, 1], [-1, -1], [1, -1], [1, 1]]
    var result = []
    corners.forEach((corner, i) => {
        result.push(corner)
        var last = [corner[0], corner[1]]
        const r = arith[i]
        for (let n = 0; n < (radius - 1); n++) {
            last = [last[0] + r[0], last[1] + r[1]]
            result.push(last)
        }
    })
    console.log("sideLength", sideLength)
    return result
}
window.spaceMatrix = spaceMatrix
function flowTile(container) {
    var containerPadding = 20;
    var tileMargin = 10;
    var columns = 4;
    container.classList.add("ft-container")
    var eventLog = []
    function calculateCycle() {
        containerPadding = calculations.pad_margin(containerPadding)
        tileMargin = calculations.redefine(tileMargin, 10)

        const size = [container.clientWidth, container.clientHeight]
        const safeArea = [size[0] - containerPadding[1] - containerPadding[3], size[1] - containerPadding[0] - containerPadding[2]]
        // console.log("pad ", containerPadding)
        const baseSize = (safeArea[0] - tileMargin * (columns - 1)) / columns
        container.style.setProperty("--fl-tile-w-1", baseSize + "px")
        container.style.setProperty("--fl-tile-w-2", baseSize * 2 + tileMargin + "px")
        container.style.setProperty("--fl-tile-w-4", baseSize * 4 + tileMargin * 3 + "px")
        container.style.setProperty("--fl-tile-m", tileMargin + "px")
        container.style.setProperty("--fl-container-p-t", containerPadding[0] + "px")
        container.style.setProperty("--fl-container-p-r", containerPadding[1] + "px")
        container.style.setProperty("--fl-container-p-b", containerPadding[2] + "px")
        container.style.setProperty("--fl-container-p-l", containerPadding[3] + "px")

        const tiles = container.querySelectorAll("div.ft-tile")
        tiles.forEach(tile => {
            tile.style.setProperty("left", "200px")
            tile.style.setProperty("top", "200px")
            tile.style.setProperty("background", "red")
            tile.ft_placed = false;
        });
        tiles.forEach(tile => {
            const maxx = columns - tile.ft_w
            tile.ft_x = Math.min(tile.ft_x, maxx)
            tile.setAttribute("ft-x", tile.ft_x)
            tile.setAttribute("ft-x", tile.ft_y)
            tile.setAttribute("ft-w", tile.ft_w)
            tile.setAttribute("ft-h", tile.ft_h)
            tile.classList.remove("ft-size-s")
            tile.classList.remove("ft-size-m")
            tile.classList.remove("ft-size-w")
            tile.classList.remove("ft-size-l")
            const invalidSize = new Error("invalid size")
            if (tile.ft_w == 1) {
                if (tile.ft_h == 1) {
                    tile.classList.add("ft-size-s")
                } else {
                    throw invalidSize
                }
            } else if (tile.ft_w == 2) {
                if (tile.ft_h == 2) {
                    tile.classList.add("ft-size-m")
                } else {
                    throw invalidSize
                }
            } else if (tile.ft_w == 4) {
                if (tile.ft_h == 2) {
                    tile.classList.add("ft-size-w")
                } else if (tile.ft_h == 4) {
                    tile.classList.add("ft-size-l")
                } else {
                    throw invalidSize
                }
            } else {
                throw invalidSize
            }
        })
        const sd = spaceDetector(tiles, columns)
        // console.log(sd)
        tiles.forEach((tile, index) => {
            sd.calculateUntil(index)
            var pos;
            //console.log("space", sd.space())

            if (sd.isEmpty(tile.ft_x, tile.ft_y)) {
                pos = [tile.ft_x, tile.ft_y]
            }
            //console.log(pos)
            if (pos) {
                tile.style.setProperty("left", containerPadding[3] + pos[0] * baseSize + pos[0] * tileMargin + "px")
                //console.log("pad", containerPadding[3] + pos[0] * baseSize)
                tile.style.setProperty("top", containerPadding[0] + pos[1] * baseSize + pos[1] * tileMargin + "px")
                tile.style.removeProperty("background")
                tile.ft_placed = true;
            }
        })
        const left_outs = Array.from(tiles).filter(tile => !tile.ft_placed)
        left_outs.forEach(left_out => {
            var radius
        });
        console.log("leftouts", left_outs.length)
        sd.calculate()

    }
    function editMode(bool) {

    }
    function addTile(tile) {
        tile.parentContainer = container
        tile.removeTile = () => removeTile(tile)
        eventLog.push({ event: eventLogTypes.tileAdded, tile: tile, data: { x: tile.ft_x, y: tile.ft_y, w: tile.ft_w, h: tile.ft_h } })
        container.append(tile)
    }
    function removeTile(tile) {

    }
    calculateCycle()
    return { columns, containerPadding, tileMargin, editMode, eventLog, addTile, removeTile, calculateCycle }
}
const flowTileLib = { flowTile, tile }
export { flowTile, tile };
export default flowTileLib;