/** @jsx jsx */
import { jsx, css } from "@emotion/core";
import * as React from "react";
import {
  Toolbar,
  Navbar,
  theme,
  Input,
  IconButton,
  Button,
  Text,
  Tabs,
  Tab
} from "sancho";
import { RecipeList } from "./RecipeList";

export interface MainProps {}

export const Main: React.FunctionComponent<MainProps> = props => {
  return (
    <div
      css={css`
        height: 100vh;
        overflow: hidden;
        width: 100vw;
        display: grid;

        box-sizing: border-box;

        grid-template-columns: 400px auto;
        grid-template-areas: "list main";
      `}
    >
      <div
        css={{
          oveflow: "hidden",
          display: "flex",
          height: "100%",
          width: "100%",
          flexDirection: "column",
          gridArea: "list",
          background: theme.colors.background.tint1
        }}
      >
        <Navbar
          position="static"
          css={{ background: theme.colors.palette.gray.dark, color: "white" }}
        >
          <Toolbar
            css={{
              display: "flex",
              justifyContent: "space-between",
              borderColor: theme.colors.border.default
            }}
          >
            <Text css={{ color: "white" }} gutter={false} variant="h5">
              Ben McMahen
            </Text>
            <div>
              <IconButton
                variant="ghost"
                size="lg"
                color="white"
                icon="user"
                label="Add a user"
              />
              <IconButton
                variant="ghost"
                intent="primary"
                size="lg"
                color="white"
                icon="add"
                label="Add a recipe"
              />
            </div>
          </Toolbar>
        </Navbar>
        <Tabs
          css={{
            background: theme.colors.palette.gray.dark
          }}
          onChange={() => {}}
          value={0}
          dark
          variant="evenly-spaced"
        >
          <Tab id="recipes">Recipes</Tab>
          <Tab id="followers">Followers</Tab>
          <Tab id="following">Following</Tab>
        </Tabs>
        <div
          css={{
            flex: "0 0 auto",
            borderBottom: "1px solid",
            borderColor: theme.colors.border.default
          }}
        >
          <Input
            inputSize="md"
            css={{
              padding: theme.spaces.md,
              paddingLeft: theme.spaces.lg,
              border: "none",
              background: "none",
              boxShadow: "none"
            }}
            placeholder="Search..."
          />
        </div>

        <div
          css={{
            flex: 1,
            overflowY: "scroll"
          }}
        >
          <RecipeList />
        </div>
      </div>

      <div
        css={{
          gridArea: "main"
        }}
      >
        <Navbar
          position="static"
          css={{
            background: theme.colors.palette.blue.base,
            boxShadow: theme.shadows.md,
            position: "sticky",
            top: 0,
            marginLeft: "auto"
          }}
        >
          <Toolbar />
        </Navbar>
        <div
          css={{
            background: "blue"
          }}
        />
      </div>
    </div>
  );
};
