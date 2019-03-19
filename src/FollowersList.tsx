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
  theme
} from "sancho";

export interface FollowersListProps {}

export const FollowersList: React.FunctionComponent<
  FollowersListProps
> = props => {
  const { loading, userList } = useFollowers();

  if (loading) {
    return <Spinner center css={{ marginTop: theme.spaces.lg }} />;
  }

  if (!userList || (userList && userList.length === 0)) {
    return (
      <Text
        muted
        css={{
          fontSize: theme.sizes[0],
          display: "block",
          margin: theme.spaces.lg
        }}
      >
        You currently have no followers. Users will appear here once they start
        following you.
      </Text>
    );
  }

  return (
    <List>
      {userList.map(item => {
        return (
          <ListItem
            key={item.id}
            contentBefore={
              <Avatar
                size="sm"
                src={item.user.photoURL}
                name={item.user.displayName || item.user.email}
              />
            }
            primary={item.user.displayName || item.user.email}
            contentAfter={
              item.confirmed ? (
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
                <Button intent="primary" size="sm">
                  Accept request
                </Button>
              )
            }
          />
        );
      })}
    </List>
  );
};
