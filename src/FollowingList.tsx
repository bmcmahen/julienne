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
  theme,
  Icon,
  toast
} from "sancho";
import { SearchBox } from "./SearchBox";
import debug from "debug";
import algoliasearch from "algoliasearch";
import config from "./firebase-config";
import { useSession } from "./auth";
import find from "lodash.find";
import { deleteRequestFollow, requestFollow } from "./db";
import SwipeableViews from "react-swipeable-views";

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

  return (
    <div>
      <SwipeableViews index={index} disabled>
        <div>
          <div
            css={{ borderBottom: `1px solid ${theme.colors.border.default}` }}
          >
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
                fontSize: theme.sizes[0],
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
                  onClick={() => inviteUser(hit)}
                  contentBefore={
                    <Avatar
                      size="sm"
                      src={hit.photoURL}
                      name={hit.displayName || hit.email}
                    />
                  }
                  primary={hit.displayName || hit.email}
                  contentAfter={
                    <Icon
                      color={theme.colors.text.muted}
                      icon="plus"
                      aria-hidden
                      size="lg"
                    />
                  }
                />
              ))}
            {userList.map(relation => {
              return (
                <ListItem
                  key={user.uid}
                  interactive={false}
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
                      <Popover
                        content={
                          <MenuList>
                            <MenuItem>Remove user</MenuItem>
                          </MenuList>
                        }
                      >
                        <IconButton
                          onClick={e => e.stopPropagation()}
                          variant="ghost"
                          icon="more"
                          label="Options"
                        />
                      </Popover>
                    ) : (
                      <Button
                        onClick={e => {
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
          <div>Provide back button</div>
          <div>Show individual user's recipes</div>
        </div>
      </SwipeableViews>
    </div>
  );
};
