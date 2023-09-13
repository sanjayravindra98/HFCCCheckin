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
                  const studentButton = document.createElement('button');
                  studentButton.classList.add('student-button');
                  studentButton.textContent = studentData.name;
                  studentButton.addEventListener('click', () => {
                    console.log(`Clicked on ${studentData.name}`);
                  });
                  groupDivs.forEach((groupDiv) => {
                    const groupName = groupDiv.getAttribute('data-group');
                    if (groupName === group) {
                      groupDiv.appendChild(studentButton);
                    }
                  });
                });
              } else {
                // "students" subcollection does not exist, create it by copying from the main "students" collection
                db.collection('students')
                  .where('group', '==', group)
                  .get()
                  .then((mainStudentsSnapshot) => {
                    const batch = db.batch();

                    mainStudentsSnapshot.forEach((mainStudentDoc) => {
                      const studentData = mainStudentDoc.data();
                      // Extract the last name from the student's full name
                      studentData.lastName = studentData.name.split(' ').pop();
                      const studentRef = studentsSubcollectionRef.doc(mainStudentDoc.id);
                      batch.set(studentRef, studentData);
                    });

                    batch.commit().then(() => {
                      // Now that the subcollection is created, populate the page with its content
                      subcollectionSnapshot.forEach((doc) => {
                        const studentData = doc.data();
                        const studentButton = document.createElement('button');
                        studentButton.classList.add('student-button');
                        studentButton.textContent = studentData.name;
                        studentButton.addEventListener('click', () => {
                          console.log(`Clicked on ${studentData.name}`);
                        });
                        groupDivs.forEach((groupDiv) => {
                          const groupName = groupDiv.getAttribute('data-group');
                          if (groupName === group) {
                            groupDiv.appendChild(studentButton);
                          }
                        });
                      });
                    });
                  })
                  .catch((error) => {
                    console.error('Error fetching students from main collection:', error);
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

// Call the function to populate students in each group div
populateStudentsInGroup('8C');
populateStudentsInGroup('8D');
populateStudentsInGroup('8E');
populateStudentsInGroup('8F');
populateStudentsInGroup('8G');
