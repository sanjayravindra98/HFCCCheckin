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

// Function to handle when a session button is clicked
function handleSessionClick(event) {
    // Get the clicked session date
    var clickedDate = event.target.textContent;

    // Store the clicked date in sessionStorage
    sessionStorage.setItem('clickedDate', clickedDate);

    // Redirect to the "./checkin" page
    window.location.href = './checkin.html'; // Update the URL as needed
}

// Add click event listeners to all session buttons
var sessionButtons = document.querySelectorAll("ul#session-list li");
sessionButtons.forEach(function(button) {
    button.addEventListener("click", handleSessionClick);
});


// Reference to the session list element
var sessionList = document.getElementById("session-list");

// Function to display sessions
function displaySessions() {
    sessionList.innerHTML = ""; // Clear previous sessions

    // Create an array to store session data
    var sessionsArray = [];

    // Retrieve sessions from Firestore and push them into the array
    db.collection("sessions")
    .get()
    .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            var sessionData = doc.data();
            sessionsArray.push(sessionData);
        });

        // Sort the array by date in descending order
        sessionsArray.sort(function(a, b) {
            // Convert date strings to Date objects for comparison
            var dateA = parseDate(a.date);
            var dateB = parseDate(b.date);

            // Sort in descending order (most recent first)
            return dateB - dateA;
        });

        // Iterate through the sorted array and add sessions to the list
        sessionsArray.forEach(function(sessionData) {
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

// Function to parse date strings in the "9/11/23" format
function parseDate(dateString) {
    var parts = dateString.split('/');
    var month = parseInt(parts[0]);
    var day = parseInt(parts[1]);
    var year = parseInt(parts[2]);

    // Create a Date object with the parsed values
    return new Date(year, month - 1, day); // Subtract 1 from month since months are zero-indexed in JavaScript
}

// Initial call to display sessions
displaySessions();

// Reference to the "Add New Session" button
var startSessionBtn = document.getElementById("start-session-btn");

// Function to check if a session for the current date exists
function checkSessionExists() {
    var currentDate = new Date();
    var mm = String(currentDate.getMonth() + 1).padStart(2, "0");
    var dd = String(currentDate.getDate()).padStart(2, "0");
    var yy = String(currentDate.getFullYear()).slice(-2);
    var formattedDate = mm + "/" + dd + "/" + yy;

    // Check if a session with the current date exists in Firestore
    db.collection("sessions")
        .where("date", "==", formattedDate)
        .get()
        .then(function (querySnapshot) {
            if (querySnapshot.size > 0) {
                // A session for the current date exists, hide the button
                startSessionBtn.style.display = "none";
            } else {
                // No session for the current date, show the button
                startSessionBtn.style.display = "block";
            }
        })
        .catch(function (error) {
            console.error("Error checking session existence: ", error);
        });
}

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
        checkSessionExists();
        displaySessions(); // Update the displayed sessions
    })
    .catch(function(error) {
        console.error("Error adding new session: ", error);
    });
}

// Add a click event listener to the "Add New Session" button
startSessionBtn.addEventListener("click", addNewSession);

// Check if a session for the current date exists
checkSessionExists();

