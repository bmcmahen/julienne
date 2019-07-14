/** @jsx jsx */
import { jsx } from "@emotion/core";
import * as React from "react";
import {
  InputGroup,
  Input,
  useTheme,
  VisuallyHidden,
  Button,
  useResponsiveContainerPadding,
  IconSearch
} from "sancho";

export interface SearchBoxProps {
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  query: string;
  label?: string;
}

export const SearchBox: React.FunctionComponent<SearchBoxProps> = ({
  query,
  label = "Search all recipes",
  setQuery,
  ...other
}) => {
  const theme = useTheme();
  const responsiveContainerPadding = useResponsiveContainerPadding();
  return (
    <form
      css={{
        margin: 0,
        position: "relative"
      }}
      onSubmit={e => e.preventDefault()}
    >
      <InputGroup
        css={{ margin: 0, position: "relative" }}
        hideLabel
        label={label}
      >
        <Input
          type="search"
          inputSize="md"
          autoComplete="off"
          css={[
            {
              height: "60px",
              textAlign: "left",
              border: "none",
              borderBottom: "1px solid",
              borderColor: theme.colors.border.default,
              borderRadius: 0,
              WebkitAppearance: "none",
              // background: "transparent",
              boxShadow: "none",
              ":focus": {
                boxShadow: "none",
                backgroundColor: theme.colors.background.tint1
              }
            },
            responsiveContainerPadding
          ]}
          {...other}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={label}
        />
      </InputGroup>
      <VisuallyHidden>
        <Button type="submit">Search</Button>
      </VisuallyHidden>
      <IconSearch
        aria-hidden
        color={theme.colors.scales.gray[6]}
        css={{
          display: query ? "none" : "block",
          position: "absolute",
          right: theme.spaces.lg,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 10
        }}
      />
    </form>
  );
};
