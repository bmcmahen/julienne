/** @jsx jsx */
import { jsx } from "@emotion/core";
import * as React from "react";
import * as firebase from "firebase/app";
import "firebase/storage";
import { theme } from "sancho";

const storage = firebase.storage().ref();

interface ImageProps {
  id: string;
}

export const Image = ({ id }: ImageProps) => {
  const [imagePath, setImagePath] = React.useState("thumb@_" + id);
  const [imageURL, setImageURL] = React.useState(null);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
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
          paddingTop: "65%",
          marginBottom: theme.spaces.md
        }
      }}
      aria-hidden={true}
      style={{
        backgroundImage: imageURL ? `url(${imageURL})` : "none"
      }}
    />
  );
};
