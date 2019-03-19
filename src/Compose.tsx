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
  MenuItem
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
      <Navbar position="static">
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
            <Text variant="h4" gutter={false}>
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
                <IconButton icon="more" label="Show options" />
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

          {ingredients.length > 0 && (
            <div>
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
                      <>
                        <Text>{ingredient.name}</Text>
                        <Text>{ingredient.amount}</Text>
                      </>
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

          {editing ? (
            <>
              <Text>Original author</Text>
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
              <Text>Original author</Text>
              <Text>{credit}</Text>
            </>
          )}
        </div>
      </div>
      <div>
        <Text>Instructions</Text>
        <div>
          <Editor
            initialValue={defaultDescription ? defaultDescription : null}
            readOnly={!editing}
          />
        </div>
      </div>
    </div>
  );
};
