/** @jsx jsx */
import { jsx, Global } from "@emotion/core";
import * as React from "react";
import Editor, { tryValue } from "./Editor";
import { ImageUpload } from "./ImageUpload";
import { Image } from "./Image";
import { Value } from "slate";
import debug from "debug";
import initialValue from "./value.json";
import { Ingredient } from "./RecipeList";
import {
  Navbar,
  Toolbar,
  Input,
  Text,
  Button,
  IconButton,
  MenuList,
  MenuItem,
  useTheme,
  InputBaseProps,
  useToast,
  LayerLoading,
  Container,
  ResponsivePopover,
  IconX,
  IconMoreVertical,
  IconArrowLeft
} from "sancho";
import { getUserFields, createEntry, deleteEntry, updateEntry } from "./db";
import { useSession } from "./auth";
import Helmet from "react-helmet";
import { Link, navigate } from "@reach/router";

let n = 0;

function getHighlightKey() {
  return `highlight_${n++}`;
}

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

/**
 * THIS IS A DISASTER. HAHAHhahha.. ugh. Rewrite when i'm not lazy
 * @param param0
 */

export const Compose: React.FunctionComponent<ComposeProps> = ({
  readOnly,
  id,
  editable,
  defaultCredit = "",
  defaultDescription,
  defaultImage,
  defaultIngredients,
  defaultTitle = ""
}) => {
  const theme = useTheme();
  const toast = useToast();
  const ref = React.useRef(null);
  const user = useSession();
  const [loading, setLoading] = React.useState(false);
  const [editing, setEditing] = React.useState(!readOnly);
  const [content, setContent] = React.useState(() => {
    return defaultDescription
      ? tryValue(defaultDescription)
      : Value.fromJSON(initialValue);
  });
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

  const [hoverIngredient, setHoverIngredient] = React.useState(null);
  const hoverIngredientRef = React.useRef(hoverIngredient);

  React.useEffect(() => {
    hoverIngredientRef.current = hoverIngredient;
  }, [hoverIngredient]);

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
    log("create entry");
    try {
      setLoading(true);
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
      navigate("/" + entry.id, { replace: true });
    } catch (err) {
      console.error(err);
      setLoading(false);
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
    log("update entry: %s", id);
    setLoading(true);
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
    setLoading(false);
  }

  // this is horribly inefficient...
  React.useEffect(() => {
    const slate = ref.current;
    if (!slate) {
      return;
    }

    const { editor } = slate;

    const { value } = editor;
    const { document, annotations } = value;

    editor.withoutSaving(() => {
      annotations.forEach((ann: any) => {
        if (ann.type === "highlight") {
          editor.removeAnnotation(ann);
        }
      });

      for (const [node, path] of document.texts()) {
        const { key, text } = node;

        ingredients.forEach(ing => {
          const normalized = ing.name.toLowerCase();
          const parts = text.toLowerCase().split(normalized);
          let offset = 0;

          parts.forEach((part, i) => {
            if (i !== 0) {
              editor.addAnnotation({
                key: getHighlightKey(),
                type: "highlight",
                data: { id: ing },
                anchor: { path, key, offset: offset - normalized.length },
                focus: { path, key, offset }
              });
            }

            offset = offset + part.length + normalized.length;
          });
        });
      }
    });
  });

  function renderAnnotation(props, editor, next) {
    const { children, annotation, attributes } = props;
    const annotationId = annotation.get("data").get("id");
    const isHovering = hoverIngredientRef.current === annotationId;

    switch (annotation.type) {
      case "highlight":
        return (
          <span
            onMouseEnter={() => {
              const id = annotation.get("data").get("id");
              setHoverIngredient(id);
            }}
            onMouseLeave={() => {
              setHoverIngredient(null);
            }}
            {...attributes}
            style={{
              borderRadius: "0.5rem",
              padding: "0 0.25rem",
              cursor: "default",

              backgroundColor: isHovering
                ? theme.colors.palette.yellow.light
                : theme.colors.background.tint2
            }}
          >
            {children}
          </span>
        );
      default:
        return next();
    }
  }

  async function handleDelete(id: string) {
    try {
      setLoading(true);
      await deleteEntry(id);
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
      setLoading(false);
      toast({
        title: "An error occurred. Please try again",
        subtitle: err.message,
        intent: "danger"
      });
    }
  }

  return (
    <div
      css={{
        [theme.mediaQueries.md]: {
          height: "auto",
          display: "block"
        }
      }}
    >
      <Helmet title={title ? title : "New Recipe"} />
      <Global
        styles={{
          ".Editor": {
            fontFamily: theme.fonts.base,
            color: theme.colors.text.default,
            lineHeight: theme.lineHeights.body
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
        css={{
          zIndex: theme.zIndices.sticky,
          backgroundColor: "white",
          boxShadow: theme.shadows.sm,
          position: "sticky",
          top: 0,
          [theme.mediaQueries.md]: {
            position: "static"
          }
        }}
      >
        <Toolbar
          css={{
            alignItems: "center",
            display: "flex"
          }}
        >
          <IconButton
            icon={<IconArrowLeft />}
            component={Link}
            to="/"
            label="Go back"
            replace
            variant="ghost"
            css={{
              marginRight: theme.spaces.sm,
              [theme.mediaQueries.md]: {
                display: "none"
              }
            }}
          />
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
            <Text
              css={{
                flex: 1,
                textAlign: "center",
                [theme.mediaQueries.md]: {
                  textAlign: "left"
                }
              }}
              wrap={false}
              variant="h5"
              gutter={false}
            >
              {title}
            </Text>
          )}
          <div>
            <ResponsivePopover
              content={
                <MenuList>
                  <MenuItem
                    onPress={() => {
                      setEditing(true);
                    }}
                  >
                    Edit
                  </MenuItem>
                  <MenuItem onPress={() => handleDelete(id)}>Delete</MenuItem>
                </MenuList>
              }
            >
              <IconButton
                css={{
                  display: !editing && editable ? undefined : "none",
                  marginLeft: theme.spaces.sm
                }}
                variant="ghost"
                icon={<IconMoreVertical />}
                label="Show options"
              />
            </ResponsivePopover>

            {editing && id && (
              <Button
                variant="ghost"
                css={{
                  display: "none",
                  [theme.mediaQueries.md]: {
                    display: "inline-flex"
                  },
                  marginLeft: theme.spaces.sm
                }}
                onPress={() => setEditing(false)}
              >
                Cancel
              </Button>
            )}
            {editing && (
              <Button
                intent="primary"
                disabled={!title}
                css={{ marginLeft: theme.spaces.sm }}
                onPress={() => {
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

                  id ? updateRecipe(id, toSave) : saveRecipe(toSave);
                }}
              >
                Save
              </Button>
            )}
          </div>
        </Toolbar>
      </Navbar>
      <div
        css={{
          flex: 1,
          [theme.mediaQueries.md]: {
            flex: "none"
          }
        }}
      >
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
            <Image alt={title} id={image} />
          ) : null}

          <Container>
            <div
              css={{
                paddingTop: theme.spaces.lg,
                paddingBottom: theme.spaces.lg
              }}
            >
              {ingredients.length > 0 && (
                <div>
                  <Text variant="h5">Ingredients</Text>
                  {ingredients.map((ingredient, i) => {
                    const activeHover = ingredient == hoverIngredient;

                    return (
                      <div key={i}>
                        {editing ? (
                          <Contain>
                            <div
                              onMouseEnter={() =>
                                setHoverIngredient(ingredient)
                              }
                              onMouseLeave={() => setHoverIngredient(null)}
                              css={{
                                borderRadius: "0.25rem",
                                backgroundColor: activeHover
                                  ? theme.colors.palette.yellow.light
                                  : "transparent",
                                display: "flex",
                                [theme.mediaQueries.md]: {
                                  maxWidth: "400px"
                                }
                              }}
                            >
                              <TransparentInput
                                autoFocus={!readOnly && ingredients.length > 1}
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
                                    icon={<IconX />}
                                    label="Delete ingredient"
                                    onPress={() => removeIngredient(i)}
                                  />
                                )}
                              </div>
                            </div>
                          </Contain>
                        ) : (
                          <div
                            onMouseEnter={() => setHoverIngredient(ingredient)}
                            onMouseLeave={() => setHoverIngredient(null)}
                            css={{
                              backgroundColor: activeHover
                                ? theme.colors.palette.yellow.light
                                : "transparent",
                              display: "flex",
                              marginLeft: "-0.25rem",
                              paddingLeft: "0.25rem",
                              marginRight: "-0.25rem",
                              paddingRight: "0.25rem",
                              borderRadius: "0.25rem",
                              marginBottom: theme.spaces.xs,
                              justifyContent: "space-between",
                              [theme.mediaQueries.md]: {
                                width: "300px"
                              }
                            }}
                          >
                            <Text
                              css={{
                                paddingRight: theme.spaces.xs,
                                backgroundColor: activeHover
                                  ? theme.colors.palette.yellow.light
                                  : "white"
                              }}
                            >
                              {ingredient.name}
                            </Text>
                            <div
                              css={{
                                flex: 1,
                                borderBottom: `1px dashed ${
                                  theme.colors.border.muted
                                }`,
                                marginBottom: "6px"
                              }}
                            />
                            <Text
                              css={{
                                paddingLeft: theme.spaces.xs,
                                backgroundColor: activeHover
                                  ? theme.colors.palette.yellow.light
                                  : "white"
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
                  onPress={addNewIngredient}
                >
                  Add another
                </Button>
              )}

              <div css={{ marginTop: theme.spaces.lg }}>
                <Text variant="h5">Instructions</Text>
                <div>
                  <Editor
                    ref={ref}
                    value={content}
                    onChange={value => setContent(value)}
                    renderAnnotation={renderAnnotation}
                    initialValue={
                      defaultDescription ? defaultDescription : null
                    }
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
                    {credit && (
                      <>
                        <Text variant="h5">Original author</Text>
                        <Text>{credit}</Text>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </Container>
        </div>
      </div>
      <LayerLoading loading={loading} />
    </div>
  );
};

interface TransparentInputProps extends InputBaseProps {}

const TransparentInput = (props: TransparentInputProps) => {
  const theme = useTheme();
  return (
    <Input
      css={{
        background: "none",
        border: "none",
        boxShadow: "none",
        // paddingTop: theme.spaces.xs,
        // paddingBottom: theme.spaces.xs,
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
