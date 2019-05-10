# Julienne

<div align="center">
  <a href="https://julienne.app">
    <img
    max-width="600px"
    alt="Julienne screenshot showing a list of recipes on the left, and a recipe on the right."
     src="https://raw.githubusercontent.com/bmcmahen/julienne/master/julienne.jpg">
  </a>
</div>
<br />

Julienne is a web app that allows you to share recipes with family and friends.

It's built using the [Sancho-UI](https://github.com/bmcmahen/sancho) design system, Firebase, Typescript, React and Emotion.

[Try it out here](https://julienne.app/).

## How this code works

I'm writing a series of blog posts explaining the code that goes into this project. I'll be adding them here and on my blog when time permits.

**1. [Introducing Sancho UI](https://benmcmahen.com/introducing-sancho/)**

**2. [Using Firebase with React Hooks](https://benmcmahen.com/using-firebase-with-react-hooks/)**

**3. [Building React Components with Gesture Support](https://benmcmahen.com/building-react-components-with-gesture-support/)**

## Running locally

This project is built using `create-react-app`, typescript, and firebase. To get it running properly, you'll need to create your own firebase application and export your firebase configuration in a file at `src/firebase-config.ts`. The config should include algolia configuration, and look something like this:

```js
// src/firebase-config.ts
const config = {
  apiKey: "myapikey",
  authDomain: "my-auth-domain.firebaseapp.com",
  databaseURL: "my-db-url.com",
  projectId: "my-pid",
  storageBucket: "my-storage-bucket",
  messagingSenderId: "my-sender-id",
  ALGOLIA_APP_ID: "my-app-id",
  ALGOLIA_USER_SEARCH_KEY: "my-user-search-key"
};

export default config;
```

You'll also need to install the local dependencies using Yarn or NPM.

```
yarn
```

You'll need to either deploy the functions or emulate them locally. Finally, you can run it:

```
yarn start
```

This runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Deploying

Use firebase-cli to initalize a project in the root directory. Then build your project and deploy.

```
yarn run build
firebase deploy
```

## License

BSD 3-Clause, see the LICENSE file.
