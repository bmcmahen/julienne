const functions = require("firebase-functions");
const algoliasearch = require("algoliasearch");
const admin = require("firebase-admin");

admin.initializeApp();

// Algolia search support
const ALGOLIA_ID = functions.config().algolia.app_id;
const ALGOLIA_ADMIN_KEY = functions.config().algolia.api_key;
const ALGOLIA_SEARCH_KEY = functions.config().algolia.search_key;

const ALGOLIA_INDEX_NAME = "posts";
const ALGOLIA_USER_INDEX_NAME = "users";

const client = algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY);

function getFirebaseUser(req, res, next) {
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer ")
  ) {
    console.error(
      "No Firebase ID token was passed as a Bearer token in the Authorization header.",
      "Make sure you authorize your request by providing the following HTTP header:",
      "Authorization: Bearer <Firebase ID Token>"
    );
    res.status(403).send("Unauthorized");
    return;
  }

  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    idToken = req.headers.authorization.split("Bearer ")[1];
  }

  admin
    .auth()
    .verifyIdToken(idToken)
    .then(decodedIdToken => {
      req.user = decodedIdToken;
      next();
    })
    .catch(error => {
      console.error("Error while verifying Firebase ID token:", error);
      res.status(403).send("Unauthorized");
    });
}

const app = require("express")();
app.use(require("cors")({ origin: true }));

/**
 * Run a search query from the client side
 */

function getFilterStringFromUsers(userId, users = []) {
  let base = `userId:${userId}`;

  // include other users you are following
  users.forEach(id => {
    base += ` OR userId:${id}`;
  });

  return base;
}

function getRelationsForUserId(userId) {
  return admin
    .firestore()
    .collection("relations")
    .where("fromUserId", "==", userId)
    .where("confirmed", "==", true)
    .limit(1000)
    .get()
    .then(snapshot => {
      const userIds = [];
      snapshot.docs.forEach(relation => {
        userIds.push(relation.data().toUserId);
      });
      return userIds;
    });
}

app.get("/query", getFirebaseUser, (req, res) => {
  const userId = req.user.user_id;
  getRelationsForUserId(userId).then(userIds => {
    const params = {
      filters: getFilterStringFromUsers(req.user.user_id, userIds),
      userToken: req.user.user_id
    };

    const key = client.generateSecuredApiKey(ALGOLIA_SEARCH_KEY, params);
    res.json({ key });
  });
});

/**
 * Fetch a key to list all other users recipes
 */

app.get("/following", getFirebaseUser, (req, res) => {
  const userId = req.user.user_id;
  getRelationsForUserId(userId).then(userIds => {
    const filterString = getFilterStringFromUsers(null, userIds);
    const params = {
      filters: filterString,
      userToken: req.user.user_id
    };

    const key = client.generateSecuredApiKey(ALGOLIA_SEARCH_KEY, params);
    res.json({ key });
  });
});

/**
 * Index our text on creation
 */

exports.onRecipeCreated = functions.firestore
  .document("recipes/{recipeId}")
  .onCreate(snap => {
    return indexEntry(snap);
  });

/**
 * Update our algolia index on updates
 */

exports.onRecipeUpdated = functions.firestore
  .document("recipes/{recipeId}")
  .onUpdate(snap => {
    return indexEntry(snap.after);
  });

function indexEntry(entry) {
  const post = entry.data();
  post.objectID = entry.id;
  const index = client.initIndex(ALGOLIA_INDEX_NAME);
  index.setSettings({
    attributesToSnippet: ["text:30"],
    snippetEllipsisText: "…"
  });

  return index.saveObject(post).then(
    p => {
      console.log("saved post", p);
    },
    err => {
      console.error(err);
    }
  );
}

/**
 * Delete our algolia index on deletion
 */

exports.onRecipeDeleted = functions.firestore
  .document("recipes/{recipeId}")
  .onDelete(snap => {
    const index = client.initIndex(ALGOLIA_INDEX_NAME);
    return index.deleteObject(snap.id);
  });

exports.api = functions.https.onRequest(app);

/**
 * Save users to algolia for user searches
 */

exports.onUserCreated = functions.auth.user().onCreate(user => {
  const index = client.initIndex(ALGOLIA_USER_INDEX_NAME);
  const userToSave = Object.assign(
    {},
    {
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      uid: user.uid
    },
    {
      objectID: user.uid
    }
  );

  return Promise.all([
    index.saveObject(userToSave),
    createUserProfile(user.uid, user)
  ]);
});

function createUserProfile(userId, user) {
  return admin
    .firestore()
    .collection("users")
    .doc(userId)
    .set({
      uid: userId,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL
    });
}

const { Storage } = require("@google-cloud/storage");
const gcs = new Storage();
const os = require("os");
const path = require("path");
const fs = require("fs-extra");
const sharp = require("sharp");

exports.onFileChange = functions.storage.object().onFinalize(object => {
  return Promise.all([
    createThumnail(object),
    createThumnail(object, "thumb-sm@", 150, 100)
  ]);
});

function createThumnail(object, prefix = "thumb@", width = 1000, height = 700) {
  const bucket = gcs.bucket(object.bucket);
  const filePath = object.name;
  const fileName = filePath.split("/").pop();
  const bucketDir = path.dirname(filePath);
  const workingDir = path.join(os.tmpdir(), "thumbs");
  const tmpFilePath = path.join(workingDir, "source.png");

  if (
    fileName.includes(prefix) ||
    fileName.includes("thumb-sm@") ||
    !object.contentType.includes("image")
  ) {
    console.log("exiting function");
    return false;
  }

  return fs
    .ensureDir(workingDir)
    .then(() => {
      return bucket.file(filePath).download({ destination: tmpFilePath });
    })
    .then(() => {
      const thumbName = `${prefix}${fileName}`;
      const thumbPath = path.join(workingDir, thumbName);

      return sharp(tmpFilePath)
        .resize(width, height)
        .toFile(thumbPath)
        .then(() => {
          console.log("creating thumb: ", thumbPath, thumbName);

          return bucket.upload(thumbPath, {
            destination: path.join(bucketDir, thumbName)
          });
        });
    })
    .then(() => {
      return fs.remove(workingDir);
    });
}
