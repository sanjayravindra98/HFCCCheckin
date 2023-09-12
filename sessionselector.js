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

// checkin.js or your authentication control script
auth.onAuthStateChanged((user) => {
    if (!user) {
        // User is not authenticated; redirect to login page
        window.location.href = "./index.html"; // Redirect to login
    } else {
        // User is authenticated; you can proceed with displaying the checkin page
    }
});

// Initialize Firestore
var db = firebase.firestore();

// Reference to the session list element
var sessionList = document.getElementById("session-list");

// Function to display sessions
function displaySessions() {
    sessionList.innerHTML = ""; // Clear previous sessions

    // Retrieve sessions from Firestore
    db.collection("sessions").get()
    .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            var sessionData = doc.data();
            var sessionDate = sessionData.date;

            // Create a list item for each session
            var listItem = document.createElement("li");
            listItem.textContent = sessionDate;
            sessionList.appendChild(listItem);
        });
    })
    .catch(function(error) {
        console.error("Error retrieving sessions: ", error);
    });
}

// Initial call to display sessions
displaySessions();

// Reference to the "Add New Session" button
var addSessionBtn = document.getElementById("add-session-btn");

// Function to add a new session
function addNewSession() {
    var currentDate = new Date();
    var mm = String(currentDate.getMonth() + 1).padStart(2, "0");
    var dd = String(currentDate.getDate()).padStart(2, "0");
    var yy = String(currentDate.getFullYear()).slice(-2);
    var formattedDate = mm + "/" + dd + "/" + yy;

    // Add the new session to Firestore
    db.collection("sessions").add({
        date: formattedDate
    })
    .then(function() {
        console.log("New session added successfully");
        displaySessions(); // Update the displayed sessions
    })
    .catch(function(error) {
        console.error("Error adding new session: ", error);
    });
}

// Add a click event listener to the "Add New Session" button
addSessionBtn.addEventListener("click", addNewSession);

