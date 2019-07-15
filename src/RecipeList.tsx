/** @jsx jsx */
import { jsx } from "@emotion/core";
import * as React from "react";
import algoliasearch from "algoliasearch";
import algolia from "./Search";
import debug from "debug";
import { Link } from "@reach/router";
import { useSession } from "./auth";
import * as firebase from "firebase/app";
import orderBy from "lodash.orderby";
import {
  Text,
  List,
  ListItem,
  Spinner,
  Button,
  useTheme,
  Embed,
  Skeleton
} from "sancho";
import { useFirebaseImage } from "./Image";
import { FadeImage } from "./FadeImage";
import usePaginateQuery from "firestore-pagination-hook";
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
  const theme = useTheme();
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
      .orderBy("updatedAt", "desc"),
    {
      limit: 25
    }
  );

  console.log(items);

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
          {!loading && items.length === 0 && (
            <Text
              muted
              css={{
                display: "block",
                fontSize: theme.fontSizes[0],
                margin: theme.spaces.lg
              }}
            >
              You have no recipes listed. Create your first by clicking the plus
              arrow above.
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
            {orderBy(
              items,
              item => item.get("updatedAt").toMillis(),
              "desc"
            ).map(recipe => (
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
            <div
              css={{
                textAlign: "center",
                marginBottom: theme.spaces.md,
                marginTop: theme.spaces.md
              }}
            >
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

export function RecipeListItem({ recipe, id, highlight }: RecipeListItemProps) {
  const theme = useTheme();
  const { src, error } = useFirebaseImage("thumb-sm@", recipe.image);

  return (
    <ListItem
      wrap={false}
      component={Link}
      to={`/${id}`}
      css={{
        paddingTop: 0,
        paddingBottom: 0,
        height: "56px",
        alignItems: "center",
        display: "flex",
        justifyContent: "space-between",
        "& em": {
          fontStyle: "normal",
          color: theme.colors.text.selected
        },
        "&[aria-current]": {
          background: theme.colors.background.tint1
        },
        "& > *": {
          flex: 1,
          overflow: "hidden"
        }
      }}
      contentAfter={
        recipe.image && !error ? (
          <Embed css={{ width: "60px" }} width={75} height={50}>
            <FadeImage src={src} hidden />
          </Embed>
        ) : null
      }
      // secondary={
      //   highlight ? (
      //     <span dangerouslySetInnerHTML={{ __html: highlight.author.value }} />
      //   ) : (
      //     recipe.author
      //   )
      // }
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
