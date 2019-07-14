import * as React from "react";

interface UserContext {
  user?: firebase.User;
  initialising?: boolean;
}

export const userContext = React.createContext<UserContext>({
  user: undefined
});
