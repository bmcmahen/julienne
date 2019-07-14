/** @jsx jsx */
import { jsx } from "@emotion/core";
import * as React from "react";
import { useFollowers } from "./hooks/with-follow-request-count";
import {
  List,
  ListItem,
  Avatar,
  IconButton,
  Button,
  Popover,
  MenuList,
  Stack,
  MenuItem,
  Text,
  useTheme,
  useToast,
  IconPlus,
  IconChevronRight,
  IconMoreVertical,
  StackTitle,
  Skeleton
} from "sancho";
import { SearchBox } from "./SearchBox";
import debug from "debug";
import algoliasearch from "algoliasearch";
import config from "./firebase-config";
import { useSession } from "./auth";
import find from "lodash.find";
import { deleteRequestFollow, requestFollow } from "./db";
import { FollowingRecipes } from "./FollowingRecipes";
import { User } from "firebase";
import { StackItem, StackContext } from "react-gesture-stack";
import { animated } from "react-spring";

const client = algoliasearch(
  config.ALGOLIA_APP_ID,
  config.ALGOLIA_USER_SEARCH_KEY
);

const index = client.initIndex("users");

function searchAlgoliaForUsers(query: string) {
  return index.search({ query });
}

const log = debug("app:FollowingList");

export interface FollowingListProps {}

export const FollowingList: React.FunctionComponent<
  FollowingListProps
