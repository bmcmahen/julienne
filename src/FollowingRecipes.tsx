/** @jsx jsx */
import { jsx } from "@emotion/core";
import * as React from "react";
import { usePaginateQuery } from "./hooks/paginate-fb";
import firebase from "firebase/app";
import { Text, Spinner, theme, List, Button } from "sancho";
import { RecipeListItem, Recipe } from "./RecipeList";

export interface FollowingRecipesProps {
  id: string;
}

export const FollowingRecipes: React.FunctionComponent<
  FollowingRecipesProps
> = ({ id }) => {
  const {
    loading,
    loadingError,
    loadingMore,
    loadingMoreError,
    hasMore,
    items,
    loadMore
  } = usePaginateQuery(
    firebase
      .firestore()
      .collection("recipes")
      .where("userId", "==", id)
      .orderBy("updatedAt", "desc")
      .limit(25)
  );

  console.log(loading, items);
  return (
    <div>
      {loading && <Spinner center />}
      {!loading && items.length === 0 && (
        <Text
          muted
          css={{
            display: "block",
            fontSize: theme.sizes[0],
            margin: theme.spaces.lg
          }}
        >
          This user currently has no recipes listed.
        </Text>
      )}

      <List>
        {items.map(([id, recipe]) => (
          <RecipeListItem id={id} key={id} editable recipe={recipe as Recipe} />
        ))}
      </List>

      {loadingMore && <Spinner />}
      {loadingError || (loadingMoreError && <div>Loading error...</div>)}

      {hasMore && !loadingMore && (
        <div css={{ textAlign: "center" }}>
          <Button
            onClick={() => {
              loadMore();
            }}
          >
            Load more
          </Button>
        </div>
      )}
    </div>
  );
};
