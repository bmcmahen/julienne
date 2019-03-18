import * as React from "react";

interface UserContext {
  user?: firebase.User;
}

export const userContext = React.createContext<UserContext>({
  user: undefined
});
