export function getAverageColor(imageUrl) {
    return new Promise((resolve, reject) => {
        const startTime = performance.now(); // Start timer
        const img = new Image();
        img.crossOrigin = 'anonymous'; // Allows loading images from other domains if CORS headers are set
        img.src = imageUrl;

        img.addEventListener('load', () => {
            // Create a 1x1 canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = 1;
            canvas.height = 1;

            // Draw the image scaled to 1x1
            ctx.drawImage(img, 0, 0, 1, 1);

            // Get the single pixel's color data
            const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
            //console.log(`getAverageColor executed in ${performance.now() - startTime} ms`);

            resolve({ r, g, b, a });
        });

        img.addEventListener('error', reject);
    });
}
export function getTextColor({ r, g, b, a }) {
    // Calculate the relative luminance
    // Formula: 0.2126 * R + 0.7152 * G + 0.0722 * B
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    // If luminance is high, return dark text color, else return light text color
    return a <= 128 ? '#FFFFFF' : luminance > 255 * (5 / 6) ? '#000000' : '#FFFFFF'; // Black or White
}