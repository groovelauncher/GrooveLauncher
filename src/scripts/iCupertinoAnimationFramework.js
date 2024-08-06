function calculateAngle(base, altitude) {
    // Check if the base is zero to avoid division by zero
    if (base === 0) {
        if (altitude === 0) {
            return "bilmiyom"; // Undefined angle
        } else {
            return 90; // If base is zero and altitude is not, it's a vertical line
        }
    }

    // Calculate the tangent of the angle
    let tangent = altitude / base;

    // Calculate the angle in radians
    let angleInRadians = Math.atan(tangent);

    // Convert the angle to degrees
    let angleInDegrees = angleInRadians * (180 / Math.PI);

    return angleInDegrees;
}

class SpeedCalculator {
    constructor() {
        this.positions = [];
        this.speedX = 0;
        this.speedY = 0;
        this.speed = 0;
    }

    calculate(x, y) {
        const now = Date.now();
        this.positions.push({ x, y, time: now });

        if (this.positions.length > 50) {
            this.positions.shift(); // Remove the oldest entry if we have more than 10
        }

        if (this.positions.length > 1) {
            const first = this.positions[0];
            const last = this.positions[this.positions.length - 1];

            const dx = last.x - first.x;
            const dy = last.y - first.y;
            const dt = (last.time - first.time) / 1000; // Convert milliseconds to seconds

            this.speedX = dx / dt;
            this.speedY = dy / dt;

            // Calculate the 2D speed as the Euclidean distance between first and last points
            const distance = Math.sqrt(dx * dx + dy * dy);
            this.speed = distance / dt;
        } else {
            this.speedX = 0;
            this.speedY = 0;
            this.speed = 0;
        }

        return { speedX: this.speedX, speedY: this.speedY, speed: this.speed };
    }

