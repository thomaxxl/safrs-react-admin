import { useState } from "react";
import { MuiThemeProvider } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import { useConf } from "../Config";
import { TextField } from "@mui/material";
import * as React from "react";

const RedirBtn = () => {
  const conf = useConf();
  const [redir, setRedir] = useState(false);
  const [jwtValue, setJwtValue] = useState("");

  const handleTextFieldChange = (event: any) => {
    setJwtValue(event.target.value);
  };

  const saveJwt = () => {
    localStorage.setItem("auth_token", jwtValue);
  };

  if (redir) {
    window.location.href = conf?.authentication?.redirect;
  }

  return (
    <div>
      <Button onClick={() => setRedir(true)} color="primary" variant="outlined">
        Click to redirect to {conf?.authentication?.sso}{" "}
        (conf.authentication.sso)
      </Button>
      <TextField
        label="JWT"
        variant="outlined"
        value={jwtValue}
        onChange={handleTextFieldChange}
      ></TextField>
      <br />
      <Button
        onClick={() => saveJwt()}
        color="primary"
        variant="outlined"
        title="ey.."
      >
        Save JWT to localStorage
      </Button>
    </div>
  );
};

export function SSOLogin(props: any) {
  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <RedirBtn />
    </Container>
  );
}

export default SSOLogin;
