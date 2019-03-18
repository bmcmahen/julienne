import * as firebase from "firebase/app";
import "firebase/auth";
import { useContext } from "react";
import { userContext } from "./user-context";

const provider = new firebase.auth.GoogleAuthProvider();

export const useSession = () => {
  const { user } = useContext(userContext);
  return user;
};

export const loginWithGoogle = async () => {
  try {
    const result = await firebase.auth().signInWithPopup(provider);
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const github = new firebase.auth.GithubAuthProvider();

export const loginWithGithub = async () => {
  try {
    const result = await firebase.auth().signInWithPopup(github);
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const loginWithEmail = async (email: string, password: string) => {
  try {
    const results = await firebase
      .auth()
      .signInWithEmailAndPassword(email, password);
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const createUserWithEmail = async (email: string, password: string) => {
  try {
    await firebase.auth().createUserWithEmailAndPassword(email, password);
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const signOut = () => firebase.auth().signOut();
