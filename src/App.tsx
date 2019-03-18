/** @jsx jsx */
import { jsx } from "@emotion/core";
import * as firebase from "firebase/app";
import { BrowserRouter, Switch, Redirect, Route } from "react-router-dom";
import { Login } from "./Login";
import { Spinner } from "sancho";
import { Main } from "./Main";
import { useAuthState } from "react-firebase-hooks/auth";
import { userContext } from "./user-context";

interface PrivateRouteProps {
  component: any;
  path?: string;
}

const PrivateRoute = ({
  component: Component,
  ...other
}: PrivateRouteProps) => {
  const user = firebase.auth().currentUser;
  return (
    <Route
      {...other}
      render={(props: any) => {
        if (user) {
          return <Component user={user} {...props} />;
        } else {
          return (
            <Redirect
              to={{
                pathname: "/login",
                state: { from: props.location }
              }}
            />
          );
        }
      }}
    />
  );
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
      <div className="App">
        <BrowserRouter>
          <Switch>
            <Route path="/login" component={Login} />
            <PrivateRoute path="/:id?" component={Main} />
          </Switch>
        </BrowserRouter>
      </div>
    </userContext.Provider>
  );
}

export default App;
