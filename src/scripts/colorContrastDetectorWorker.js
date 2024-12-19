self.onmessage = function (e) {
    const { imageData, width, height, sampleSize } = e.data;
    let r = 0, g = 0, b = 0, count = 0;

    // Process image data with sampling
    for (let y = 0; y < height; y += sampleSize) {
        for (let x = 0; x < width; x += sampleSize) {
            const index = (y * width + x) * 4;
            r += imageData[index];        // Red
            g += imageData[index + 1];    // Green
            b += imageData[index + 2];    // Blue
            count++;
        }
    }

    // Calculate average color
    r = Math.floor(r / count);
    g = Math.floor(g / count);
    b = Math.floor(b / count);

    self.postMessage({ r, g, b });  // Send the result back to the main thread
};