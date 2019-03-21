/** @jsx jsx */
import { jsx, css, Global } from "@emotion/core";
import * as React from "react";
import {
  Toolbar,
  Navbar,
  theme,
  IconButton,
  Button,
  Tabs,
  Tab,
  Layer,
  TabPanel,
  Popover,
  MenuList,
  MenuItem,
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
import { useMedia } from "use-media";

export interface MainProps {}

export const Main: React.FunctionComponent<MainProps> = props => {
  const user = useSession();
  const [query, setQuery] = React.useState("");
  const [activeTab, setActiveTab] = React.useState(0);
  const { value: followRequests } = useFollowRequests();
  const { location, match } = useReactRouter();
  const isLarge = useMedia({ minWidth: "768px" });

  const transitions = useTransition(location, location => location.pathname, {
    from: { opacity: 0, transform: "scale(0.95)" },
    enter: { opacity: 1, transform: "scale(1)" },
    leave: { opacity: 0, transform: "scale(1.1)" },
    immediate: !isLarge
  });

  const params = match.params as any;
  const showingRecipe = params.id;

  const renderList = isLarge || !showingRecipe;
  const renderRecipe = isLarge || showingRecipe;

  return (
    <div
      css={css`
        display: flex;
        box-sizing: border-box;
      `}
    >
      <Global
        styles={{
          html: {
            [theme.breakpoints.md]: {
              backgroundAttachment: "fixed",
              backgroundSize: "cover",
              backgroundImage: `url(${require("./images/cutting-board-knife.jpg")})`
            }
          }
        }}
      />

      {renderList && (
        <Layer
          css={{
            display: "flex",
            boxSizing: "border-box",
            flexDirection: "column",
            flex: "1",
            boxShadow: "none",
            background: "white",
            position: "absolute",
            width: "100%",
            borderRadius: 0,
            [theme.breakpoints.md]: {
              display: "flex",
              position: "fixed",
              zIndex: theme.zIndex.fixed,
              top: 0,
              boxShadow: theme.shadows.xl,
              overflow: "hidden",
              width: "auto",
              borderRadius: theme.radii.lg,
              margin: theme.spaces.lg,
              marginRight: 0,
              height: `calc(100vh - ${theme.spaces.lg} - ${theme.spaces.lg})`
            },
            [theme.breakpoints.lg]: {
              margin: theme.spaces.xl,
              marginRight: 0,
              width: "400px",
              height: `calc(100vh - ${theme.spaces.xl} - ${theme.spaces.xl})`
            }
          }}
        >
          <div
            css={[
              {
                position: "sticky",
                width: "100%",
                top: 0,
                zIndex: theme.zIndex.sticky,
                background: theme.colors.palette.gray.base
              }
            ]}
          >
            <Navbar
              position="static"
              css={{
                flex: "0 0 auto",
                background: theme.colors.palette.gray.base,
                color: "white"
              }}
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
            <div css={{ flex: "0 0 auto", zIndex: 2 }}>
              <Tabs
                css={{
                  position: "sticky",
                  top: 0,
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
                  css={{}}
                  badge={
                    followRequests && followRequests.docs.length ? (
                      <Badge
                        css={{
                          fontSize: "0.7rem",
                          padding: "0 0.3rem",
                          minWidth: "17px"
                        }}
                      >
                        {followRequests.docs.length}
                      </Badge>
                    ) : null
                  }
                  id="followers"
                >
                  Followers
                </Tab>
              </Tabs>
            </div>
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
                  [theme.breakpoints.md]: {
                    overflowY: "scroll",
                    WebkitOverflowScrolling: "touch"
                  }
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
      )}

      {renderRecipe && (
        <div
          css={{
            display: "block",
            position: "relative",

            flex: 1,
            [theme.breakpoints.md]: {
              display: "flex",
              justifyContent: "center"
            }
          }}
        >
          {transitions.map(({ item, props, key }) => (
            <animated.div
              key={key}
              style={props}
              css={{
                display: "block",
                position: "absolute",
                width: "100%",
                boxSizing: "border-box",
                [theme.breakpoints.md]: {
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: theme.spaces.lg,
                  minHeight: "100vh",
                  paddingLeft: "calc(330px + 3rem)"
                },
                [theme.breakpoints.lg]: {
                  // paddingLeft: theme.spaces.xl,
                  paddingRight: theme.spaces.xl,
                  paddingLeft: "calc(400px + 6rem)"
                }
              }}
            >
              <Layer
                elevation="xl"
                key={key}
                css={{
                  borderRadius: 0,
                  position: "relative",
                  boxShadow: "none",
                  width: "100%",
                  [theme.breakpoints.md]: {
                    marginTop: "auto",
                    height: "auto",
                    overflow: "hidden",
                    boxSizing: "border-box",
                    marginBottom: "auto",
                    width: "100%",
                    maxWidth: "700px",
                    borderRadius: theme.radii.lg,
                    boxShadow: theme.shadows.xl
                  }
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
      )}
    </div>
  );
};
