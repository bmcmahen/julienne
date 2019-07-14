/** @jsx jsx */
import { jsx } from "@emotion/core";
import * as React from "react";
import usePaginateQuery from "firestore-pagination-hook";
import firebase from "firebase/app";
import {
  Text,
  Spinner,
  useTheme,
  List,
  Button,
  ListItem,
  Skeleton
} from "sancho";
import { RecipeListItem, Recipe } from "./RecipeList";

export interface FollowingRecipesProps {
  id: string;
}

export const FollowingRecipes: React.FunctionComponent<
  FollowingRecipesProps
> = ({ id }) => {
  const theme = useTheme();
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
      .orderBy("updatedAt", "desc"),
    {
      limit: 25
    }
  );

  return (
    <div>
      {!loading && items.length === 0 && (
        <Text
          muted
          css={{
            display: "block",
            fontSize: theme.fontSizes[0],
            margin: theme.spaces.lg
          }}
        >
          This user currently has no recipes listed.
        </Text>
      )}

      <List>
        {loading && (
          <React.Fragment>
            <ListItem
              interactive={false}
              contentBefore={
                <Skeleton
                  css={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%"
                  }}
                />
              }
              primary={<Skeleton css={{ maxWidth: "160px" }} />}
            />
            <ListItem
              interactive={false}
              contentBefore={
                <Skeleton
                  css={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%"
                  }}
                />
              }
              primary={<Skeleton css={{ maxWidth: "200px" }} />}
            />
          </React.Fragment>
        )}
        {items.map(recipe => (
          <RecipeListItem
            id={recipe.id}
            key={recipe.id}
            editable
            recipe={recipe.data() as Recipe}
          />
        ))}
      </List>

      {loadingMore && <Spinner />}
      {loadingError || (loadingMoreError && <div>Loading error...</div>)}

      {hasMore && !loadingMore && (
        <div css={{ textAlign: "center" }}>
          <Button
            onPress={() => {
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
