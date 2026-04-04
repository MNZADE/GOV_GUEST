import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBtFr-9eDRr9_BergOg5SFVWYzag-i_3fk",
  authDomain: "govguest-84ea5.firebaseapp.com",
  projectId: "govguest-84ea5",
  storageBucket: "govguest-84ea5.appspot.com",
  messagingSenderId: "133948708954",
  appId: "1:133948708954:web:13801e353c80aa906da063",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
