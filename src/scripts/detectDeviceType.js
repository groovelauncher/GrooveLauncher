function detectDeviceType() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    // Get the width and height of the screen
    var screenWidth = document.body.clientWidth;
    var screenHeight = document.body.clientHeight;

    // Calculate the diagonal length using the Pythagorean theorem (hypotenuse)
    var diagonalLength = Math.sqrt(
        Math.pow(screenWidth, 2) + Math.pow(screenHeight, 2)
    );
    // Define thresholds for phone and tablet diagonal lengths
    var phoneThreshold = 1100; // Threshold for phones (adjust as needed)
    var tabletThreshold = 900; // Threshold for tablets (adjust as needed)
    //   console.log(diagonalLength)
    // Determine the device type based on diagonal length
    var answer = "phone";

    if (urlParams.has("tablet")) {
        if (urlParams.get("tablet").toLowerCase() == "true") {
            answer = "tablet";
        } else {
            answer = "phone";
        }
    } else {
        if (diagonalLength <= phoneThreshold) {
            answer = "phone";
        } else if (diagonalLength <= tabletThreshold) {
            answer = "tablet";
        } else {
            answer = "tablet"; // Assume desktop for larger screens
        }
    }

    if (answer == "tablet") {
        document.body["TABLET_VIEW"] = true;
        document.body.classList.add("TABLET_VIEW");
    } else {
        document.body["TABLET_VIEW"] = false;
        document.body.classList.remove("TABLET_VIEW");
    }
   // springBoard.relocateIcons();
    return answer;
}
export default detectDeviceType