    reset() {
        this.positions = [];
        this.speedX = 0;
        this.speedY = 0;
        this.speed = 0;
    }
}
class Spring {
    constructor(options) {
        const settings = Object.assign({
            initial_velocity: 0,
            initial_position: 1,
            object_mass: 1,
            friction_coefficient: 2,
            spring_constant: 2,
            duration: 1000
        }, options);
        this.options = settings
        this.calculate = function (t) {
            t /= 1000
            function clc(m, b, k, x0, v0, t) {
                t *= 5000 / duration
                var omega = Math.sqrt(((4 * m * k - Math.pow(b, 2)) > 0 ? (4 * m * k - Math.pow(b, 2)) : 0) / (2 * m))
                const a = b / 2 * m
                if (omega == 0) {
                    return Math.pow(Math.E, -a * t) * (x0 + ((v0 + a * x0) / (1 / Number.MAX_SAFE_INTEGER)) * Math.sin((1 / Number.MAX_SAFE_INTEGER) * t))
                } else {
                    return Math.pow(Math.E, -a * t) * (x0 * Math.cos(omega * t) + ((v0 + a * x0) / omega) * Math.sin(omega * t))
                }
            }

            let initial_velocity = this.options.initial_velocity
            let initial_position = this.options.initial_position
            let object_mass = this.options.object_mass
            let friction_coefficient = this.options.friction_coefficient
            let spring_constant = this.options.spring_constant
            let duration = this.options.duration



            if (typeof initial_position == "number") {
                var [m, b, k, x0, v0] = [Number(object_mass), Number(friction_coefficient), Number(spring_constant), Number(initial_position), Number(initial_velocity)]
                return clc(m, b, k, x0, v0, t)
            } else {
                var calculations = []
                initial_velocity.forEach((value, index) => {
                    var [m, b, k, x0, v0] = [Number(object_mass), Number(friction_coefficient), Number(spring_constant), Number(initial_position[index]), Number(initial_velocity[index])]
                    calculations.push(clc(m, b, k, x0, v0, t))
                });
                var result = []
                calculations.forEach(calc => {
                    result.push(calc(t))
                });
                return result;
            }
        }
    }

}
class PageSlider {
    speedCalculator = new SpeedCalculator()
    swipeIndicator = new SwipeIndicator()
    #toPage(x0, x1) { return { pageX: x0, pageY: x1 } }
    #events = {
        lastPosition: [0, 0],
        lastPosition2: [0, 0],
        isPointerDown: false,
        lastSpeed: 0,
        lastScroll: 0,
        pageScroll: 0,
        scroll: 0,
        lastTime: 0,
        scrollToLast: 0,
        scrollTo: (pageX) => {
            this.emit("scroll", { direction: this.swipeIndicator.direction, angle: this.swipeIndicator.angle, scroll: [pageX, 0] })

            pageX = Math.round(pageX)
            this.#events.scroll = pageX
            clearTimeout(this.target.lastClearTransition)
            if (window["scrollmethod"] == undefined || window["scrollmethod"] == 0) {
                this.pages.style.transform = `translateX(${-pageX}px)`
            } else if (window["scrollmethod"] == 1) {
                this.pages.style.left = -pageX + "px"
            } else {
                this.target.style.overflow = "hidden"
                if (pageX < 0) {
                    this.target.scrollLeft = 0
                    this.pages.style.transform = `translateX(${-pageX}px)`
                } else if (pageX > this.target.scrollWidth - this.target.clientWidth) {
                    this.target.scrollLeft = this.target.scrollWidth - this.target.clientWidth
                    this.pages.style.transform = `translateX(${-pageX + (this.target.scrollWidth - this.target.clientWidth)}px)`
                } else {
                    this.target.scrollLeft = pageX
                    this.pages.style.transform = `translateX(${0}px)`
                }
            }

            this.pages.style.transition = `0s`
            this.pages.style.willChange = `transform`

            this.target.lastClearTransition = setTimeout(() => {
                this.pages.style.transition = ""
                this.pages.style.willChange = ``
            }, 1000);
            this.#events.pageScroll = Math.round(pageX / this.target.clientWidth)
            if (this.#events.pageScroll != this.#events.scrollToLast) {
                let maxPage = this.pages.childElementCount - 1
                this.emit("pagechanged", { page: this.#events.pageScroll < 0 ? 0 : this.#events.pageScroll > maxPage ? maxPage : this.#events.pageScroll })
            }
            this.#events.scrollToLast = this.#events.pageScroll

        },
        pointerDown: (x, y) => {
            this.swipeIndicator.reset()
            this.speedCalculator.reset()
            this.#events.lastPosition = [x, y]
            this.#events.lastSpeed = 0

            this.#events.lastScroll = this.#events.scroll
            this.#events.isPointerDown = true
            this.#events.lastTime = Date.now()
            this.target.animationplay = false
            clearTimeout(this.target.lastPointerUpTimeout)
            this.speedCalculator.calculate(x, y)

        },
        pointerUp: (x, y) => {
            if (!this.#events.isPointerDown) return;

            this.speedCalculator.calculate(x, y)
            this.#events.lastSpeed = this.speedCalculator.speedX * 1.5
            this.#events.isPointerDown = false
            var target = this.target
            let scrollTo = this.#events.scrollTo
            var scrolle = this.#events.scroll
            const lascrolle = this.#events.lastScroll
            const start = Date.now()

            let currentPage = Math.round(lascrolle / this.target.clientWidth)
            let nextPage = currentPage
            let maxPage = this.pages.childElementCount - 1
            if (this.#events.lastSpeed >= 20) {
                if (this.swipeIndicator.angle < 45) nextPage -= 1
            } else if (this.#events.lastSpeed <= -20) {
                if (this.swipeIndicator.angle < 45) nextPage += 1

            } else {
                if (currentPage > this.#events.pageScroll) {
                    nextPage -= 1
                } else if (currentPage < this.#events.pageScroll) {
                    nextPage += 1

                }
            }
            nextPage = nextPage < 0 ? 0 : nextPage > maxPage ? maxPage : nextPage
            if (currentPage != nextPage) {
                let maxPage = this.pages.childElementCount - 1

                this.emit("pagechanged", { page: nextPage < 0 ? 0 : nextPage > maxPage ? maxPage : nextPage })
            }
            const sprin = new Spring({
                initial_velocity: this.#events.lastSpeed * -.1,
                initial_position: scrolle - nextPage * this.target.clientWidth,
                spring_constant: 1,
                duration: 300
            })

            if (this.swipeIndicator.angle < 45) {
                target.animationplay = true
                clearTimeout(this.target.lastPointerUpTimeout)
                this.target.lastPointerUpTimeout = setTimeout(() => {
                    target.animationplay = false
                    this.emit("swipefinished")

                }, 800);
                function render() {
                    var springe = sprin.calculate(Date.now() - start)
                    scrollTo(scrolle + springe - sprin.options.initial_position)

                    if (target.animationplay) requestAnimationFrame(render); else{
                        scrollTo(scrolle - sprin.options.initial_position)

                    }

                }
                requestAnimationFrame(render)
            }


        },
        pointerMove: (x, y) => {
            if (!this.#events.isPointerDown) return;
            if (this.swipeIndicator.swipes == 4) {
                this.#events.lastPosition = [x, y]
                this.emit("swipestarted", { direction: this.swipeIndicator.direction, angle: this.swipeIndicator.angle, position: [x, y] })
            }

            if (!this.swipeIndicator.ready) { this.swipeIndicator.calculate(x, y); return };
            if (this.swipeIndicator.direction == "vertical") return;
            this.speedCalculator.calculate(x, y)
            var max = this.target.scrollWidth - this.target.clientWidth
            var scrollt = this.#events.lastPosition[0] - x + this.#events.lastScroll
            function expo(x) {
                return Math.pow(Math.E, -.1 * x)
            }

            if (scrollt <= 0) {
                this.#events.scrollTo(expo(10) * scrollt)

                //this.#events.lastSpeed /= 2
            } else if (scrollt >= max) {
                this.#events.scrollTo(expo(10) * (scrollt - max) + max)

                //this.#events.lastSpeed /= 2
            } else {
                this.#events.scrollTo(scrollt)

            }
            this.target.animationplay = false
            clearTimeout(this.target.lastPointerUpTimeout)
        },
        converter: {
            pointerDown: (e) => this.#events.pointerDown(e.pageX, e.pageY),
            pointerUp: (e) => this.#events.pointerUp(e.pageX, e.pageY),
            pointerMove: (e) => this.#events.pointerMove(e.pageX, e.pageY),
        },
        attachEvents: () => {
            this.target.addEventListener("pointerdown", this.#events.converter.pointerDown)
            window.addEventListener("pointerup", this.#events.converter.pointerUp)
            window.addEventListener("pointermove", this.#events.converter.pointerMove)
        },
        detachEvents: () => {
            this.target.removeEventListener("pointerdown", this.#events.converter.pointerDown)
            window.removeEventListener("pointerup", this.#events.converter.pointerUp)
            window.removeEventListener("pointermove", this.#events.converter.pointerMove)
        }
    }
    events = {};
    constructor(el) {
        if (el["icaf-slider-active"] == undefined) {
            if (el.getAttribute("slider-role") != "slider-wrapper") {
                console.error(`Can't find <div slider-role="slider-wrapper"></div>`)
            } else if (el.querySelectorAll(`div[slider-role="slider-pages"]`).length == 0) {
                console.error(`Can't find <div slider-role="slider-wrapper"></div>`)
            }
            this.target = el
            this.pages = el.querySelector(`div[slider-role="slider-pages"]`)
            el["icaf-slider-active"] = true
            this.scrollTo = this.#events.scrollTo
            this.#events.attachEvents()
            return this
        } else {
            console.error("Element already initialized for slider!")
            return this
        }
    }
    cancel(cancelvelocity) {
        this.#events.pointerUp(this.#events.lastPosition[0], this.#events.lastPosition[1])
    }
    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    }

    // Method to emit events
    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(listener => listener(data));
        }
    }

    // Optional: Method to remove event listeners
    off(event, listenerToRemove) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(listener => listener !== listenerToRemove);
    }
    getCurrentPage() {
        return this.#toPage(this.#events.pageScroll, 0)
    }
    destroy() {
        delete el["icaf-slider-active"];
        this.#events.detachEvents()
        delete this;
    }
}
class SwipeIndicator {
    #positions = [];
    constructor() {
        this.#positions = [];
        this.ready = false;
        this.direction = undefined;
        this.swipes = 0
    }

    calculate(x, y) {
        this.#positions.push({ x, y });
        if (this.#positions.length >= 5) {

            this.ready = true;
        }
        const last = this.#positions.length - 1
        const horizontalDistance = Math.abs(this.#positions[0].x - this.#positions[last].x);
        const verticalDistance = Math.abs(this.#positions[0].y - this.#positions[last].y);
        this.direction = horizontalDistance > verticalDistance ? "horizontal" : "vertical";
        if (this.#positions.length == 2) {
            const angle = calculateAngle(horizontalDistance, verticalDistance)
            this.angle = angle
        }
        this.swipes += 1
    }
    reset() {
        this.#positions = [];
        this.ready = false;
        this.direction = undefined;
        this.swipes = 0
    }
}


export { SpeedCalculator, Spring, PageSlider, SwipeIndicator };
