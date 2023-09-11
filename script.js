// Get a reference to the button element by its ID
const redirectButton = document.getElementById("redirectButton");

// Add a click event listener to the button
redirectButton.addEventListener("click", function() {
    // Specify the URL you want to redirect to
    const redirectUrl = "https://www.holyfamilycc.com"; // Replace with your desired URL

    // Redirect the user to the specified URL
    window.location.href = redirectUrl;
});
