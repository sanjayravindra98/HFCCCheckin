// Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyCMjFNxcITUhsQVB_4rVFMQsKdqMPQ425w",
    authDomain: "hfcccheckin.firebaseapp.com",
    projectId: "hfcccheckin",
    storageBucket: "hfcccheckin.appspot.com",
    messagingSenderId: "82135060851",
    appId: "1:82135060851:web:9f4d8a51910fe33163b506"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get a reference to the Firebase Authentication object
const auth = firebase.auth();

// Get references to the password input, login button, and login message elements
const passwordInput = document.getElementById("passwordInput");
const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");

// Function to authenticate the user with Firebase using the entered password
function authenticateUserWithFirebase(password) {
    auth.signInWithEmailAndPassword("dummy@example.com", password)
        .then((userCredential) => {
            // User is authenticated
            const user = userCredential.user;
            console.log("Authentication successful", user);
            // Redirect the user to the protected content
            window.location.href = "./sessionselector.html";
        })
        .catch((error) => {
            // Handle authentication errors
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error("Authentication failed:", errorCode, errorMessage);
            // Display an error message to the user
            loginMessage.textContent = "Incorrect password. Please try again.";
            // Clear the password input field
            passwordInput.value = "";
        });
}

// Add a click event listener to the login button
loginButton.addEventListener("click", function() {
    // Get the password entered by the user
    const enteredPassword = passwordInput.value;

    // Authenticate the user with Firebase using the entered password
    authenticateUserWithFirebase(enteredPassword);
});
