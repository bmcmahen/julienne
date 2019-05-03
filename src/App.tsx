/** @jsx jsx */
import { jsx, Global } from "@emotion/core";
import * as firebase from "firebase/app";
import { Router, Redirect } from "@reach/router";
import { Login } from "./LoginPane";
import { Branding } from "./Branding";
import { Spinner } from "sancho";
import { Main } from "./Main";
import { useAuthState } from "react-firebase-hooks/auth";
import { userContext } from "./user-context";
import Helmet from "react-helmet";

interface PrivateRouteProps {
  component: any;
  path?: string;
}

const PrivateRoute = ({
  component: Component,
  ...other
}: PrivateRouteProps) => {
  console.log("private route?");
  const user = firebase.auth().currentUser;

  if (user) {
    return <Component user={user} {...other} />;
  }

  console.log("user?");
  return <Redirect from="" to="login" noThrow />;
};

function App() {
  const { initialising, user } = useAuthState(firebase.auth());

  if (initialising) {
    return (
      <div
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "3rem",
          justifyContent: "center",
          display: "flex"
        }}
      >
        <Spinner />
      </div>
    );
  }

  return (
    <userContext.Provider
      value={{
        user: user,
        initialising
      }}
    >
      <Global
        styles={{
          body: {
            margin: 0,
            padding: 0
          }
        }}
      />
      <div className="App">
        <Helmet titleTemplate="%s | Julienne" defaultTitle="Julienne" />
        <Router>
          <Branding path="/" />
          <Login path="/login" />
          {/* {!user && <Branding path="/" />}
          <Login path="/login" />
          <PrivateRoute path="/:id?" component={Main} /> */}
        </Router>
      </div>
    </userContext.Provider>
  );
}

export default App;
