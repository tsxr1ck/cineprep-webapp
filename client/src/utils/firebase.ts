// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBzRWGl2tcCnTw0MQFSnJv54rBBvY0CXRU",
    authDomain: "cineprepmx.firebaseapp.com",
    projectId: "cineprepmx",
    storageBucket: "cineprepmx.firebasestorage.app",
    messagingSenderId: "924877663237",
    appId: "1:924877663237:web:b43156a6a7ad714946406c",
    measurementId: "G-YH4FHL0YVD"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);