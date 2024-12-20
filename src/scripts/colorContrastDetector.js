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
            const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
            //console.log(`getAverageColor executed in ${performance.now() - startTime} ms`);

            resolve({ r, g, b });
        });

        img.addEventListener('error', reject);
    });
}
/*
export async function getAverageColorWithImageBitmap(imageUrl) {
    return new Promise((resolve, reject) => {
        const startTime = performance.now(); // Start timer
        fetch(imageUrl)
            .then((response) => response.blob())
            .then((blob) => createImageBitmap(blob))
            .then((bitmap) => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                const sampleSize = 10; // Optional downscale
                canvas.width = Math.ceil(bitmap.width / sampleSize);
                canvas.height = Math.ceil(bitmap.height / sampleSize);

                ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

                let r = 0, g = 0, b = 0, count = 0;

                for (let i = 0; i < imageData.length; i += 4) {
                    r += imageData[i];
                    g += imageData[i + 1];
                    b += imageData[i + 2];
                    count++;
                }
                console.log(`getAverageColorWithImageBitmap executed in ${performance.now() - startTime} ms`);

                resolve({
                    r: Math.floor(r / count),
                    g: Math.floor(g / count),
                    b: Math.floor(b / count)
                });
            })
            .catch((err) => reject(err));
    });
}
export function getAverageColorWithImageBitmapWithWorker(imageUrl) {
    return new Promise((resolve, reject) => {
        const startTime = performance.now(); // Start timer
        fetch(imageUrl)
            .then((response) => response.blob())
            .then((blob) => createImageBitmap(blob))
            .then((bitmap) => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                const sampleSize = 10; // Optional downscale
                canvas.width = Math.ceil(bitmap.width / sampleSize);
                canvas.height = Math.ceil(bitmap.height / sampleSize);

                ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

                // Send image data to worker for processing
                const worker = new Worker('colorContrastDetectorWorker.js');
                worker.postMessage({ imageData, width: canvas.width, height: canvas.height, sampleSize });

                worker.onmessage = (e) => {
                    const { r, g, b } = e.data;
                    console.log(`getAverageColorWithImageBitmapWithWorker executed in ${performance.now() - startTime} ms`);
                    resolve({ r, g, b });
                    worker.terminate();
                };

                worker.onerror = (err) => {
                    reject(err);
                    worker.terminate();
                };
            })
            .catch((err) => reject(err));
    });
}
    */
export function getTextColor({ r, g, b }) {
    // Calculate the relative luminance
    // Formula: 0.2126 * R + 0.7152 * G + 0.0722 * B
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    // If luminance is high, return dark text color, else return light text color
    return luminance > 128 ? '#000000' : '#FFFFFF'; // Black or White
}