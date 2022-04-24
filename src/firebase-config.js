// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const config = {
  apiKey: "AIzaSyCmqYXL3Gu1iCAfOSQyeeEfaVUZga0hq-Q",
  authDomain: "library-ababc.firebaseapp.com",
  projectId: "library-ababc",
  storageBucket: "library-ababc.appspot.com",
  messagingSenderId: "274349449011",
  appId: "1:274349449011:web:1010b9436607fee21ba846"
};

export function getFirebaseConfig() {
  if (!config || !config.apiKey) {
    throw new Error('No Firebase configuration object provided.' + '\n' +
    'Add your web app\'s configuration object to firebase-config.js');
  } else {
    return config;
  }
}