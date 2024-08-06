// imageStorage.js
function imageToBase64(img, callback) {
    const reader = new FileReader();
    reader.onloadend = () => callback(reader.result);
    reader.readAsDataURL(img);
}

export function write(id, image) {
    imageToBase64(image, (base64Image) => {
        localStorage.setItem(id, base64Image);
        console.log(`Image saved with id: ${id}`);
    });
}

export function read(id) {
    const base64Image = localStorage.getItem(id);
    if (base64Image) {
        console.log(`Image retrieved with id: ${id}`);
        return base64Image;
    } else {
        console.log(`No image found with id: ${id}`);
        return null;
    }
}
