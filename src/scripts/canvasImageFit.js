function cover(ctx, image, x1, y1, x2, y2) {
    const [x, y, width, height] = [x1, y1, x2, y2];
    const imgRatio = image.width / image.height;
    const rectRatio = width / height;

    let drawWidth, drawHeight;

    if (imgRatio < rectRatio) {
        drawWidth = width;
        drawHeight = width / imgRatio;
    } else {
        drawWidth = height * imgRatio;
        drawHeight = height;
    }

    const drawX = x + (width - drawWidth) / 2;
    const drawY = y + (height - drawHeight) / 2;

    ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

function contain(ctx, image, x1, y1, x2, y2) {
    const [x, y, width, height] = [x1, y1, x2, y2];
    const imgRatio = image.width / image.height;
    const rectRatio = width / height;

    let drawWidth, drawHeight;

    if (imgRatio > rectRatio) {
        drawWidth = width;
        drawHeight = width / imgRatio;
    } else {
        drawWidth = height * imgRatio;
        drawHeight = height;
    }

    const drawX = x + (width - drawWidth) / 2;
    const drawY = y + (height - drawHeight) / 2;

    ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}
const canvasImageFit = {
    contain: contain,
    cover: cover
}
export { contain, cover };
export default canvasImageFit;