/** @jsx jsx */
import { jsx, Global } from "@emotion/core";
import * as React from "react";
import Editor from "./Editor";
import { ImageUpload } from "./ImageUpload";
import { Image } from "./Image";
import debug from "debug";
import useReactRouter from "use-react-router";
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
  theme,
  InputBaseProps,
  toast
} from "sancho";
import { getUserFields, createEntry, deleteEntry, updateEntry } from "./db";
import { useSession } from "./auth";

const log = debug("app:Compose");

export interface ComposeProps {
  id?: string;
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
  id,
  editable,
  defaultCredit,
  defaultDescription,
  defaultImage,
  defaultIngredients,
  defaultTitle
}) => {
  const ref = React.useRef(null);
  const user = useSession();
  const { history } = useReactRouter();
  const [editing, setEditing] = React.useState(!readOnly);
  const [image, setImage] = React.useState(defaultImage);
  const [title, setTitle] = React.useState(defaultTitle);
  const [credit, setCredit] = React.useState(defaultCredit);
  const [ingredients, setIngredients] = React.useState<Ingredient[]>(
    defaultIngredients || [
      {
        name: "",
        amount: ""
      }
    ]
  );

  function onIngredientChange(i: number, value: Ingredient) {
    ingredients[i] = value;
    log("on ingredient change: %o", ingredients);
    setIngredients([...ingredients]);
  }

  function addNewIngredient() {
    ingredients.push({ name: "", amount: "" });
    setIngredients([...ingredients]);
  }

  function removeIngredient(i: number) {
    ingredients.splice(i, 1);
    setIngredients([...ingredients]);
  }

  async function saveRecipe({
    title,
    plain,
    ingredients,
    description,
    author,
    image
  }: {
    title: string;
    plain: string;
    ingredients: Ingredient[];
    description: string;
    author: string;
    image: string;
  }) {
    try {
      const entry = await createEntry({
        title,
        plain,
        userId: user.uid,
        description,
        createdBy: getUserFields(user),
        ingredients: ingredients.filter(ing => ing.name),
        image,
        author
      });
      history.replace("/" + entry.id);
    } catch (err) {
      console.error(err);
      toast({
        title: "An error occurred. Please try again",
        subtitle: err.message,
        intent: "danger"
      });
    }
  }

  async function updateRecipe(
    id: string,
    {
      title,
      plain,
      ingredients,
      description,
      author,
      image
    }: {
      title: string;
      plain: string;
      ingredients: Ingredient[];
      description: string;
      author: string;
      image: string;
    }
  ) {
    try {
      await updateEntry(id, {
        title,
        plain,
        description,
        createdBy: getUserFields(user),
        ingredients: ingredients.filter(ing => ing.name),
        image,
        author
      });
      setEditing(false);
    } catch (err) {
      console.error(err);
      toast({
        title: "An error occurred. Please try again",
        subtitle: err.message,
        intent: "danger"
      });
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteEntry(id);
      history.replace("/");
    } catch (err) {
      console.error(err);
      toast({
        title: "An error occurred. Please try again",
        subtitle: err.message,
        intent: "danger"
      });
    }
  }

  return (
    <div>
      <Global
        styles={{
          ".Editor": {
            fontFamily: theme.fonts.base,
            color: theme.colors.text.default,
            lineHeight: theme.lineHeight
          },
          ".filepond--wrapper": {
            padding: theme.spaces.lg,
            paddingBottom: 0
          },
          ".filepond--root": {
            marginBottom: 0
          },
          ".filepond--label-action": {
            display: "flex",
            alignItems: "center",
            textDecoration: "none"
          },
          ".filepond--label-action > svg": {
            width: "40px",
            height: "40px",
            fill: theme.colors.text.default
          },
          ".filepond--label-action > span": {
            border: 0,
            clip: "rect(0 0 0 0)",
            height: "1px",
            width: "1px",
            margin: "-1px",
            padding: 0,
            overflow: "hidden",
            position: "absolute"
          },
          ".filepond--panel-root": {
            backgroundColor: theme.colors.background.tint1
          },
          '.Editor [contenteditable="false"]': {
            opacity: "1 !important" as any,
            color: theme.colors.scales.gray[6]
          }
        }}
      />
      <Navbar
        css={{ backgroundColor: "white", boxShadow: theme.shadows.sm }}
        position="static"
      >
        <Toolbar css={{ display: "flex", justifyContent: "space-between" }}>
          {editing ? (
            <div css={{ marginLeft: "-0.75rem", flex: 1 }}>
              <TransparentInput
                autoComplete="off"
                autoFocus
                inputSize="lg"
                value={title}
                placeholder="Recipe title"
                aria-label="Recipe title"
                onChange={e => {
                  setTitle(e.target.value);
                }}
              />
            </div>
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
                    <MenuItem onSelect={() => handleDelete(id)}>
                      Delete
                    </MenuItem>
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
                css={{ marginLeft: theme.spaces.sm }}
                onClick={() => {
                  const current = ref.current as any;
                  const { text, content } = current.serialize();
                  const toSave = {
                    title,
                    description: content,
                    plain: text,
                    ingredients,
                    author: credit,
                    image
                  };

                  id ? saveRecipe(toSave) : updateRecipe(id, toSave);
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
                        <Contain>
                          <div
                            css={{
                              display: "flex",
                              maxWidth: "400px"
                            }}
                          >
                            <TransparentInput
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
                            <TransparentInput
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
                            <div
                              css={{
                                marginLeft: theme.spaces.sm,
                                flex: "0 0 40px"
                              }}
                            >
                              {i > 0 && (
                                <IconButton
                                  variant="ghost"
                                  icon="cross"
                                  label="Delete ingredient"
                                  onClick={() => removeIngredient(i)}
                                />
                              )}
                            </div>
                          </div>
                        </Contain>
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
              <Button
                css={{ marginTop: theme.spaces.sm }}
                size="sm"
                onClick={addNewIngredient}
              >
                Add another
              </Button>
            )}

            <div css={{ marginTop: theme.spaces.lg }}>
              <Text variant="h5">Instructions</Text>
              <div>
                <Editor
                  ref={ref}
                  initialValue={defaultDescription ? defaultDescription : null}
                  readOnly={!editing}
                />
              </div>
            </div>
            <div css={{ marginTop: theme.spaces.lg }}>
              {editing ? (
                <>
                  <Text variant="h5">Original author</Text>
                  <Contain>
                    <TransparentInput
                      placeholder="Author and source..."
                      value={credit}
                      onChange={e => {
                        setCredit(e.target.value);
                      }}
                    />
                  </Contain>
                </>
              ) : (
                <>
                  <Text variant="h5">Original author</Text>
                  <Text>{credit}</Text>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface TransparentInputProps extends InputBaseProps {}

const TransparentInput = (props: TransparentInputProps) => {
  return (
    <Input
      css={{
        background: "none",
        border: "none",
        boxShadow: "none",
        paddingTop: theme.spaces.xs,
        paddingBottom: theme.spaces.xs,
        ":focus": {
          outline: "none",
          boxShadow: "none",
          background: "none"
        }
      }}
      {...props}
    />
  );
};

const Contain = props => {
  return (
    <div
      css={{
        marginTop: "-0.25rem",
        marginLeft: "-0.75rem",
        marginRight: "-0.75rem"
      }}
      {...props}
    />
  );
};
