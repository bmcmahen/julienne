import * as React from "react";
import debug from "debug";

const log = debug("app:paginate-fb");

type StateType = {
  hasMore: boolean;
  items: firebase.firestore.DocumentData[];
  after: firebase.firestore.QueryDocumentSnapshot | null;
  lastLoaded: firebase.firestore.QueryDocumentSnapshot | null;
  loadingMore: boolean;
  limit: number;
  loadingMoreError: null | Error;
  loading: boolean;
  loadingError: null | Error;
};

type Action<K, V = void> = V extends void ? { type: K } : { type: K } & V;

export type ActionType =
  | Action<"LOAD-MORE">
  | Action<
      "LOADED",
      {
        value: firebase.firestore.QuerySnapshot;
        limit: number;
      }
    >;

const initialState = {
  hasMore: false,
  after: null,
  limit: 0,
  items: [],
  lastLoaded: null,
  loading: true,
  loadingError: null,
  loadingMore: false,
  loadingMoreError: null
};

function reducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    case "LOADED": {
      let items = [...state.items];
      let isAdding = false;

      action.value.docChanges().forEach(change => {
        if (change.type === "added") {
          isAdding = true;
          addItem(change.doc, items);
        } else if (change.type === "modified") {
          updateItem(change.doc, items);
        } else if (change.type === "removed") {
          deleteItem(change.doc, items);
        }
      });

      const nextLimit = items.length + action.limit;

      let end = items.length < action.limit || nextLimit === state.limit;

      return {
        ...state,
        hasMore: isAdding ? !end : state.hasMore,
        limit: nextLimit,
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

function findIndexOfDocument(
  doc: firebase.firestore.QueryDocumentSnapshot,
  items: firebase.firestore.DocumentData[]
) {
  return items.findIndex(item => {
    return item.id === doc.id;
  });
}

function updateItem(
  doc: firebase.firestore.QueryDocumentSnapshot,
  items: firebase.firestore.DocumentData[]
) {
  const i = findIndexOfDocument(doc, items);
  items[i] = doc;
}

function deleteItem(
  doc: firebase.firestore.QueryDocumentSnapshot,
  items: firebase.firestore.DocumentData[]
) {
  const i = findIndexOfDocument(doc, items);
  items.splice(i, 1);
}

function addItem(
  doc: firebase.firestore.QueryDocumentSnapshot,
  items: firebase.firestore.DocumentData[]
) {
  const i = findIndexOfDocument(doc, items);
  if (i === -1) {
    items.push(doc);
  }
}

interface PaginationOptions {
  // how many documents should we fetch at a time?
  limit?: number;
}

export function usePaginateQuery(
  query: firebase.firestore.Query,
  { limit = 25 }: PaginationOptions = {}
) {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  // when "after" changes, we update our query
  React.useEffect(() => {
    let fn = query.limit(state.limit || limit);

    let unsubscribe = fn.onSnapshot(snap => {
      dispatch({ type: "LOADED", value: snap, limit });
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
    items: state.items,
    loadMore
  };
}
