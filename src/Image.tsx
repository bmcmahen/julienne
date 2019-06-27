/** @jsx jsx */
import { jsx } from "@emotion/core";
import * as React from "react";
import * as firebase from "firebase/app";
import "firebase/storage";
import { Embed } from "sancho";
import { FadeImage } from "./FadeImage";

interface ImageProps {
  id: string;
  prefix?: string;
  alt: string;
}

export const Image = ({ alt, id, prefix = "thumb@" }: ImageProps) => {
  const { src, error } = useFirebaseImage(prefix, id);

  if (error) {
    return null;
  }

  return (
    <Embed width={1000} height={700}>
      <FadeImage src={src} alt={alt} />
    </Embed>
  );
};

function storeURL(key: string, url: string) {
  window.localStorage.setItem(key, url);
}

function hasURL(key: string) {
  const url = window.localStorage.getItem(key);
  return url || null;
}

/**
 * A wrapper around setState which caches our value
 */

export function useCachedState(key: string) {
  const [state, setState] = React.useState(hasURL(key));

  const options: [string, (nextState: string) => void] = [
    state,
    (nextState: string) => {
      storeURL(key, nextState);
      setState(nextState);
    }
  ];

  return options;
}

/**
 * Fetch and cache our firebase download URL
 * @param prefix string
 * @param id string
 */

export function useFirebaseImage(prefix: string = "thumb@", id?: string) {
  const storage = firebase.storage().ref();
  const key = prefix + id;
  const [imageURL, setImageURL] = useCachedState(key);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (!id) {
      return;
    }

    if (imageURL) {
      return;
    }

    storage
      .child("images/" + key)
      .getDownloadURL()
      .then((url: string) => {
        setImageURL(url);
        setError(null);
      })
      .catch(err => {
        setError(err);
      });
  }, [key]);

  return {
    src: imageURL,
    error
  };
}
