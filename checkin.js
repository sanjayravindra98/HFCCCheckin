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

// checkin.js or your authentication control script
auth.onAuthStateChanged((user) => {
    if (!user) {
        // User is not authenticated; redirect to login page
        window.location.href = "./index.html"; // Redirect to login
    } else {
        // User is authenticated; you can proceed with displaying the checkin page
    }
});

var db = firebase.firestore();

// Retrieve students from Firestore
db.collection("students").get()
.then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
        // Get the student data
        var studentData = doc.data();

        // Create and populate an element on your webpage with the student data
        var studentElement = document.createElement("label");
        studentElement.className = "student-button";
        studentElement.textContent = studentData.name;

        // Append the element to the appropriate group container
        var groupContainer = document.querySelector('h2:contains("' + studentData.group + '")');
        if (groupContainer) {
            groupContainer.parentElement.appendChild(studentElement);
        }
    });
})
.catch(function(error) {
    console.error("Error retrieving students: ", error);
});
