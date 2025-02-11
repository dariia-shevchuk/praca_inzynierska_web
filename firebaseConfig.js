// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
// import { firebase } from '@react-native-firebase/app';
// import '@react-native-firebase/functions';
// import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
// import { getFirestore } from "firebase/firestore";
// import { getFunctions } from 'firebase/functions';
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCOB-ThqYARt4JRlG-QAqXWA8cyrz7fRhU",
  authDomain: "dyplomapp-f2d40.firebaseapp.com",
  projectId: "dyplomapp-f2d40",
  storageBucket: "dyplomapp-f2d40.appspot.com",
  messagingSenderId: "518444753378",
  appId: "1:518444753378:web:635c35503f7ece45c659bb"
};

// Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const auth = initializeAuth(app, {
//   persistence: getReactNativePersistence(ReactNativeAsyncStorage)
// });
// const db = getFirestore(app);
// const functions = getFunctions(app);

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };