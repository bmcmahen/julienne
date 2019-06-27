/** @jsx jsx */
import { jsx } from "@emotion/core";
import * as React from "react";
import { Redirect, Link } from "@reach/router";
import food from "./images/food.svg";
import {
  useTheme,
  Layer,
  Text,
  Button,
  Link as StyledLink,
  Input,
  InputGroup,
  LayerLoading,
  Alert,
  Container
} from "sancho";
import { loginWithGoogle, loginWithEmail, createUserWithEmail } from "./auth";
import queryString from "query-string";
import { Layout } from "./Layout";

export interface LoginProps {
  path?: string;
}

export const Login: React.FunctionComponent<LoginProps> = props => {
  const theme = useTheme();
  const qs = queryString.parse(location.search);
  const [isRegistering, setIsRegistering] = React.useState(
    typeof qs.register === "string"
  );

  const [loading, setLoading] = React.useState(false);
  const [redirectToReferrer, setRedirectToReferrer] = React.useState(false);

  const { from } = { from: { pathname: "/" } };

  // logging in errors
  const [error, setError] = React.useState("");
  const [form, setForm] = React.useState({ email: "", password: "" });

  function login(fn: () => Promise<void>) {
    return async () => {
      try {
        setError("");
        setLoading(true);
        await fn();
        setRedirectToReferrer(true);
      } catch (err) {
        setLoading(false);
        setError(err.message || "Please try again.");
      }
    };
  }

  async function loginEmail(e: React.FormEvent) {
    console.log("WHAT?");
    e.preventDefault();

    const { email, password } = form;

    const fn = isRegistering ? createUserWithEmail : loginWithEmail;

    try {
      setError("");
      setLoading(true);
      await fn(email, password);
      setRedirectToReferrer(true);
    } catch (err) {
      setLoading(false);
      setError(err.message || "Please try again.");
    }
  }

  if (redirectToReferrer) {
    return <Redirect from="" to={from.pathname} noThrow />;
  }

  return (
    <Layout>
      <Container>
        <div
          css={{
            marginTop: theme.spaces.xl,
            marginBottom: theme.spaces.lg,
            maxWidth: "26rem",
            marginLeft: "auto",
            marginRight: "auto",
            display: "block"
          }}
        >
          <Link
            css={{
              textDecoration: "none"
            }}
            to="/"
          >
            <Text
              variant="h4"
              css={{
                alignItems: "center",
                display: "block",

                width: "100%",
                textAlign: "center",
                color: "#43596c"
              }}
              gutter={false}
            >
              <img
                css={{
                  width: "75px",
                  height: "75px"
                }}
                src={food}
                aria-hidden
              />
              <div css={{ marginTop: theme.spaces.sm }}>Julienne.app</div>
            </Text>
          </Link>
          <Layer
            css={{
              boxShadow: "none",

              background: "white",
              [theme.mediaQueries.md]: {
                marginTop: theme.spaces.xl,
                boxShadow: theme.shadows.xl
              }
            }}
          >
            <div
              css={{
                borderBottom: "1px solid",
                borderColor: theme.colors.border.muted,
                textAlign: "center",
                padding: theme.spaces.lg,
                paddingBottom: theme.spaces.sm
              }}
            >
              <Text variant="h4">
                {isRegistering ? "Create an account" : "Log in to your account"}
              </Text>

              <div
                css={{
                  textAlign: "center",
                  paddingBottom: theme.spaces.sm
                }}
              >
                {isRegistering ? (
                  <Text css={{ fontSize: theme.fontSizes[0] }}>
                    Already have an account?{" "}
                    <StyledLink
                      href="#"
                      onClick={e => {
                        e.preventDefault();
                        setIsRegistering(false);
                      }}
                    >
                      Log in.
                    </StyledLink>
                  </Text>
                ) : (
                  <Text css={{ fontSize: theme.fontSizes[0] }}>
                    Don't have an account?{" "}
                    <StyledLink
                      href="#"
                      onClick={e => {
                        e.preventDefault();
                        setIsRegistering(true);
                      }}
                    >
                      Register.
                    </StyledLink>
                  </Text>
                )}
              </div>
            </div>
            <div
              css={{
                padding: theme.spaces.lg
              }}
            >
              {error && (
                <Alert
                  css={{ marginBottom: theme.spaces.md }}
                  intent="danger"
                  title="An error has occurred while logging in."
                  subtitle={error}
                />
              )}
              <Button
                onPress={login(loginWithGoogle)}
                css={{
                  marginBottom: theme.spaces.md,
                  width: "100%"
                }}
                block
              >
                Sign {isRegistering ? "up" : "in"} with Google
              </Button>

              <div>
                <form onSubmit={loginEmail}>
                  <Text muted css={{ textAlign: "center" }} variant="subtitle">
                    Or sign {isRegistering ? "up" : "in"} using an email and
                    password:
                  </Text>
                  <InputGroup hideLabel label="Email">
                    <Input
                      onChange={e => {
                        setForm({ ...form, email: e.currentTarget.value });
                      }}
                      value={form.email}
                      inputSize="md"
                      type="email"
                      placeholder="Email"
                    />
                  </InputGroup>
                  <InputGroup hideLabel label="Password">
                    <Input
                      onChange={e => {
                        setForm({ ...form, password: e.currentTarget.value });
                      }}
                      value={form.password}
                      inputSize="md"
                      type="password"
                      placeholder="Password"
                    />
                  </InputGroup>
                  <div css={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button
                      disabled={!form.email || !form.password}
                      block
                      component="button"
                      css={{
                        textAlign: "center",
                        width: "100%",

                        marginTop: theme.spaces.md
                      }}
                      type="submit"
                      size="md"
                      intent="primary"
                    >
                      Sign {isRegistering ? "up" : "in"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>

            <LayerLoading loading={loading} />
          </Layer>
        </div>
      </Container>
    </Layout>
  );
};
