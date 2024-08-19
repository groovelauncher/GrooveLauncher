function applyOverscroll(bs) {
  (bs.options.outOfBoundaryDampingFactor = 1), bs.refresh();
  const content = bs.content,
    wrapper = bs.wrapper;
  function overscrollBounce(transformStyle, x, y) {
    const max = [bs.maxScrollX, bs.maxScrollY],
      maxBounce = 125,
      scale = 58 / 62;
    var newScale = [1, 1];
    x > 125
      ? transformStyle.push(`translateX(${125 - x}px)`)
      : x < max[0] - 125 &&
        transformStyle.push(`translateX(${max - x + 125}px)`),
      y > 125
        ? transformStyle.push(`translateY(${125 - y}px)`)
        : y < max[1] - 125 &&
          transformStyle.push(`translateY(${max - y + 125}px)`),
      (x = Math.min(125, Math.max(max[0] - 125, x))),
      (y = Math.min(125, Math.max(max[1] - 125, y))),
      x > 0
        ? (newScale[0] = 1 - (x * (1 - 58 / 62)) / 125)
        : x < max[0] &&
          (newScale[0] = 1 - ((max[0] - x) * (1 - 58 / 62)) / 125),
      y > 0
        ? (newScale[1] = 1 - (y * (1 - 58 / 62)) / 125)
        : y < max[1] &&
          (newScale[1] = 1 - ((max[1] - y) * (1 - 58 / 62)) / 125),
      x > 0
        ? content.style.setProperty("-webkit-transform-origin-x", "0%")
        : x < max[0] &&
          content.style.setProperty("-webkit-transform-origin-x", "100%"),
      y > 0
        ? content.style.setProperty("-webkit-transform-origin-y", "0%")
        : y < max[1] &&
          content.style.setProperty("-webkit-transform-origin-y", "100%"),
      1 != newScale[0] && transformStyle.push(`scaleX(${newScale[0]})`),
      1 != newScale[1] && transformStyle.push(`scaleY(${newScale[1]})`);
  }
  bs.on("scrollEnd", () => {
    content.style.removeProperty("-webkit-transform-origin-y"),
      content.style.removeProperty("-webkit-transform-origin-x");
  }),
    bs.scroller.translater.hooks.on(
      "beforeTranslate",
      (transformStyle, point) => {
        overscrollBounce(transformStyle, point.x, point.y);
      }
    );
}
export default applyOverscroll;
/*
Don't forget to add these to BScroll options
    {
        ...
        bounceTime:300,
        swipeBounceTime:200,
        outOfBoundaryDampingFactor: 1
    }

Example usage:
    const scroller = new BScroll("#element",{
        bounceTime:300,
        swipeBounceTime:200,
        outOfBoundaryDampingFactor: 1
    })
    applyOverscroll(scroller)
*/