> = props => {
  const theme = useTheme();
  const toast = useToast();
  const user = useSession();
  const { loading, userList } = useFollowers(false);
  const [query, setQuery] = React.useState("");
  const [
    queryResults,
    setQueryResults
  ] = React.useState<algoliasearch.Response | null>(null);

  React.useEffect(() => {
    async function fetchUsers() {
      if (!query) {
        return;
      }

      const results = await searchAlgoliaForUsers(query);
      log("search results: %o", results);

      const hits = results.hits
        .filter(hit => {
          if (hit.objectID === user.uid) {
            return false;
          }

          return !find(userList, { toUserId: hit.objectID });
        })
        .map(hit => {
          const relation = find(userList, { toUserId: hit.objectID });

          return {
            ...hit,
            requested: relation ? relation.id : null
          };
        });

      setQueryResults({
        ...results,
        hits
      });
    }

    fetchUsers();
  }, [query, userList]);

  async function inviteUser(otherUser: any) {
    try {
      log("otherUser: %o", otherUser);
      await requestFollow(user, otherUser);
      toast({
        title: `A request has been sent to ${otherUser.displayName ||
          otherUser.email}`,
        intent: "success"
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "An error occurred while making your request.",
        subtitle: err.message,
        intent: "danger"
      });
    }
  }

  async function deleteRequest(id: string) {
    try {
      log("delete request: %s", id);
      await deleteRequestFollow(id);
    } catch (err) {
      console.error(err);
      toast({
        title: "An error occurred while cancelling your request.",
        subtitle: err.message,
        intent: "danger"
      });
    }
  }

  const noUsers = !query && (!userList || (userList && userList.length === 0));

  const [index, setIndex] = React.useState(0);
  const [relation, setRelation] = React.useState(null);

  function unfollow(id: string) {
    deleteRequest(id);
    setRelation(null);
    setIndex(0);
  }

  function showRelation(user: User) {
    setRelation(user);
    setIndex(1);
  }

  return (
    <Stack
      css={{
        height: "calc(100vh - 97px)", // this is lame
        [theme.breakpoints.lg]: {
          height: "100%"
        }
      }}
      index={index}
      navHeight={60}
      onIndexChange={i => setIndex(i)}
      items={[
        {
          title: (
            <SearchTitle>
              <SearchBox
                css={{ borderBottom: "none" }}
                label="Search for users to follow"
                query={query}
                setQuery={setQuery}
              />
            </SearchTitle>
          ),
          content: (
            <StackItem>
              <div>
                {!loading && noUsers && (
                  <Text
                    muted
                    css={{
                      fontSize: theme.fontSizes[0],
                      display: "block",
                      margin: theme.spaces.lg
                    }}
                  >
                    You currently aren't following anyone. Start following
                    someone by searching for their email in the box above.
                  </Text>
                )}

                <List>
                  {loading && (
                    <React.Fragment>
                      <ListItem
                        interactive={false}
                        contentBefore={
                          <Skeleton
                            css={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%"
                            }}
                          />
                        }
                        primary={<Skeleton css={{ maxWidth: "160px" }} />}
                      />
                      <ListItem
                        interactive={false}
                        contentBefore={
                          <Skeleton
                            css={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%"
                            }}
                          />
                        }
                        primary={<Skeleton css={{ maxWidth: "200px" }} />}
                      />
                    </React.Fragment>
                  )}
                  {query &&
                    queryResults &&
                    queryResults.hits.map(hit => (
                      <ListItem
                        key={hit.objectID}
                        onPress={() => inviteUser(hit)}
                        contentBefore={
                          <Avatar
                            size="sm"
                            src={hit.photoURL}
                            name={hit.displayName || hit.email}
                          />
                        }
                        primary={hit.displayName || hit.email}
                        contentAfter={
                          <IconPlus
                            color={theme.colors.text.muted}
                            aria-hidden
                            size="lg"
                          />
                        }
                      />
                    ))}
                  {userList.map(relation => {
                    return (
                      <ListItem
                        key={relation.id}
                        interactive={relation.confirmed ? true : false}
                        onPress={() =>
                          showRelation({
                            id: relation.toUserId,
                            ...relation.toUser
                          })
                        }
                        contentBefore={
                          <Avatar
                            size="sm"
                            src={relation.toUser.photoURL}
                            name={
                              relation.toUser.displayName ||
                              relation.toUser.email
                            }
                          />
                        }
                        primary={
                          relation.toUser.displayName || relation.toUser.email
                        }
                        contentAfter={
                          relation.confirmed ? (
                            <IconChevronRight
                              color={theme.colors.text.muted}
                              aria-hidden
                            />
                          ) : (
                            <Button
                              onPress={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                deleteRequest(relation.id);
                              }}
                              size="sm"
                            >
                              Cancel request
                            </Button>
                          )
                        }
                      />
                    );
                  })}
                </List>
              </div>
            </StackItem>
          )
        },
        {
          title: (
            <StackTitle
              contentAfter={
                relation && (
                  <Popover
                    content={
                      <MenuList>
                        <MenuItem onPress={() => unfollow(relation.id)}>
                          Unfollow user
                        </MenuItem>
                      </MenuList>
                    }
                  >
                    <IconButton
                      onPress={e => e.stopPropagation()}
                      variant="ghost"
                      icon={<IconMoreVertical />}
                      label="Options"
                    />
                  </Popover>
                )
              }
              title={relation ? relation.displayName || relation.email : ""}
            />
          ),
          content: (
            <StackItem>
              {relation && (
                <FollowingRecipes key={relation.id} id={relation.id} />
              )}
            </StackItem>
          )
        }
      ]}
    />
  );
};

function SearchTitle({ children }: { children: React.ReactNode }) {
  const {
    navHeight,
    index,
    active,
    changeIndex,
    opacity,
    transform
  } = React.useContext(StackContext);

  return (
    <div
      className="StackTitle"
      aria-hidden={!active}
      style={{
        pointerEvents: active ? "auto" : "none",
        zIndex: 10,
        position: "absolute",
        top: 0,
        left: 0,
        right: 0
      }}
    >
      <animated.div
        className="StackTitle__heading"
        style={{
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          overflow: "hidden",
          opacity,
          transform: transform.to(x => `translateX(${x * 0.85}%)`)
        }}
      >
        {children}
      </animated.div>
    </div>
  );
}
