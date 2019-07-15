/** @jsx jsx */
import { jsx, Global } from "@emotion/core";
import * as firebase from "firebase/app";
import { Route, Redirect, useRoute } from "wouter";
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
  path,
  ...other
}: PrivateRouteProps) => {
  const user = firebase.auth().currentUser;
  const [match, params] = useRoute(path);

  if (!user && params.rest) {
    return <Redirect to="login" />;
  }

  if (!user) {
    return null;
  }

  return <Component />;
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

        {!user && <Route path="/" component={Branding} />}
        <Route path="/login" component={Login} />
        <PrivateRoute path="/:rest*" component={Main} />
      </div>
    </userContext.Provider>
  );
}

export default App;
