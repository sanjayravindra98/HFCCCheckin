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
                                        const studentButton = createStudentButton(studentData);

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

function createStudentButton(studentData) {
  const studentButton = document.createElement('button');
  studentButton.classList.add('student-button');
  studentButton.textContent = studentData.name;

  // Set the button color based on "present" status or selection
  if (studentData.present) {
      studentButton.classList.add('selected-green'); // Add green class for present students
  } else if (selectedStudents.includes(studentData)) {
      studentButton.classList.add('selected-white'); // Add white class for selected, not confirmed
  } else {
      studentButton.classList.add('selected-blue'); // Add blue class for default
  }

  // Add click event listener for student button
  studentButton.addEventListener('click', () => {
      handleStudentButtonClick(studentData, studentButton);
  });

  return studentButton;
}


function handleStudentButtonClick(studentData, studentButton) {
    const isPresent = studentData.present;
    const isSelected = selectedStudents.includes(studentData);
    const isCurrentlySelectingGreen = selectedStudents.some(student => student.present);
    const isCurrentlySelectingBlue = selectedStudents.some(student => !student.present);

    if (isCurrentlySelectingGreen && !isPresent) {
        return;
    }

    if (isCurrentlySelectingBlue && isPresent) {
        return;
    }

    if (isPresent && isSelected) {
        // Student is already marked present and selected, deselect it
        const index = selectedStudents.indexOf(studentData);
        if (index !== -1) {
            selectedStudents.splice(index, 1);
        }
        // Change the button color back to blue with white text
        studentButton.classList.remove('selected-white-green'); // Remove green text class
        studentButton.classList.add('selected-blue'); // Add blue text class
    } else if (!isPresent && isSelected) {
        // Student is not marked present but selected, deselect it
        const index = selectedStudents.indexOf(studentData);
        if (index !== -1) {
            selectedStudents.splice(index, 1);
        }
        // Change the button color back to blue with white text
        studentButton.classList.remove('selected-white-green'); // Remove green text class
        studentButton.classList.add('selected-blue'); // Add blue text class
    } else if (isPresent && !isSelected) {
        // Student is already marked present but not selected, select it
        selectedStudents.push(studentData);
        // Change the button color to white with green text to indicate selection
        studentButton.classList.remove('selected-blue'); // Remove blue text class
        studentButton.classList.add('selected-white-green'); // Add green text class
    } else {
        // Student is not marked present and not selected, select it
        selectedStudents.push(studentData);
        // Change the button color to white with blue text to indicate selection
        studentButton.classList.remove('selected-blue'); // Remove blue text class
        studentButton.classList.add('selected-white-blue'); // Add green text class
    }

    // Show the "Confirm" or "Undo" button based on the selection
    const confirmButton = document.querySelector('.confirm');
    const undoButton = document.querySelector('.undo');
    const canConfirm = selectedStudents.length > 0 && !selectedStudents.every(student => student.present);
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

          // Iterate through selected students and update their "present" status
          selectedStudents.forEach((studentData) => {
            studentsSubcollectionRef
              .where('name', '==', studentData.name)
              .get()
              .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  doc.ref.update({ present: false })
                    .then(() => {
                      // Refresh the page after marking students as not present
                      location.reload();
                    })
                    .catch((error) => {
                      console.error('Error marking student as not present:', error);
                    });
                });
              })
              .catch((error) => {
                console.error('Error marking student as not present:', error);
              });
          });
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

          // Iterate through selected students and update their "present" status
          selectedStudents.forEach((studentData) => {
            studentsSubcollectionRef
              .where('name', '==', studentData.name)
              .get()
              .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  doc.ref.update({ present: true })
                    .then(() => {
                      // Refresh the page after marking students as present
                      location.reload();
                    })
                    .catch((error) => {
                      console.error('Error marking student as present:', error);
                    });
                });
              })
              .catch((error) => {
                console.error('Error marking student as present:', error);
              });
          });
        }
      })
      .catch((error) => {
        console.error('Error fetching session:', error);
      });
  }
}

// Function to handle the click event for the "Back" button
function handleBackButtonClick() {
  // Clear local storage
  sessionStorage.clear();
  // Redirect to "./sessionselector"
  window.location.href = './sessionselector.html'; // Update the URL as needed
}

// Add click event listener for the "Back" button
const backButton = document.getElementById('back-button');
backButton.addEventListener('click', handleBackButtonClick);


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
