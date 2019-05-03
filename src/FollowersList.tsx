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
  useToast,
  useTheme,
  IconMoreVertical
} from "sancho";
import { confirmFollow, deleteRequestFollow } from "./db";

export interface FollowersListProps {}

export const FollowersList: React.FunctionComponent<
  FollowersListProps
> = props => {
  const theme = useTheme();
  const toast = useToast();
  const { loading, userList } = useFollowers();

  if (loading) {
    return <Spinner center css={{ marginTop: theme.spaces.lg }} />;
  }

  if (!userList || (userList && userList.length === 0)) {
    return (
      <Text
        muted
        css={{
          fontSize: theme.fontSizes[0],
          display: "block",
          margin: theme.spaces.lg
        }}
      >
        You currently have no followers. Users will appear here once they start
        following you.
      </Text>
    );
  }

  async function deleteRelation(relation) {
    try {
      await deleteRequestFollow(relation.id);
    } catch (err) {
      console.error(err);
      toast({
        title: "An error occurred. Please try again.",
        subtitle: err.message,
        intent: "danger"
      });
    }
  }

  async function acceptRequest(relation) {
    try {
      await confirmFollow(relation.id);
      toast({
        title: `Right on! ${relation.fromUser.displayName ||
          relation.fromUser.email} is now following you.`,
        subtitle: "They can now view your recipes.",
        intent: "success"
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "An error occurred. Please try again.",
        subtitle: err.message,
        intent: "danger"
      });
    }
  }

  return (
    <List>
      {userList.map(relation => {
        return (
          <ListItem
            key={relation.id}
            interactive={false}
            contentBefore={
              <Avatar
                size="sm"
                src={relation.fromUser.photoURL}
                name={relation.fromUser.displayName || relation.fromUser.email}
              />
            }
            primary={relation.fromUser.displayName || relation.fromUser.email}
            contentAfter={
              relation.confirmed ? (
                <Popover
                  content={
                    <MenuList>
                      <MenuItem onSelect={() => deleteRelation(relation)}>
                        Remove user
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
              ) : (
                <Button
                  onPress={() => acceptRequest(relation)}
                  intent="primary"
                  size="sm"
                >
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
