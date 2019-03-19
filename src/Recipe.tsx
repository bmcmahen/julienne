/** @jsx jsx */
import { jsx } from "@emotion/core";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import firebase from "firebase/app";
import { Compose } from "./Compose";
import { useSession } from "./auth";
import { useDocument } from "react-firebase-hooks/firestore";

export interface RecipeProps extends RouteComponentProps {
  match: any;
}

export const Recipe: React.FunctionComponent<RecipeProps> = ({ match }) => {
  const user = useSession();
  const { value } = useDocument(
    firebase
      .firestore()
      .collection("recipes")
      .doc(match.params.id)
  );

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
