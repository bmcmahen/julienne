/** @jsx jsx */
import { jsx } from "@emotion/core";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import firebase from "firebase/app";
import { Compose } from "./Compose";
import { useSession } from "./auth";
import { useDocument } from "react-firebase-hooks/firestore";
import { useTheme, Text } from "sancho";

export interface RecipeProps extends RouteComponentProps {
  match: any;
}

export const Recipe: React.FunctionComponent<RecipeProps> = ({ match }) => {
  const theme = useTheme();
  const user = useSession();
  const { value, loading, error } = useDocument(
    firebase
      .firestore()
      .collection("recipes")
      .doc(match.params.id)
  );

  if (loading) {
    return null;
  }

  if (!loading && !value.exists) {
    return null;
  }

  if (error) {
    return (
      <Text
        muted
        css={{
          display: "block",
          padding: theme.spaces.lg,
          textAlign: "center"
        }}
      >
        Oh bummer! A loading error occurred. Please try reloading.
      </Text>
    );
  }

  if (value) {
    return (
      <Compose
        readOnly
        id={match.params.id}
        editable={value.get("userId") === user.uid}
        defaultCredit={value.get("author")}
        defaultDescription={value.get("description")}
        defaultTitle={value.get("title")}
        defaultIngredients={value.get("ingredients")}
        defaultImage={value.get("image")}
      />
    );
  }

  return null;
};
