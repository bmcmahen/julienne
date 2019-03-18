/** @jsx jsx */
import { jsx } from "@emotion/core";
import * as React from "react";
import algoliasearch from "algoliasearch";
import algolia from "./Search";
import debug from "debug";
import { useSession } from "./auth";
import firebase from "firebase/app";
import { Text, List, ListItem, Spinner, Button, Icon, theme } from "sancho";

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
  | Action<"LOAD-MORE">
  | Action<"QUERY", { value: string }>
  | Action<"LOADED", { value: firebase.firestore.QueryDocumentSnapshot[] }>
  | Action<"SEARCH", { value: algoliasearch.Response }>;

interface StateType {
  hasMore: boolean;
  recipes: Recipe[];
  after: firebase.firestore.QueryDocumentSnapshot | null;
  lastLoaded: firebase.firestore.QueryDocumentSnapshot | null;
  searchResponse: algoliasearch.Response | null;
  loadingMore: boolean;
  loadingMoreError: null | Error;
  loading: boolean;
  loadingError: null | Error;
  query: string;
}

const initialState = {
  hasMore: false,
  after: null,
  recipes: [],
  lastLoaded: null,
  searchResponse: null,
  loadingMore: false,
  loadingMoreError: null,
  loading: true,
  loadingError: null,
  query: ""
};

const INITIAL_LOAD_SIZE = 25;

function reducer(state: StateType, action: ActionType) {
  switch (action.type) {
    case "LOADED": {
      const hasMore = action.value.length >= INITIAL_LOAD_SIZE;

      return {
        ...state,
        hasMore,
        loading: false,
        loadingError: null,
        lastLoaded: action.value[action.value.length - 1],
        loadingMore: false,
        recipes: [
          ...state.recipes,
          ...action.value.map(post => {
            const data = post.data() as Recipe;
            return {
              id: post.id,
              ...data
            };
          })
        ]
      };
    }

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

    case "LOAD-MORE":
      return {
        ...state,
        loadingMore: true,
        after: state.lastLoaded
      };
  }
}

export interface RecipeListProps {}

export const RecipeList: React.FunctionComponent<RecipeListProps> = () => {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const user = useSession();

  // perform an algolia query when query changes
  React.useEffect(() => {
    if (state.query) {
      algolia.search(state.query).then(results => {
        log("results: %o", results);
        dispatch({
          type: "SEARCH",
          value: results
        });
      });
    }
  }, [state.query]);

  // retrieve our algolia search index on mount
  React.useEffect(() => {
    algolia.getIndex();
  }, []);

  React.useEffect(() => {
    let fn = state.after
      ? firebase
          .firestore()
          .collection("recipes")
          .where("userId", "==", user!.uid)
          .orderBy("updatedAt", "desc")
          .startAfter(state.after)
          .limit(INITIAL_LOAD_SIZE)
      : firebase
          .firestore()
          .collection("recipes")
          .where("userId", "==", user!.uid)
          .orderBy("updatedAt", "desc")
          .limit(INITIAL_LOAD_SIZE);

    const unsubscribe = fn.onSnapshot(snap => {
      dispatch({
        type: "LOADED",
        value: snap.docs
      });
    });

    return () => unsubscribe();
  }, [state.after, user]);

  return (
    <div>
      {state.query && state.searchResponse ? (
        <div>
          <Text>
            Search results for <em>{state.query}</em>
          </Text>
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
          {state.loading && <Spinner center />}

          {!state.loading && state.recipes.length === 0 && (
            <Text>
              You have no recipes listed. Create your first by clicking the plus
              arrow above.
            </Text>
          )}

          <List>
            {state.recipes.map(recipe => (
              <RecipeListItem
                id={recipe.id}
                key={recipe.id}
                editable
                recipe={recipe}
              />
            ))}
          </List>

          {state.loadingMore && <Spinner />}
          {state.loadingError && <div>Loading error...</div>}
          {state.hasMore && !state.loadingMore && (
            <div css={{ textAlign: "center" }}>
              <Button
                onClick={() => {
                  dispatch({
                    type: "LOAD-MORE"
                  });
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
  return (
    <ListItem
      contentAfter={
        <Icon color={theme.colors.palette.gray.light} icon="chevron-right" />
      }
      secondary={recipe.author}
      primary={recipe.title}
    />
  );
}
