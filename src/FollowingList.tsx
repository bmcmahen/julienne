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
  MenuItem,
  Spinner,
  Text,
  useTheme,
  useToast,
  Toolbar,
  IconPlus,
  IconChevronRight,
  IconMoreVertical,
  IconArrowLeft
} from "sancho";
import { SearchBox } from "./SearchBox";
import debug from "debug";
import algoliasearch from "algoliasearch";
import config from "./firebase-config";
import { useSession } from "./auth";
import find from "lodash.find";
import { deleteRequestFollow, requestFollow } from "./db";
import SwipeableViews from "react-swipeable-views";
import { FollowingRecipes } from "./FollowingRecipes";
import { User } from "firebase";

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
    <div>
      <SwipeableViews index={index} disabled>
        <div>
          <div>
            <SearchBox
              label="Search for users to follow"
              query={query}
              setQuery={setQuery}
            />
          </div>
          {loading && <Spinner center css={{ marginTop: theme.spaces.lg }} />}
          {!loading && noUsers && (
            <Text
              muted
              css={{
                fontSize: theme.fontSizes[0],
                display: "block",
                margin: theme.spaces.lg
              }}
            >
              You currently aren't following anyone. Start following someone by
              searching for their email in the box above.
            </Text>
          )}

          <List>
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
                    showRelation({ id: relation.toUserId, ...relation.toUser })
                  }
                  contentBefore={
                    <Avatar
                      size="sm"
                      src={relation.toUser.photoURL}
                      name={
                        relation.toUser.displayName || relation.toUser.email
                      }
                    />
                  }
                  primary={relation.toUser.displayName || relation.toUser.email}
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
        <div>
          {relation && (
            <React.Fragment>
              <Toolbar
                css={{
                  // background: theme.colors.background.tint1,
                  paddingTop: theme.spaces.lg,
                  paddingBottom: theme.spaces.lg,
                  borderBottom: `1px solid ${theme.colors.border.muted}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start"
                }}
              >
                <IconButton
                  variant="ghost"
                  icon={<IconArrowLeft />}
                  label="Show all followers"
                  onPress={() => setIndex(0)}
                />
                <div
                  css={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center"
                  }}
                >
                  <Avatar
                    size="md"
                    src={relation.photoURL}
                    css={{ marginBottom: theme.spaces.sm }}
                    name={relation.displayName || relation.email}
                  />
                  <Text variant="h6" gutter={false}>
                    {relation.displayName || relation.email}
                  </Text>
                </div>
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
              </Toolbar>
              <FollowingRecipes id={relation.id} />
            </React.Fragment>
          )}
        </div>
      </SwipeableViews>
    </div>
  );
};
