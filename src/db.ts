import * as firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import config from "./firebase-config";
import debug from "debug";

const log = debug("app:db");

firebase.initializeApp(config);

export const db = firebase.firestore();

type UserType = {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL: string;
};

db.enablePersistence().catch(function(err) {
  console.error(err);
});

function getUserFields(user: UserType) {
  return {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL
  };
}

export const requestFollow = (fromUser: UserType, toUser: UserType) => {
  return db.collection("relations").add({
    fromUserId: fromUser.uid,
    toUserId: toUser.uid,
    fromUser: getUserFields(fromUser),
    toUser: getUserFields(toUser),
    confirmed: false
  });
};

export const deleteRequestFollow = (id: string) => {
  log("delete relation: %s", id);
  return db
    .collection("relations")
    .doc(id)
    .delete()
    .then(() => {
      log("deleted: %s", id);
    })
    .catch(err => {
      log("failed to delete: %s", err);
      throw err;
    });
};

export const confirmFollow = (id: string) => {
  return db
    .collection("relations")
    .doc(id)
    .update({ confirmed: true });
};
