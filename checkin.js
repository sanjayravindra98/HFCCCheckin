// Initialize Firebase with your configuration
  const firebaseConfig = {
    apiKey: "AIzaSyCMjFNxcITUhsQVB_4rVFMQsKdqMPQ425w",
    authDomain: "hfcccheckin.firebaseapp.com",
    projectId: "hfcccheckin",
    storageBucket: "hfcccheckin.appspot.com",
    messagingSenderId: "82135060851",
    appId: "1:82135060851:web:9f4d8a51910fe33163b506"
  };

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

// Reference to the Firestore database
const db = firebase.firestore();


// Function to populate students in the specified group div
function populateStudentsInGroup(group) {
  const groupDivs = document.querySelectorAll('.group');

  groupDivs.forEach((groupDiv) => {
    const groupName = groupDiv.getAttribute('data-group');

    if (groupName === group) {
      // Fetch students from Firestore for the specified group
      db.collection('students')
        .where('group', '==', group)
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const studentData = doc.data();
            const studentButton = document.createElement('button');
            studentButton.classList.add('student-button');
            studentButton.textContent = studentData.name;

            // Add click event handler for student button
            studentButton.addEventListener('click', () => {
              // Handle the click event for the student button here
              console.log(`Clicked on ${studentData.name}`);
            });

            groupDiv.appendChild(studentButton);
          });
        })
        .catch((error) => {
          console.error('Error fetching students:', error);
        });
    }
  });
}

// Call the function to populate students in each group div
populateStudentsInGroup('8C');
populateStudentsInGroup('8D');
populateStudentsInGroup('8E');
populateStudentsInGroup('8F');
populateStudentsInGroup('8G');
