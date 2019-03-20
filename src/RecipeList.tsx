/** @jsx jsx */
import { jsx } from "@emotion/core";
import * as React from "react";
import algoliasearch from "algoliasearch";
import algolia, { following } from "./Search";
import debug from "debug";
import { useSession } from "./auth";
import firebase from "firebase/app";
import {
  Text,
  List,
  ListItem,
  Spinner,
  Button,
  Icon,
  theme,
  MenuLabel,
  Embed
} from "sancho";
import { Image, useFirebaseImage } from "./Image";
import { Link, NavLink } from "react-router-dom";
import { usePaginateQuery } from "./hooks/paginate-fb";

const log = debug("app:RecipeList");

export interface Ingredient {
  name: string;
  amount: string;
}

type Action<K, V = void> = V extends void ? { type: K } : { type: K } & V;

export interface Recipe {
  id: string;
  title: string;
  plain: string;
  updatedAt: any;
  userId: string;
  image?: string;
  createdBy?: {
    email: string;
    photoURL: string;
  };
  author: string;
  description: string;
  ingredients: Ingredient[];
}

export type ActionType =
  | Action<"QUERY", { value: string }>
  | Action<"SEARCH", { value: algoliasearch.Response }>;

interface StateType {
  searchResponse: algoliasearch.Response | null;
  query: string;
}

const initialState = {
  searchResponse: null,
  query: ""
};

function reducer(state: StateType, action: ActionType) {
  switch (action.type) {
    case "QUERY":
      return {
        ...state,
        query: action.value
      };

    case "SEARCH":
      return {
        ...state,
        searchResponse: action.value
      };
  }
}

export interface RecipeListProps {
  query: string;
}

export const RecipeList: React.FunctionComponent<RecipeListProps> = ({
  query
}) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const user = useSession();

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
      .where("userId", "==", user!.uid)
      .orderBy("updatedAt", "desc")
      .limit(25)
  );

  // perform an algolia query when query changes
  React.useEffect(() => {
    if (query) {
      log("query: %s", query);
      algolia.search(query).then(results => {
        log("results: %o", results);
        dispatch({
          type: "SEARCH",
          value: results
        });
      });
    }
  }, [query]);

  // retrieve our algolia search index on mount
  React.useEffect(() => {
    algolia.getIndex();
  }, []);

  return (
    <div>
      {query && state.searchResponse ? (
        <div>
          <List>
            {state.searchResponse.hits.map(hit => (
              <RecipeListItem
                key={hit.objectID}
                editable={hit.userId === user!.uid}
                recipe={hit}
                id={hit.objectID}
                highlight={hit._highlightResult}
              />
            ))}
          </List>
        </div>
      ) : (
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
              You have no recipes listed. Create your first by clicking the plus
              arrow above.
            </Text>
          )}

          <List>
            {items.map(([id, recipe]) => (
              <RecipeListItem
                id={id}
                key={id}
                editable
                recipe={recipe as Recipe}
              />
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
      )}
    </div>
  );
};

interface RecipeListItemProps {
  editable?: boolean;
  recipe: Recipe;
  id: string;
  highlight?: any;
}

function RecipeListItem({
  editable,
  recipe,
  id,
  highlight
}: RecipeListItemProps) {
  const { src, error } = useFirebaseImage("thumb@", recipe.image);

  return (
    <ListItem
      activeStyle={{
        backgroundColor: theme.colors.background.tint1
      }}
      component={NavLink}
      to={`/${recipe.id}`}
      css={{
        "& em": {
          fontStyle: "normal",
          color: theme.colors.text.selected
        }
      }}
      contentAfter={
        recipe.image ? (
          <Embed css={{ width: "80px" }} width={16} height={9}>
            {src ? (
              <img src={src} aria-hidden />
            ) : (
              <div css={{ background: theme.colors.background.tint1 }} />
            )}
          </Embed>
        ) : null
        // <Icon
        //   icon="chevron-right"
        //   aria-hidden
        //   color={theme.colors.text.muted}
        // />
      }
      secondary={
        highlight ? (
          <span dangerouslySetInnerHTML={{ __html: highlight.author.value }} />
        ) : (
          recipe.author
        )
      }
      primary={
        highlight ? (
          <span dangerouslySetInnerHTML={{ __html: highlight.title.value }} />
        ) : (
          recipe.title
        )
      }
    />
  );
}
