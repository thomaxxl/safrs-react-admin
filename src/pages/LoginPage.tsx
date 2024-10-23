import { useState } from "react";
import MuiThemeProvider, { ThemeProvider } from "@mui/material/styles";
import { createTheme } from "@mui/material/styles";
import { useLogin, useNotify } from "react-admin";
import { useAuthProvider } from "react-admin";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { useConf } from "../Config";

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

export function LoginPage(props) {
  const [username, setusername] = useState("admin");
  const [password, setpassword] = useState("");
  const login = useLogin();
  const notify = useNotify();
  const authProvider = useAuthProvider();
  console.log("AProv", authProvider);
  localStorage.removeItem("auth_token");
  const handleSubmit = (e) => {
    e.preventDefault();

    // will call authProvider.login({ username, password }))
    login({ username, password }).catch(() =>
      notify("Invalid email or password")
    );
  };

  const conf = useConf();

  let msg = <Typography component="h6" variant="h6">Username: <b>admin</b> <br /> Password: <b>p</b></Typography>

  if (conf.settings?.Home === "WebGenie") {
    msg = <Typography component="h6" variant="h6">Username: <b>admin</b> <br /> Password: <br/> <b>Container environment variable <code>ADMIN_PASSWORD</code></b></Typography>
  }

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div
          style={{
            marginTop: theme.spacing(8),
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar
            style={{
              margin: theme.spacing(1),
              backgroundColor: theme.palette.secondary.main,
            }}
          >
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          {msg}
          <form
            style={{
              width: "100%", // Fix IE 11 issue.
              marginTop: theme.spacing(1),
            }}
            noValidate
            onSubmit={handleSubmit}
          >
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="username"
              label="User name"
              name="username"
              InputLabelProps={{
                style: { color: "black" },
              }}
              value={username}
              autoComplete="username"
              
              onChange={(e) => setusername(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "grey",
                  },
                  "&:hover fieldset": {
                    borderColor: "black",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "blue",
                  },
                },
              }}
            />
            <TextField
              variant="outlined"
              margin="normal"
              autoFocus
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              value={password}
              InputLabelProps={{
                style: { color: "black" },
              }}
              onChange={(e) => setpassword(e.target.value)}
              autoComplete="current-password"
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "grey",
                  },
                  "&:hover fieldset": {
                    borderColor: "black",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "blue",
                  },
                },
              }}
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
              style={{
                margin: theme.spacing(3, 0, 2),
              }}
            >
              Sign In
            </Button>
          </form>
          <Typography>
          </Typography>
        </div>
      </Container>
    </ThemeProvider>
  );
}

export default LoginPage;
