/** @jsx jsx */
import { jsx, Global } from "@emotion/core";
import * as React from "react";
import { useTheme } from "sancho";

export interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FunctionComponent<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  return (
    <React.Fragment>
      <Global
        styles={{
          html: {
            [theme.mediaQueries.md]: {
              backgroundAttachment: "fixed",
              backgroundSize: "cover",
              backgroundImage: `url(${require("./images/cutting-board-knife.jpg")})`
            }
          }
        }}
      />
      {children}
    </React.Fragment>
  );
};
