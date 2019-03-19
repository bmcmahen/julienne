/** @jsx jsx */
import { jsx } from "@emotion/core";
import * as React from "react";
import Editor from "./Editor";
import { ImageUpload } from "./ImageUpload";
import { Image } from "./Image";
import { Ingredient } from "./RecipeList";
import {
  Navbar,
  Toolbar,
  Input,
  Text,
  Button,
  IconButton,
  Popover,
  MenuList,
  MenuItem,
  theme
} from "sancho";

export interface ComposeProps {
  defaultTitle?: string;
  defaultImage?: string;
  defaultDescription?: string;
  defaultIngredients?: Ingredient[];
  readOnly?: boolean;
  editable?: boolean;
  defaultCredit?: string;
}

export const Compose: React.FunctionComponent<ComposeProps> = ({
  readOnly,
  editable,
  defaultCredit,
  defaultDescription,
  defaultImage,
  defaultIngredients,
  defaultTitle
}) => {
  const [editing, setEditing] = React.useState(!readOnly);
  const [image, setImage] = React.useState(defaultImage);
  const [title, setTitle] = React.useState(defaultTitle);
  const [credit, setCredit] = React.useState(defaultCredit);
  const [description, setDescription] = React.useState(defaultDescription);
  const [ingredients, setIngredients] = React.useState<Ingredient[]>(
    defaultIngredients || []
  );

  function onIngredientChange(i: number, value: Ingredient) {
    ingredients[i] = value;
    setIngredients(ingredients);
  }

  function addNewIngredient() {
    ingredients.push({ name: "", amount: "" });
    setIngredients(ingredients);
  }

  function requestDelete() {
    console.log("delete");
  }

  return (
    <div>
      <Navbar
        css={{ backgroundColor: "white", boxShadow: theme.shadows.sm }}
        position="static"
      >
        <Toolbar css={{ display: "flex", justifyContent: "space-between" }}>
          {editing ? (
            <Input
              autoComplete="off"
              autoFocus
              value={title}
              placeholder="Recipe title"
              aria-label="Recipe title"
              onChange={e => {
                setTitle(e.target.value);
              }}
            />
          ) : (
            <Text variant="h5" gutter={false}>
              {title}
            </Text>
          )}
          <div>
            {!editing && editable && (
              <Popover
                content={
                  <MenuList>
                    <MenuItem
                      onSelect={() => {
                        setEditing(true);
                      }}
                    >
                      Edit
                    </MenuItem>
                    <MenuItem onSelect={requestDelete}>Delete</MenuItem>
                  </MenuList>
                }
              >
                <IconButton variant="ghost" icon="more" label="Show options" />
              </Popover>
            )}
            {editing && (
              <Button
                intent="primary"
                disabled={!title}
                onClick={() => {
                  // save
                }}
              >
                Save
              </Button>
            )}
          </div>
        </Toolbar>
      </Navbar>
      <div>
        <div>
          {editing ? (
            <ImageUpload
              onRequestSave={id => setImage(id)}
              onRequestClear={() => setImage(null)}
              defaultFiles={
                image
                  ? [
                      {
                        source: image,
                        options: {
                          type: "local"
                        }
                      }
                    ]
                  : []
              }
            />
          ) : image ? (
            <div>
              <Image id={image} />
            </div>
          ) : null}

          <div css={{ padding: theme.spaces.lg }}>
            {ingredients.length > 0 && (
              <div>
                <Text variant="h5">Ingredients</Text>
                {ingredients.map((ingredient, i) => {
                  return (
                    <div key={i}>
                      {editing ? (
                        <>
                          <Input
                            autoFocus={!readOnly && ingredients.length > 1}
                            readOnly={readOnly}
                            placeholder="Name"
                            value={ingredient.name}
                            onChange={e => {
                              onIngredientChange(i, {
                                ...ingredient,
                                name: e.target.value
                              });
                            }}
                          />
                          <Input
                            readOnly={readOnly}
                            placeholder="Amount"
                            value={ingredient.amount}
                            onChange={e => {
                              onIngredientChange(i, {
                                ...ingredient,
                                amount: e.target.value
                              });
                            }}
                          />
                        </>
                      ) : (
                        <div
                          css={{
                            width: "300px",
                            display: "flex",
                            marginBottom: theme.spaces.xs,
                            justifyContent: "space-between"
                          }}
                        >
                          <Text
                            css={{
                              paddingRight: theme.spaces.xs,
                              background: "white"
                            }}
                          >
                            {ingredient.name}
                          </Text>
                          <div
                            css={{
                              flex: 1,
                              borderBottom: "1px dashed #eee",
                              marginBottom: "6px"
                            }}
                          />
                          <Text
                            css={{
                              paddingLeft: theme.spaces.xs,
                              background: "white"
                            }}
                          >
                            {ingredient.amount}
                          </Text>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {editing && (
              <Button intent="primary" size="sm" onClick={addNewIngredient}>
                Add another
              </Button>
            )}

            <div css={{ marginTop: theme.spaces.lg }}>
              {editing ? (
                <>
                  <Text variant="h5">Original author</Text>
                  <Input
                    placeholder="Author and source..."
                    value={credit}
                    onChange={e => {
                      setCredit(e.target.value);
                    }}
                  />
                </>
              ) : (
                <>
                  <Text variant="h5">Original author</Text>
                  <Text>{credit}</Text>
                </>
              )}
            </div>

            <div css={{ marginTop: theme.spaces.lg }}>
              <Text variant="h5">Instructions</Text>
              <div>
                <Editor
                  initialValue={defaultDescription ? defaultDescription : null}
                  readOnly={!editing}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
