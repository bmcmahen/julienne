/** @jsx jsx */
import { jsx } from "@emotion/core";
import * as React from "react";
import { theme } from "sancho";

/**
 * Fade in an image when it loads. Note, this needs to go
 * within an 'Embed' container to work properly
 * @param param0
 */

export interface FadeImageProps {
  src?: string;
  alt?: string;
  hidden?: boolean;
}

export const FadeImage: React.FunctionComponent<FadeImageProps> = ({
  alt,
  src,
  hidden,
  ...other
}) => {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);

  function onLoad() {
    setLoaded(true);
  }

  function onError() {
    setError(true);
  }

  if (error) {
    return null;
  }

  return src ? (
    <img
      onLoad={onLoad}
      onError={onError}
      aria-hidden={hidden}
      css={{
        opacity: loaded ? 1 : 0,
        transition: "opacity 0.1s ease"
      }}
      src={src}
      {...other}
      alt={alt}
    />
  ) : (
    <div css={{ background: theme.colors.background.tint1 }} />
  );
};
