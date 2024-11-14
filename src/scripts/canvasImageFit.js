/**
 * Scales and centers an image to cover the entire rectangle while maintaining aspect ratio.
 * Similar to CSS background-size: cover
 */
function cover(ctx, image, x1, y1, x2, y2) {
    // Convert coordinates to position and dimensions
    const [x, y, width, height] = [x1, y1, x2, y2];
    // Calculate aspect ratios
    const imgRatio = image.width / image.height;
    const rectRatio = width / height;

    let drawWidth, drawHeight;

    // If image is taller than container, match width and overflow height
    if (imgRatio < rectRatio) {
        drawWidth = width;
        drawHeight = width / imgRatio;
    } else {
        // If image is wider than container, match height and overflow width
        drawWidth = height * imgRatio;
        drawHeight = height;
    }

    // Center the image in the container
    const drawX = x + (width - drawWidth) / 2;
    const drawY = y + (height - drawHeight) / 2;

    ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

/**
 * Scales and centers an image to fit within the rectangle while maintaining aspect ratio.
 * Similar to CSS background-size: contain
 */
function contain(ctx, image, x1, y1, x2, y2) {
    // Convert coordinates to position and dimensions
    const [x, y, width, height] = [x1, y1, x2, y2];
    // Calculate aspect ratios
    const imgRatio = image.width / image.height;
    const rectRatio = width / height;

    let drawWidth, drawHeight;

    // If image is wider than container, match width and scale height proportionally
    if (imgRatio > rectRatio) {
        drawWidth = width;
        drawHeight = width / imgRatio;
    } else {
        // If image is taller than container, match height and scale width proportionally
        drawWidth = height * imgRatio;
        drawHeight = height;
    }

    // Center the image in the container
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