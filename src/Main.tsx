/** @jsx jsx */
import { jsx, css, Global } from "@emotion/core";
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
  Tab,
  Layer,
  TabContent,
  TabPanel,
  Popover,
  MenuList,
  MenuItem,
  InputGroup,
  VisuallyHidden,
  Icon
} from "sancho";
import { RecipeList } from "./RecipeList";
import { useFollowRequests } from "./hooks/with-follow-request-count";
import { FollowersList } from "./FollowersList";
import { FollowingList } from "./FollowingList";
import { useSession, signOut } from "./auth";
import { Route, Switch } from "react-router";
import { Compose } from "./Compose";
import { Recipe } from "./Recipe";

export interface MainProps {}

export const Main: React.FunctionComponent<MainProps> = props => {
  const user = useSession();
  const [query, setQuery] = React.useState("");
  const [activeTab, setActiveTab] = React.useState(0);
  const { value: followRequests } = useFollowRequests();

  return (
    <div
      css={css`
        height: 100vh;
        overflow: hidden;
        width: 100vw;
        display: grid;
        padding: ${theme.spaces.lg};
        box-sizing: border-box;

        grid-template-columns: 400px auto;
        grid-template-areas: "list main";
      `}
    >
      <Global
        styles={{
          html: {
            backgroundSize: "cover",
            background: `url(${require("./images/green.jpg")})`
          }
        }}
      />
      <Layer
        css={{
          oveflow: "hidden",
          display: "flex",
          height: `calc(100vh - ${theme.spaces.lg} - ${theme.spaces.lg})`,
          boxSizing: "border-box",
          overflow: "hidden",
          width: "100%",
          flexDirection: "column",
          gridArea: "list",
          background: "white",
          borderRadius: theme.radii.lg
        }}
      >
        <Navbar
          position="static"
          css={{ background: theme.colors.palette.gray.dark, color: "white" }}
        >
          <Toolbar
            css={{
              display: "flex",
              justifyContent: "space-between"
            }}
          >
            <div css={{ width: "42px" }} />
            <Popover
              content={
                <MenuList>
                  <MenuItem onSelect={signOut}>Sign out</MenuItem>
                </MenuList>
              }
            >
              <Button
                size="lg"
                iconAfter="chevron-down"
                variant="ghost"
                css={{ color: "white" }}
              >
                {user.displayName || user.email}
              </Button>
            </Popover>
            <IconButton
              variant="ghost"
              label="Add recipe"
              size="lg"
              color="white"
              icon="plus"
              intent="primary"
            />
          </Toolbar>
        </Navbar>
        <div css={{ zIndex: 2 }}>
          <Tabs
            css={{
              background: theme.colors.palette.gray.dark
            }}
            onChange={i => setActiveTab(i)}
            value={activeTab}
            dark
            variant="evenly-spaced"
          >
            <Tab id="recipes">Recipes</Tab>
            <Tab
              badge={
                followRequests && followRequests.docs.length
                  ? followRequests.docs.length
                  : null
              }
              id="followers"
            >
              Followers
            </Tab>
            <Tab id="following">Following</Tab>
          </Tabs>
        </div>

        {activeTab === 0 && (
          <TabPanel
            css={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              minHeight: 0
            }}
            id="recipes"
          >
            <div
              css={{
                flex: "0 0 auto",
                borderBottom: "1px solid",
                borderColor: theme.colors.border.default
              }}
            >
              <form
                css={{ position: "relative" }}
                onSubmit={e => e.preventDefault()}
              >
                <InputGroup
                  css={{ margin: 0, position: "relative" }}
                  hideLabel
                  label="Search all recipes"
                >
                  <Input
                    type="search"
                    inputSize="md"
                    css={{
                      padding: theme.spaces.md,
                      paddingLeft: theme.spaces.lg,
                      paddingRight: theme.spaces.lg,
                      textAlign: "left",
                      border: "none",
                      background: "transparent",
                      boxShadow: "none",
                      ":focus": {
                        boxShadow: "none",
                        backgroundColor: theme.colors.background.tint1
                      }
                    }}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search all recipes..."
                  />
                </InputGroup>
                <VisuallyHidden>
                  <Button type="submit">Search</Button>
                </VisuallyHidden>
                <Icon
                  icon="search"
                  aria-hidden
                  color={theme.colors.scales.gray[6]}
                  css={{
                    position: "absolute",
                    right: theme.spaces.lg,
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 10
                  }}
                />
              </form>
            </div>

            <div
              css={{
                flex: 1,
                overflowY: "scroll"
              }}
            >
              <RecipeList query={query} />
            </div>
          </TabPanel>
        )}
        {activeTab === 1 && (
          <TabPanel id="followers">
            <FollowersList />
          </TabPanel>
        )}

        {activeTab === 2 && (
          <TabPanel id="following">
            <FollowingList />
          </TabPanel>
        )}
      </Layer>

      <div
        css={{
          gridArea: "main",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Layer
          css={{
            width: "700px",
            overflow: "hidden"
          }}
        >
          <Switch>
            <Route path="/new" component={Compose} />
            <Route path="/:id" component={Recipe} />
          </Switch>
        </Layer>
      </div>
    </div>
  );
};
