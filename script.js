// Get a reference to the button element by its ID
const redirectButton = document.getElementById("redirectButton");

// Add a click event listener to the button
redirectButton.addEventListener("click", function() {
    // Specify the relative path to the target HTML file
    const targetPage = "./index.html"; // Replace with the actual filename

    // Redirect the user to the target HTML page
    window.location.href = targetPage;
});
