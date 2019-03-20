import * as React from "react";
import { useSession } from "../auth";
import { useCollection } from "react-firebase-hooks/firestore";
import * as firebase from "firebase/app";
import debug from "debug";
const log = debug("app:with-follow-requests");

/**
 * Get a list of unconfirmed follow requests,
 * used to notify a user.
 */

export function useFollowRequests() {
  const user = useSession();
  const { error, loading, value } = useCollection(
    firebase
      .firestore()
      .collection("relations")
      .where("toUserId", "==", user.uid)
      .where("confirmed", "==", false)
      .limit(50)
  );

  return {
    error,
    loading,
    value
  };
}

/**
 * Get a list of followers, or users you
 * are following.
 * @param toUser boolean
 */

export function useFollowers(toUser = true) {
  const user = useSession();

  const [loading, setLoading] = React.useState(true);
  const [userList, setUserList] = React.useState([]);

  const key = toUser ? "toUserId" : "fromUserId";

  React.useEffect(() => {
    setLoading(true);

    const unsubcribe = firebase
      .firestore()
      .collection("relations")
      .where(key, "==", user.uid)
      .orderBy("confirmed")
      .limit(100) // todo: support pagination
      .onSnapshot(value => {
        const userList = [];

        value.docs.forEach(doc => {
          const data = doc.data();

          if (!data.fromUser) {
            return;
          }

          userList.push({
            id: doc.id,
            ...data
          });
        });

        log("setting user list: %o", userList);

        setUserList(userList);
        setLoading(false);
      });

    return () => unsubcribe();
  }, []);

  return { loading, userList };
}
