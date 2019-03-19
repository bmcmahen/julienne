import * as React from "react";
import { useSession } from "../auth";
import { useCollection } from "react-firebase-hooks/firestore";
import * as firebase from "firebase/app";

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

// honestly, this is where firebase drives me mad. Would
// be so easy with postgres
export function useFollowers(toUser = true) {
  const user = useSession();

  const [loading, setLoading] = React.useState(true);
  const [userList, setUserList] = React.useState({});

  const key = toUser ? "toUserId" : "fromUserId";
  const docKey = toUser ? "fromUserId" : "toUserId";

  React.useEffect(() => {
    firebase
      .firestore()
      .collection("relations")
      .where(key, "==", user.uid)
      .orderBy("confirmed")
      .limit(50)
      .get()
      .then(value => {
        const promises = [];

        value.docs.forEach(doc => {
          if (userList[doc.id]) {
            return;
          }

          const request = {
            ...doc.data()
          };

          promises.push(
            firebase
              .firestore()
              .collection("users")
              .doc(doc.get(docKey))
              .get()
              .then(user => {
                request.user = user.data();
                setUserList({
                  ...userList,
                  [doc.id]: request
                });
              })
          );
        });

        setLoading(true);
        Promise.all(promises).then(() => {
          setLoading(false);
        });
      });
  }, []);

  return { loading, userList };
}
