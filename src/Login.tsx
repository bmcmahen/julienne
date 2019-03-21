/** @jsx jsx */
import { jsx, Global } from "@emotion/core";
import * as React from "react";
import { Location } from "history";
import { loginWithGoogle } from "./auth";
import { Redirect } from "react-router";
import food from "./images/food.svg";
import {
  Navbar,
  Toolbar,
  Text,
  Button,
  theme,
  responsiveBodyPadding,
  Container,
  Link
} from "sancho";

export interface LoginProps {
  location: Location;
}

export const Login: React.FunctionComponent<LoginProps> = ({ location }) => {
  const { from } = location.state || { from: "/" };
  const [loading, setLoading] = React.useState(false);
  const [redirect, setRedirect] = React.useState(false);
  // const [password, setPassword] = React.useState("");
  // const [email, setEmail] = React.useState("");

  const login = async () => {
    setLoading(true);

    try {
      await loginWithGoogle();
      setRedirect(true);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (redirect) {
    return <Redirect to={from} />;
  }

  return (
    <main>
      <Global
        styles={{
          html: {
            backgroundColor: theme.colors.background.tint1
          }
        }}
      />
      <Navbar
        position="fixed"
        css={{
          position: "absolute",
          boxShadow: "none",
          background: "transparent"
        }}
      >
        <Toolbar>
          <Text
            variant="h5"
            css={{
              alignItems: "center",
              display: "flex",
              color: "#43596c"
            }}
            gutter={false}
          >
            <img
              css={{
                marginRight: theme.spaces.sm,
                width: "30px",
                height: "30px"
              }}
              src={food}
              aria-hidden
            />
            <span>Julienne</span>
          </Text>
          <Button
            intent="primary"
            size="md"
            onClick={login}
            css={{ marginLeft: "auto" }}
          >
            Sign in
          </Button>
        </Toolbar>
      </Navbar>
      <div
        css={[
          {
            paddingBottom: theme.spaces.xl,
            width: "100%",
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            overflow: "hidden",
            position: "relative",
            // backgroundSize: "cover",
            background: "white",

            [theme.breakpoints.md]: {
              backgroundSize: "cover",
              backgroundImage: `url(${require("./images/cutting-board-knife.jpg")})`
            }
          },
          responsiveBodyPadding
        ]}
      >
        <Text
          css={{
            paddingTop: theme.spaces.lg,
            maxWidth: "36rem",
            paddingLeft: theme.spaces.md,
            paddingRight: theme.spaces.md,
            marginBottom: theme.spaces.lg,
            textAlign: "center",
            fontWeight: 900,
            marginTop: theme.spaces.lg,
            marginBotttom: theme.spaces.xl,
            color: theme.colors.palette.gray.base
          }}
          variant="h2"
        >
          Build a database of shared recipes with family and friends
        </Text>

        <div
          css={{
            fontSize: theme.sizes[0],
            maxWidth: "34rem",
            position: "relative",
            padding: "8px 15px",
            background: theme.colors.background.tint1,
            marginLeft: theme.spaces.md,
            marginRight: theme.spaces.md,
            borderRadius: theme.radii.lg,
            display: "inline-block",
            [theme.breakpoints.md]: {
              background: "white",
              marginLeft: "60px"
            }
          }}
        >
          <div
            css={{
              content: "",
              position: "absolute",
              zIndex: 0,
              display: "none",
              bottom: 0,
              left: "-7px",
              height: "20px",
              width: "20px",
              background: "white",
              backgroundAttachment: "fixed",
              borderBottomRightRadius: "15px",
              [theme.breakpoints.md]: {
                display: "block"
              }
            }}
          />
          <Text
            css={{
              fontSize: theme.sizes[0],
              display: "flex",
              textAlign: "center",
              justifyContent: "center",
              alignItems: "flex-end",
              [theme.breakpoints.md]: {
                textAlign: "left"
              }
            }}
          >
            <img
              css={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                position: "absolute",
                flex: "0 0 60px",
                display: "none",
                bottom: "-25px",
                left: "-80px",
                [theme.breakpoints.md]: {
                  display: "block"
                }
              }}
              src="https://pbs.twimg.com/profile_images/775452326450475009/MTsFSYGs_400x400.jpg"
              alt="Ben"
            />
            Hey! My name's Ben. I was getting tired of losing recipes in my
            inbox and nagging friends and family for their recipes, so I created
            this little app. It's a simple tool to help my family maintain a
            shared, searchable database of recipes. Give it a try, and happy
            cooking! 😋
          </Text>
          <div
            css={{
              content: "",
              position: "absolute",
              zIndex: 1,
              bottom: 0,
              left: "-10px",
              height: "20px",
              width: "10px",
              display: "none",
              [theme.breakpoints.md]: {
                display: "block"
              },
              background: "#e0dbd8d1",
              borderBottomRightRadius: "10px"
            }}
          />
        </div>

        <div
          css={{
            paddingLeft: theme.spaces.md,
            paddingRight: theme.spaces.md,
            paddingBottom: theme.spaces.xl,
            textAlign: "center",
            marginTop: theme.spaces.lg
          }}
        >
          <Text css={{ fontSize: theme.sizes[0], display: "block" }}>
            Get started by signing in using your google account. It's{" "}
            <strong>totally free!</strong>
          </Text>

          <Button
            size="lg"
            intent="primary"
            iconAfter="arrow-right"
            onClick={login}
            css={{
              // borderColor: "white",
              // color: "white",
              marginTop: theme.spaces.md
            }}
            disabled={loading}
          >
            Sign in with Google
          </Button>
        </div>

        <svg
          css={{
            position: "absolute",
            bottom: "0",
            minWidth: "1200px",
            fill: theme.colors.background.tint1
          }}
          id="clouds"
          xmlns="http://www.w3.org/2000/svg"
          version="1.1"
          width="100%"
          height="100"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path
            d="M-5 100 Q 0 20 5 100 Z
						 M0 100 Q 5 0 10 100
						 M5 100 Q 10 30 15 100
						 M10 100 Q 15 10 20 100
						 M15 100 Q 20 30 25 100
						 M20 100 Q 25 -10 30 100
						 M25 100 Q 30 10 35 100
						 M30 100 Q 35 30 40 100
						 M35 100 Q 40 10 45 100
						 M40 100 Q 45 50 50 100
						 M45 100 Q 50 20 55 100
						 M50 100 Q 55 40 60 100
						 M55 100 Q 60 60 65 100
						 M60 100 Q 65 50 70 100
						 M65 100 Q 70 20 75 100
						 M70 100 Q 75 45 80 100
						 M75 100 Q 80 30 85 100
						 M80 100 Q 85 20 90 100
						 M85 100 Q 90 50 95 100
						 M90 100 Q 95 25 100 100
						 M95 100 Q 100 15 105 100 Z"
          />
        </svg>
      </div>
      <div
        css={{
          background: theme.colors.background.tint1,
          paddingTop: theme.spaces.lg,
          paddingBottom: theme.spaces.lg,
          width: "100%",
          overflow: "hidden"
        }}
      >
        <Container css={{}}>
          <div
            css={{
              display: "block",
              textAlign: "center",
              "& > div": {
                marginBottom: theme.spaces.xl,
                maxWidth: "20rem",
                marginLeft: "auto",
                marginRight: "auto"
              },
              [theme.breakpoints.lg]: {
                display: "flex",
                justifyContent: "space-between",
                "& > div": {
                  margin: theme.spaces.lg,
                  maxWidth: "20rem"
                }
              }
            }}
          >
            <div>
              <svg
                css={{ marginBottom: theme.spaces.md }}
                xmlns="http://www.w3.org/2000/svg"
                width="34"
                height="34"
                viewBox="0 0 24 24"
              >
                <path d="M22 2v22h-20v-22h3c1.23 0 2.181-1.084 3-2h8c.82.916 1.771 2 3 2h3zm-11 1c0 .552.448 1 1 1 .553 0 1-.448 1-1s-.447-1-1-1c-.552 0-1 .448-1 1zm9 1h-4l-2 2h-3.897l-2.103-2h-4v18h16v-18zm-13 9.729l.855-.791c1 .484 1.635.852 2.76 1.654 2.113-2.399 3.511-3.616 6.106-5.231l.279.64c-2.141 1.869-3.709 3.949-5.967 7.999-1.393-1.64-2.322-2.686-4.033-4.271z" />
              </svg>
              <Text variant="h4">Save</Text>
              <Text>
                Write out your recipes and access them from anywhere. Find your
                recipes on the road, at a friend's place, or in the comfort of
                your own kitchen.
              </Text>
            </div>

            <div>
              <svg
                css={{ marginBottom: theme.spaces.md }}
                xmlns="http://www.w3.org/2000/svg"
                width="34"
                height="34"
                viewBox="0 0 24 24"
              >
                <path d="M20 3c0-1.657-1.344-3-3-3s-3 1.343-3 3c0 .312.061.606.149.889l-4.21 3.157c.473.471.878 1.01 1.201 1.599l4.197-3.148c.477.316 1.048.503 1.663.503 1.656 0 3-1.343 3-3zm-2 0c0 .551-.448 1-1 1s-1-.449-1-1 .448-1 1-1 1 .449 1 1zm3 12.062c1.656 0 3-1.343 3-3s-1.344-3-3-3c-1.281 0-2.367.807-2.797 1.938h-6.283c.047.328.08.66.08 1s-.033.672-.08 1h6.244c.396 1.195 1.509 2.062 2.836 2.062zm-1-3c0-.551.448-1 1-1s1 .449 1 1-.448 1-1 1-1-.448-1-1zm-20-.062c0 2.761 2.238 5 5 5s5-2.239 5-5-2.238-5-5-5-5 2.239-5 5zm2 0c0-1.654 1.346-3 3-3s3 1.346 3 3-1.346 3-3 3-3-1.346-3-3zm7.939 4.955l4.21 3.157c-.088.282-.149.576-.149.888 0 1.657 1.344 3 3 3s3-1.343 3-3-1.344-3-3-3c-.615 0-1.186.187-1.662.504l-4.197-3.148c-.324.589-.729 1.127-1.202 1.599zm6.061 4.045c0-.551.448-1 1-1s1 .449 1 1-.448 1-1 1-1-.449-1-1z" />
              </svg>
              <Text variant="h4">Share</Text>
              <Text>
                Easily share recipes with family and friends by creating a
                shared recipe collection. Trust me, it beats emailing recipes.
                And it's super easy to find them again later.
              </Text>
            </div>

            <div>
              <svg
                css={{ marginBottom: theme.spaces.md }}
                xmlns="http://www.w3.org/2000/svg"
                width="34"
                height="34"
                viewBox="0 0 24 24"
              >
                <path d="M13 8h-8v-1h8v1zm0 2h-8v-1h8v1zm-3 2h-5v-1h5v1zm11.172 12l-7.387-7.387c-1.388.874-3.024 1.387-4.785 1.387-4.971 0-9-4.029-9-9s4.029-9 9-9 9 4.029 9 9c0 1.761-.514 3.398-1.387 4.785l7.387 7.387-2.828 2.828zm-12.172-8c3.859 0 7-3.14 7-7s-3.141-7-7-7-7 3.14-7 7 3.141 7 7 7z" />
              </svg>
              <Text variant="h4">Search</Text>
              <Text>
                Search for recipes by ingredient, name, or author. It's really,
                really fast - at least a tad faster than flipping through your
                overflowing recipe box.
              </Text>
            </div>
          </div>
        </Container>
      </div>
      <div
        css={{
          textAlign: "center",
          position: "relative",
          paddingBottom: theme.spaces.lg,
          paddingTop: "4rem",
          background: theme.colors.background.tint2,
          width: "100%",
          overflow: "hidden"
        }}
      >
        <svg
          css={{
            position: "absolute",
            top: "0",
            left: 0,
            transform: "rotate(180deg)",
            minWidth: "1200px",
            fill: theme.colors.background.tint1
          }}
          id="clouds"
          xmlns="http://www.w3.org/2000/svg"
          version="1.1"
          width="100%"
          height="100"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path
            d="M-5 100 Q 0 20 5 100 Z
						 M0 100 Q 5 0 10 100
						 M5 100 Q 10 30 15 100
						 M10 100 Q 15 10 20 100
						 M15 100 Q 20 30 25 100
						 M20 100 Q 25 -10 30 100
						 M25 100 Q 30 10 35 100
						 M30 100 Q 35 30 40 100
						 M35 100 Q 40 10 45 100
						 M40 100 Q 45 50 50 100
						 M45 100 Q 50 20 55 100
						 M50 100 Q 55 40 60 100
						 M55 100 Q 60 60 65 100
						 M60 100 Q 65 50 70 100
						 M65 100 Q 70 20 75 100
						 M70 100 Q 75 45 80 100
						 M75 100 Q 80 30 85 100
						 M80 100 Q 85 20 90 100
						 M85 100 Q 90 50 95 100
						 M90 100 Q 95 25 100 100
						 M95 100 Q 100 15 105 100 Z"
          />
        </svg>
        <Text
          css={{ position: "relative", zIndex: 10, fontSize: theme.sizes[0] }}
        >
          Made by <Link href="http://www.benmcmahen.com">Ben McMahen</Link>
          <br />
          <Link href="mailto:ben.mcmahen@gmail.com">Email me</Link> with
          questions or whatevs!
          <br />
          <div>
            Icons made by{" "}
            <Link
              href="https://www.flaticon.com/authors/smashicons"
              title="Smashicons"
            >
              Smashicons
            </Link>{" "}
            from{" "}
            <Link href="https://www.flaticon.com/" title="Flaticon">
              www.flaticon.com
            </Link>{" "}
            is licensed by{" "}
            <Link
              href="http://creativecommons.org/licenses/by/3.0/"
              title="Creative Commons BY 3.0"
              target="_blank"
            >
              CC 3.0 BY
            </Link>
          </div>
        </Text>
      </div>
    </main>
  );
};
