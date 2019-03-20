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
  | Action<"LOADED", { value: firebase.firestore.QuerySnapshot }>
  | Action<"SEARCH", { value: algoliasearch.Response }>;

interface StateType {
  hasMore: boolean;
  recipes: Map<string, Recipe>;
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
  recipes: new Map(),
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
      const hasMore = action.value.docs.length >= INITIAL_LOAD_SIZE;

      // todo:
      // maintain a key:value collection of recipes
      // use docChanges() to determine if we should add,
      // update, or delete entries

      const recipes = new Map(state.recipes);

      action.value.docChanges().forEach(change => {
        if (change.type === "added") {
          recipes.set(change.doc.id, {
            ...change.doc.data(),
            id: change.doc.id
          } as Recipe);
        } else if (change.type === "modified") {
          recipes.set(change.doc.id, {
            ...change.doc.data(),
            id: change.doc.id
          } as Recipe);
        } else if (change.type === "removed") {
          recipes.delete(change.doc.id);
        }
      });

      return {
        ...state,
        hasMore,
        loading: false,
        loadingError: null,
        lastLoaded: action.value.docs[action.value.docs.length - 1],
        loadingMore: false,
        recipes: recipes
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

export interface RecipeListProps {
  query: string;
}

export const RecipeList: React.FunctionComponent<RecipeListProps> = ({
  query
}) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const user = useSession();

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
      log("loaded: %o", snap);
      dispatch({
        type: "LOADED",
        value: snap
      });
    });

    return () => unsubscribe();
  }, [state.after, user]);

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
          {state.loading && <Spinner center />}

          {!state.loading && state.recipes.size === 0 && (
            <Text>
              You have no recipes listed. Create your first by clicking the plus
              arrow above.
            </Text>
          )}

          <List>
            {Array.from(state.recipes)
              .sort((a, b) => (a[1].updatedAt > b[1].updatedAt ? -1 : 1))
              .map(([id, recipe]) => (
                <RecipeListItem id={id} key={id} editable recipe={recipe} />
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
