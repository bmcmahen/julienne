import * as firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import config from "./firebase-config";
import debug from "debug";
import omitBy from "lodash.omitby";
import isNil from "lodash.isnil";
import { Ingredient } from "./RecipeList";

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

export function getUserFields(user: UserType) {
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

export interface RecipeOptions {
  title: string;
  plain: string;
  userId: string;
  description: string;
  image?: string;
  createdBy?: {
    email: string;
    photoURL: string;
  };
  author: string;
  ingredients: Ingredient[];
}

export const createEntry = (options: RecipeOptions) => {
  log("save recipe: %o", options);
  return db.collection("recipes").add({
    ...omitBy(options, isNil),
    updatedAt: firebase.firestore.Timestamp.fromDate(new Date())
  });
};

interface RecipeUpdateOptions {
  title: string;
  author: string;
  description: string;
  image?: string;
  createdBy?: {
    email: string;
    photoURL: string;
  };
  plain: string;
  ingredients: Ingredient[];
}

export const updateEntry = (id: string, options: RecipeUpdateOptions) => {
  return db
    .collection("recipes")
    .doc(id)
    .update({
      ...omitBy(options, isNil),
      image: options.image
    });
};

export const deleteEntry = (id: string) => {
  log("delete: %s", id);
  return db
    .collection("recipes")
    .doc(id)
    .delete();
};
