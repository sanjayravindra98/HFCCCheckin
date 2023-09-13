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
        // User is authenticated; you can proceed with displaying the check-in page
    }
});

// Reference to the Firestore database
const db = firebase.firestore();

// Function to populate students in the specified group div
function populateStudentsInGroup(group) {
  const groupDivs = document.querySelectorAll('.group');

  // Retrieve the session date from browser session storage
  const sessionDate = sessionStorage.getItem('sessionDate');

  if (sessionDate) {
    // Query the "sessions" collection in Firestore for the session with the matching date
    db.collection('sessions')
      .where('date', '==', sessionDate)
      .get()
      .then((querySnapshot) => {
        if (!querySnapshot.empty) {
          // Session with the matching date exists
          const sessionDoc = querySnapshot.docs[0]; // Assuming there's only one session per date

          // Check if the session has a "students" subcollection
          const studentsSubcollectionRef = sessionDoc.ref.collection('students');

          studentsSubcollectionRef
            .get()
            .then((subcollectionSnapshot) => {
              if (!subcollectionSnapshot.empty) {
                // "students" subcollection exists, populate the page with its content
                const studentsArray = [];
                subcollectionSnapshot.forEach((doc) => {
                  const studentData = doc.data();
                  // Extract the last name from the student's full name
                  studentData.lastName = studentData.name.split(' ').pop();
                  studentsArray.push(studentData);
                });

                // Sort students alphabetically by last name
                studentsArray.sort((a, b) => a.lastName.localeCompare(b.lastName));

                studentsArray.forEach((studentData) => {
                  if (studentData.group === group) {
                    const studentButton = document.createElement('button');
                    studentButton.classList.add('student-button');
                    studentButton.textContent = studentData.name;

                    // Add click event listener for student button
                    studentButton.addEventListener('click', () => {
                      handleStudentButtonClick(studentData, studentButton);
                    });

                    groupDivs.forEach((groupDiv) => {
                      const groupName = groupDiv.getAttribute('data-group');
                      if (groupName === group) {
                        groupDiv.appendChild(studentButton);
                      }
                    });
                  }
                });
              }
            })
            .catch((error) => {
              console.error('Error checking "students" subcollection:', error);
            });
        }
      })
      .catch((error) => {
        console.error('Error fetching session:', error);
      });
  }
}

// Array to store selected students
const selectedStudents = [];

// Function to handle the click event for student buttons
function handleStudentButtonClick(studentData, studentButton) {
  if (selectedStudents.includes(studentData)) {
    // Student is already selected, deselect it
    const index = selectedStudents.indexOf(studentData);
    if (index !== -1) {
      selectedStudents.splice(index, 1);
    }
    // Change the button color back to blue
    studentButton.style.backgroundColor = '#8CB2D9';
  } else if (studentData.present) { // Check if the student is already marked present
    // Student is selected for "Undo," mark as not present
    selectedStudents.push(studentData);
    // Change the button color to white to indicate selection
    studentButton.style.backgroundColor = 'white';
  } else if (!studentData.present) { // Check if the student is not already marked present
    // Student is selected for "Confirm," mark as present
    selectedStudents.push(studentData);
    // Change the button color to green to indicate selection
    studentButton.style.backgroundColor = '#5dc278';
  }

  // Show the "Confirm" or "Undo" button based on the selection
  const confirmButton = document.getElementById('confirm-button');
  const undoButton = document.getElementById('undo-button');
  const canConfirm = selectedStudents.length > 0 && !selectedStudents.some(student => student.present);
  const canUndo = selectedStudents.length > 0 && selectedStudents.some(student => student.present);
  confirmButton.style.display = canConfirm ? 'block' : 'none';
  undoButton.style.display = canUndo ? 'block' : 'none';
}

// Function to handle the click event for the "Undo" button
function handleUndoButtonClick() {
  // Mark selected students as not present in the DB
  const sessionDate = sessionStorage.getItem('sessionDate');
  if (sessionDate) {
    db.collection('sessions')
      .where('date', '==', sessionDate)
      .get()
      .then((querySnapshot) => {
        if (!querySnapshot.empty) {
          const sessionDoc = querySnapshot.docs[0];
          const studentsSubcollectionRef = sessionDoc.ref.collection('students');
          selectedStudents.forEach((studentData) => {
            if (studentData.present) {
              studentsSubcollectionRef
                .where('name', '==', studentData.name)
                .get()
                .then((querySnapshot) => {
                  querySnapshot.forEach((doc) => {
                    doc.ref.update({ present: false });
                  });
                })
                .catch((error) => {
                  console.error('Error marking student as not present:', error);
                });
            }
          });
          // Refresh the page after marking students as not present
          location.reload();
        }
      })
      .catch((error) => {
        console.error('Error fetching session:', error);
      });
  }
}

// Function to handle the click event for the "Confirm" button
function handleConfirmButtonClick() {
  // Mark selected students as present in the DB
  const sessionDate = sessionStorage.getItem('sessionDate');
  if (sessionDate) {
    db.collection('sessions')
      .where('date', '==', sessionDate)
      .get()
      .then((querySnapshot) => {
        if (!querySnapshot.empty) {
          const sessionDoc = querySnapshot.docs[0];
          const studentsSubcollectionRef = sessionDoc.ref.collection('students');
          selectedStudents.forEach((studentData) => {
            studentsSubcollectionRef
              .where('name', '==', studentData.name)
              .get()
              .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  doc.ref.update({ present: true });
                });
              })
              .catch((error) => {
                console.error('Error marking student as present:', error);
              });
          });
          // Refresh the page after marking students as present
          location.reload();
        }
      })
      .catch((error) => {
        console.error('Error fetching session:', error);
      });
  }
}

// Add click event listener for the "Undo" button
const undoButton = document.getElementById('undo-button');
undoButton.addEventListener('click', handleUndoButtonClick);

// Add click event listener for the "Confirm" button
const confirmButton = document.getElementById('confirm-button');
confirmButton.addEventListener('click', handleConfirmButtonClick);

// Call the function to populate students in each group div
populateStudentsInGroup('8C');
populateStudentsInGroup('8D');
populateStudentsInGroup('8E');
populateStudentsInGroup('8F');
populateStudentsInGroup('8G');
