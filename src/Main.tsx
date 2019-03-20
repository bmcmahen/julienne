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
  Tabs,
  Tab,
  Layer,
  TabPanel,
  Popover,
  MenuList,
  MenuItem,
  InputGroup,
  VisuallyHidden,
  Icon,
  Badge,
  Tooltip
} from "sancho";
import { RecipeList } from "./RecipeList";
import { useFollowRequests } from "./hooks/with-follow-request-count";
import { FollowersList } from "./FollowersList";
import { FollowingList } from "./FollowingList";
import { useSession, signOut } from "./auth";
import { Route, Switch } from "react-router";
import { Compose } from "./Compose";
import { Recipe } from "./Recipe";
import useReactRouter from "use-react-router";
import { useTransition, animated, config } from "react-spring";
import { SearchBox } from "./SearchBox";
import { Link } from "react-router-dom";

export interface MainProps {}

export const Main: React.FunctionComponent<MainProps> = props => {
  const user = useSession();
  const [query, setQuery] = React.useState("");
  const [activeTab, setActiveTab] = React.useState(0);
  const { value: followRequests } = useFollowRequests();
  const { location } = useReactRouter();

  const transitions = useTransition(location, location => location.pathname, {
    from: { opacity: 0, transform: "scale(0.95)" },
    enter: { opacity: 1, transform: "scale(1)" },
    leave: { opacity: 0, transform: "scale(1.1)" }
  });

  return (
    <div
      css={css`
        height: 100vh;
        overflow: hidden;
        width: 100vw;
        display: grid;
        box-sizing: border-box;
        grid-template-columns: 500px auto;
        grid-template-areas: "list main";
      `}
    >
      <Global
        styles={{
          html: {
            backgroundSize: "cover",
            backgroundImage: `url(${require("./images/cutting-board-knife.jpg")})`
          }
        }}
      />
      <Layer
        elevation="xl"
        css={{
          oveflow: "hidden",
          display: "flex",
          margin: theme.spaces.xl,
          height: `calc(100vh - ${theme.spaces.xl} - ${theme.spaces.xl})`,
          boxSizing: "border-box",
          overflow: "hidden",
          flexDirection: "column",
          gridArea: "list",
          background: "white",
          borderRadius: theme.radii.lg
        }}
      >
        <Navbar
          position="static"
          css={{ background: theme.colors.palette.gray.base, color: "white" }}
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
            <Tooltip content="Add a new recipe">
              <div>
                <IconButton
                  component={Link}
                  to="/new"
                  variant="ghost"
                  label="Add recipe"
                  size="lg"
                  color="white"
                  icon="plus"
                  intent="primary"
                />
              </div>
            </Tooltip>
          </Toolbar>
        </Navbar>
        <div css={{ zIndex: 2 }}>
          <Tabs
            css={{
              background: theme.colors.palette.gray.base
            }}
            onChange={i => setActiveTab(i)}
            value={activeTab}
            dark
            variant="evenly-spaced"
          >
            <Tab id="recipes">Recipes</Tab>
            <Tab id="following">Following</Tab>
            <Tab
              badge={
                <Badge
                  css={{
                    fontSize: "0.7rem",
                    padding: "0 0.3rem",
                    minWidth: "17px"
                  }}
                >
                  {followRequests && followRequests.docs.length
                    ? followRequests.docs.length
                    : null}
                </Badge>
              }
              id="followers"
            >
              Followers
            </Tab>
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
              <SearchBox query={query} setQuery={setQuery} />
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
          <TabPanel id="following">
            <FollowingList />
          </TabPanel>
        )}

        {activeTab === 2 && (
          <TabPanel id="followers">
            <FollowersList />
          </TabPanel>
        )}
      </Layer>

      <div
        css={{
          gridArea: "main",
          position: "relative",
          maxHeight: "100vh"
        }}
      >
        {transitions.map(({ item, props, key }) => (
          <animated.div
            key={key}
            style={props}
            css={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              padding: `${theme.spaces.lg} 0`,
              paddingRight: theme.spaces.xl,
              display: "flex",
              alignItems: "center",
              overflowY: "scroll",
              justifyContent: "center"
            }}
          >
            <Layer
              elevation="xl"
              key={key}
              css={{
                position: "relative",
                width: "700px",
                overflow: "hidden",
                marginTop: "auto",
                marginBottom: "auto"
              }}
            >
              <Switch location={item}>
                <Route path="/new" component={Compose} />
                <Route path="/:id" component={Recipe} />
              </Switch>
            </Layer>
          </animated.div>
        ))}
      </div>
    </div>
  );
};
