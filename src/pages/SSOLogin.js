import { useState} from "react";
import { MuiThemeProvider } from "@material-ui/core/styles";
import {useLogin, useNotify } from 'react-admin'

import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import { useConf } from "../Config";


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

export function SSOLogin(props) {
  const [username, setusername] = useState("");
  const [password, setpassword] = useState("");
  const [, setLoaded] = useState(false)
  const login = useLogin();
  const notify = useNotify()
  const conf = useConf();
  
  window.location.href = conf.authentication.redirect;

  const submit = (e) => {
    e.preventDefault();
    const credentials = { username, password };
    login(credentials).catch(err=> {console.warn(err); notify('Invalid email or password')})
    
  };
  const classes = useStyles();
  
  return (
    <MuiThemeProvider>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
          Redirecting ... 
        </div>
      </Container>
    </MuiThemeProvider>
  );
}

export default SSOLogin;
