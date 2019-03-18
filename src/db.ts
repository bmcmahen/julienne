import * as firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import config from "./firebase-config";

firebase.initializeApp(config);

export const db = firebase.firestore();

db.enablePersistence().catch(function(err) {
  console.error(err);
});
