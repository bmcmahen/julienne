/** @jsx jsx */
import { jsx } from "@emotion/core";
import * as React from "react";
import * as firebase from "firebase/app";
import "firebase/storage";
import { theme } from "sancho";

interface ImageProps {
  id: string;
  prefix?: string;
}

export const Image = ({ id, prefix = "thumb@" }: ImageProps) => {
  const { src, error } = useFirebaseImage(prefix, id);

  return (
    <div
      css={{
        background: "#fafafa",
        width: "100%",
        backgroundPosition: "50%",
        paddingTop: "65%",
        backgroundSize: "cover",
        [theme.breakpoints.sm]: {
          paddingTop: "35%"
        },
        [theme.breakpoints.md]: {
          paddingTop: "35%",
          marginBottom: theme.spaces.md
        }
      }}
      aria-hidden={true}
      style={{
        backgroundImage: src ? `url(${src})` : "none"
      }}
    />
  );
};

export function useFirebaseImage(prefix: string, id?: string) {
  const storage = firebase.storage().ref();
  const [imagePath, setImagePath] = React.useState("thumb@_" + id);
  const [imageURL, setImageURL] = React.useState(null);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (!id) {
      return;
    }

    storage
      .child(imagePath)
      .getDownloadURL()
      .then(url => {
        setImageURL(url);
      })
      .catch(err => {
        if (imagePath !== "images/" + id) {
          setImagePath("images/" + id);
        } else {
          setError(err);
        }
      });
  }, [imagePath]);

  return {
    src: id ? imageURL : null,
    error
  };
}
