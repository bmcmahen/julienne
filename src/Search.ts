import * as firebase from "firebase/app";
import algoliasearch from "algoliasearch";
import config from "./firebase-config";
import debug from "debug";

const { projectId, ALGOLIA_APP_ID } = config;
const log = debug("app:Search");

class Search {
  client?: algoliasearch.Client;
  index?: algoliasearch.Index;
  idToken?: string;
  path: string;

  constructor(path = "/query/") {
    this.path = path;
  }

  getIndex = async () => {
    try {
      const user = await firebase.auth().currentUser;
      if (!user) {
        throw new Error("No user found");
      }
      this.idToken = await user.getIdToken();
      const existingKey = window.sessionStorage.getItem(this.path);

      if (!existingKey) {
        const response = await window.fetch(
          "https://us-central1-" +
            projectId +
            ".cloudfunctions.net/api" +
            this.path,
          {
            headers: { Authorization: "Bearer " + this.idToken }
          }
        );
        const data = await response.json();
        if (data.key) {
          window.sessionStorage.setItem(this.path, data.key);
          this.client = algoliasearch(ALGOLIA_APP_ID, data.key);
        }
      } else {
        this.client = algoliasearch(ALGOLIA_APP_ID, existingKey);
      }

      this.index = this.client!.initIndex("posts");
      return this.index;
    } catch (err) {
      throw err;
    }
  };

  search = async (query: string) => {
    if (!this.index) {
      // ideally, we can fetch the index only if
      // the user is going to search something.
      // But this causes a weird (and delayed) UI experience
      // for now, so we need to call getIndex beforehand.
      await this.getIndex();
    }

    if (!this.index) {
      throw new Error("Index not defined");
    }

    log("query: %s", query);
    return this.index.search({
      query
    });
  };
}

export default new Search();

export const following = new Search("/following/");
