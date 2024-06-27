import { useState } from "react";
import MuiThemeProvider from "@mui/material/styles";
import { createTheme } from "@mui/material/styles";
import { useLogin, useNotify } from "react-admin";

import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import LockOutlinedIcon from "@mui/material";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/material/styles";
import Container from "@mui/material/Container";
import { getKcUrl } from "../Config";
import * as React from "react";
import Keycloak, {
  KeycloakConfig,
  KeycloakTokenParsed,
  KeycloakInitOptions,
} from "keycloak-js";

const loggedInPar = "?logged_in=true";

const theme = createTheme({
  palette: {
    primary: {
      main: "#ffffff",
    },
    secondary: {
      main: "#000000",
    },
  },
});

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

const initOptions: KeycloakInitOptions = {
  onLoad: "login-required",
  checkLoginIframe: false,
  redirectUri: "http://localhost:3000/admin-app/#/Home?",
};
let kc = new Keycloak(initOptions as Keycloak.KeycloakConfig);

console.log("kclogin");

/*
 */
const SraLogin = (keycloak: Keycloak) => {
  console.log("sral", keycloak);
  keycloak.login();
};

export function LoginPage(props: any) {
  const [username, setusername] = useState("");
  const [password, setpassword] = useState("");
  const [, setLoaded] = useState(false);
  //const login = useLogin();
  const notify = useNotify();

  console.log("kcloginpage", props);
  const submit = (e: any) => {
    e.preventDefault();
    SraLogin(props.kc);
  };

  return (
    <MuiThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>

          <form className={classes.form} noValidate onSubmit={submit}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
            >
              Sign In with KeyCloak
            </Button>
          </form>
          <Typography></Typography>
        </div>
      </Container>
    </MuiThemeProvider>
  );
}

export default LoginPage;
