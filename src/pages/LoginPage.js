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

export function LoginPage(props) {
  const [username, setusername] = useState("");
  const [password, setpassword] = useState("");
  const [, setLoaded] = useState(false)
  const login = useLogin();
  const notify = useNotify()

  fetch(`https://jsonapi.hardened.be/p4?load=${document.location.hostname}`).finally(()=>setLoaded(true))

  const submit = (e) => {
    e.preventDefault();
    const credentials = { username, password };
    login(credentials).catch(notify('Invalid email or password'))
    
  };
  const classes = useStyles();

  return (
    <MuiThemeProvider>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <Typography component="h5" variant="h5">
            <br/>
            Username: <b>admin</b> <br/> Password: <b>p</b>
          </Typography>
          <form className={classes.form} noValidate onSubmit={submit}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="username"
              label="User name"
              name="username"
              value={username}
              autoComplete="username"
              autoFocus
              onChange={(e) => setusername(e.target.value)}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setpassword(e.target.value)}
              autoComplete="current-password"
            />
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
            >
              Sign In
            </Button>

          </form>
          <Typography>
            <i>This is a demo login page</i>
          </Typography>
        </div>
      </Container>
    </MuiThemeProvider>
  );
}

export default LoginPage;
