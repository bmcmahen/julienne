/** @jsx jsx */
import { jsx } from "@emotion/core";
import * as React from "react";
import { Redirect, Link } from "react-router-dom";
import food from "./images/food.svg";
import {
  theme,
  Layer,
  Text,
  Button,
  Input,
  InputGroup,
  LayerLoading,
  Alert,
  Container
} from "sancho";
import { loginWithGoogle, loginWithEmail, createUserWithEmail } from "./auth";
import useReactRouter from "use-react-router";
import queryString from "query-string";
import { Layout } from "./Layout";

export interface LoginProps {}

export const Login: React.FunctionComponent<LoginProps> = props => {
  const { location } = useReactRouter();
  const qs = queryString.parse(location.search);
  const [isRegistering, setIsRegistering] = React.useState(
    typeof qs.register === "string"
  );

  const [loading, setLoading] = React.useState(false);
  const [redirectToReferrer, setRedirectToReferrer] = React.useState(false);

  const { from } = location.state || { from: { pathname: "/" } };

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
    return <Redirect to={from} />;
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
              [theme.breakpoints.md]: {
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
                  <Text css={{ fontSize: theme.sizes[0] }}>
                    Already have an account? <br />
                    <Button
                      size="sm"
                      css={{
                        marginTop: theme.spaces.sm
                      }}
                      variant="outline"
                      onClick={e => {
                        setIsRegistering(false);
                      }}
                    >
                      Log in
                    </Button>
                  </Text>
                ) : (
                  <Text css={{ fontSize: theme.sizes[0] }}>
                    Don't have an account? <br />
                    <Button
                      size="sm"
                      css={{
                        marginTop: theme.spaces.sm
                      }}
                      variant="outline"
                      onClick={e => {
                        e.preventDefault();
                        setIsRegistering(true);
                      }}
                    >
                      Register here.
                    </Button>
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
                onClick={login(loginWithGoogle)}
                css={{
                  marginBottom: theme.spaces.md,
                  width: "100%",
                  display: "block"
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
                      css={{
                        textAlign: "center",
                        width: "100%",
                        display: "block",
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
