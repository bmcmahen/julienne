import * as React from "react";
import debug from "debug";

const log = debug("app:paginate-fb");

type StateType = {
  hasMore: boolean;
  items: Map<string, firebase.firestore.DocumentData>;
  after: firebase.firestore.QueryDocumentSnapshot | null;
  lastLoaded: firebase.firestore.QueryDocumentSnapshot | null;
  loadingMore: boolean;
  loadingMoreError: null | Error;
  loading: boolean;
  loadingError: null | Error;
};

type Action<K, V = void> = V extends void ? { type: K } : { type: K } & V;

export type ActionType =
  | Action<"LOAD-MORE">
  | Action<"LOADED", { value: firebase.firestore.QuerySnapshot }>;

const initialState = {
  hasMore: false,
  after: null,
  items: new Map(),
  lastLoaded: null,
  loading: true,
  loadingError: null,
  loadingMore: false,
  loadingMoreError: null
};

const INITIAL_LOAD_SIZE = 25;

function reducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    case "LOADED": {
      const hasMore = action.value.docs.length >= INITIAL_LOAD_SIZE;

      /**
       * Maintain a key/value store of items to make
       * handling changes a bit easier.
       *
       * Unfortunately, this necessitates that we convert our
       * map into an array and sort it using the same criteria
       * as the original query. Not the best solution...
       */

      const items = new Map(state.items);

      action.value.docChanges().forEach(change => {
        if (change.type === "added") {
          items.set(change.doc.id, change.doc.data());
        } else if (change.type === "modified") {
          items.set(change.doc.id, change.doc.data());
        } else if (change.type === "removed") {
          items.delete(change.doc.id);
        }
      });

      return {
        ...state,
        hasMore,
        loading: false,
        loadingError: null,
        lastLoaded: action.value.docs[action.value.docs.length - 1],
        loadingMore: false,
        items
      };
    }

    case "LOAD-MORE": {
      return {
        ...state,
        loadingMore: true,
        after: state.lastLoaded
      };
    }
  }
}

function sortByUpdatedAt(a: any, b: any) {
  return a[1].updatedAt > b[1].updatedAt ? -1 : 1;
}

export function usePaginateQuery(
  query: firebase.firestore.Query,
  compareFn = sortByUpdatedAt
) {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  // when "after" changes, we update our query
  React.useEffect(() => {
    let fn = state.after ? query.startAfter(state.after) : query;

    let unsubscribe = fn.onSnapshot(snap => {
      dispatch({ type: "LOADED", value: snap });
    });

    return () => unsubscribe();
  }, [state.after]);

  // trigger firebase to load more
  function loadMore() {
    dispatch({ type: "LOAD-MORE" });
  }

  return {
    loadingMore: state.loadingMore,
    loadingError: state.loadingError,
    loadingMoreError: state.loadingMoreError,
    loading: state.loading,
    hasMore: state.hasMore,
    items: Array.from(state.items).sort(compareFn),
    loadMore
  };
}
