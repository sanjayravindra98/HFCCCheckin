// Initialize Firebase with your configuration
var firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

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

