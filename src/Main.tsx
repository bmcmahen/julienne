/** @jsx jsx */
import { jsx, css, Global } from "@emotion/core";
import * as React from "react";
import {
  Toolbar,
  Navbar,
  useTheme,
  IconButton,
  Button,
  Tabs,
  Tab,
  Layer,
  TabPanel,
  MenuList,
  MenuItem,
  Tooltip,
  ResponsivePopover,
  IconChevronDown,
  IconPlus,
  DarkMode
} from "sancho";
import { RecipeList } from "./RecipeList";
import { useFollowRequests } from "./hooks/with-follow-request-count";
import { FollowersList } from "./FollowersList";
import { FollowingList } from "./FollowingList";
import { useSession, signOut } from "./auth";
import { Compose } from "./Compose";
import { Recipe } from "./Recipe";
import { useTransition, animated } from "react-spring";
import { SearchBox } from "./SearchBox";
import { Link } from "@reach/router";
import { useMedia } from "use-media";
import { Layout } from "./Layout";

export interface MainProps {
  path?: string;
  id?: string;
}

export const Main: React.FunctionComponent<MainProps> = props => {
  const theme = useTheme();
  const user = useSession();
  const [query, setQuery] = React.useState("");
  const [activeTab, setActiveTab] = React.useState(0);
  const { value: followRequests } = useFollowRequests();
  const isLarge = useMedia({ minWidth: "768px" });

  const showingRecipe = props.id;

  const transitions = useTransition(showingRecipe, recipeId => recipeId, {
    from: { opacity: 0, transform: "scale(0.95)" },
    enter: { opacity: 1, transform: "scale(1)" },
    leave: { opacity: 0, transform: "scale(1.1)" },
    immediate: !isLarge
  });

  const renderList = isLarge || !showingRecipe;

  return (
    <Layout>
      <div
        css={css`
          display: flex;
          box-sizing: border-box;
        `}
      >
        <Layer
          aria-hidden={!renderList}
          css={{
            display: renderList ? "flex" : "none",
            boxSizing: "border-box",
            flexDirection: "column",
            flex: "1",
            boxShadow: "none",
            background: "white",
            position: "absolute",
            width: "100%",
            borderRadius: 0,
            [theme.mediaQueries.md]: {
              display: "flex",
              position: "fixed",
              zIndex: theme.zIndices.fixed,
              top: 0,
              boxShadow: theme.shadows.xl,
              overflow: "hidden",
              width: "auto",
              borderRadius: theme.radii.lg,
              margin: theme.spaces.lg,
              marginRight: 0,
              height: `calc(100vh - ${theme.spaces.lg} - ${theme.spaces.lg})`
            },
            [theme.mediaQueries.lg]: {
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
                zIndex: theme.zIndices.sticky,
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
                <ResponsivePopover
                  content={
                    <MenuList>
                      <MenuItem onSelect={signOut}>Sign out</MenuItem>
                    </MenuList>
                  }
                >
                  <Button
                    size="md"
                    iconAfter={<IconChevronDown />}
                    variant="ghost"
                  >
                    {user.displayName || user.email}
                  </Button>
                </ResponsivePopover>
                <Tooltip content="Add a new recipe">
                  <div>
                    <DarkMode>
                      <IconButton
                        component={Link}
                        to="/new"
                        variant="ghost"
                        label="Add recipe"
                        size="md"
                        icon={<IconPlus />}
                      />
                    </DarkMode>
                  </div>
                </Tooltip>
              </Toolbar>
            </Navbar>
            <div css={{ flex: "0 0 auto", zIndex: 2 }}>
              <DarkMode>
                <Tabs
                  css={{
                    position: "sticky",
                    top: 0,
                    background: theme.colors.palette.gray.base
                  }}
                  onChange={i => setActiveTab(i)}
                  value={activeTab}
                  variant="evenly-spaced"
                >
                  <Tab id="recipes">Recipes</Tab>
                  <Tab id="following">Following</Tab>
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
                </Tabs>
              </DarkMode>
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
                  flex: "0 0 auto"
                }}
              >
                <SearchBox query={query} setQuery={setQuery} />
              </div>

              <div
                css={{
                  flex: 1,
                  [theme.mediaQueries.md]: {
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

        {showingRecipe && (
          <div
            css={{
              display: "block",
              position: "relative",

              flex: 1,
              [theme.mediaQueries.md]: {
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
                  [theme.mediaQueries.md]: {
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: theme.spaces.lg,
                    minHeight: "100vh",
                    paddingLeft: "calc(330px + 3rem)"
                  },
                  [theme.mediaQueries.lg]: {
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
                    [theme.mediaQueries.md]: {
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
                  {key === "new" ? <Compose /> : <Recipe id={item} />}
                </Layer>
              </animated.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};
