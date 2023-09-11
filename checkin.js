// Initialize Firebase with your configuration
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

// Function to check if the user is authenticated as "dummy@example.com"
function checkAuthentication() {
    auth.onAuthStateChanged((user) => {
        if (user && user.email === "dummy@example.com") {
            // User is authenticated as "dummy@example.com"
            // You can allow access to checkin.html here
            console.log("User is authenticated as dummy@example.com");
            window.location.href = "./checkin.html"; // Redirect to checkin.html
        } else {
            // User is not authenticated or is not "dummy@example.com"
            // You can redirect them to the login page or display an error message
            console.log("User is not authenticated or is not dummy@example.com");
            window.location.href = "./index.html"; // Redirect to login.html or another page
        }
    });
}

// Call the function to check authentication status
checkAuthentication();
