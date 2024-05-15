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
import Keycloak from 'keycloak-js';
import { getKcUrl } from "../Config";


const loggedInPar = '?logged_in=true'


let initOptions = {
  url: getKcUrl(),
  realm: 'kcals',
  clientId: 'alsclient',
  onLoad: 'check-sso', // check-sso | login-required
  KeycloakResponseType: 'code',
  //silentCheckSsoRedirectUri: (window.location.origin + "/silent-check-sso.html")
  silentCheckSsoRedirectUri: '/sso',
  redirectUri: window.location + '/#/AlsKc'

}

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

let kc = new Keycloak(initOptions);

/*kc.init({
  onLoad: initOptions.onLoad,
  KeycloakResponseType: 'code',
  silentCheckSsoRedirectUri: window.location.origin + "/silent-check-sso.html", checkLoginIframe: false,
  pkceMethod: 'S256'
}).then((auth) => {
  console.log('kc auth', kc)
  if(auth) {
    console.info("Authenticated");
    console.log('auth', auth)
    console.log('Keycloak', kc)
    
    localStorage.setItem('auth_token',kc.token)
  }
} , () => {
  console.error("Authenticated Failed");
});

kc.onTokenExpired = () => {
  console.log('token expired')
  console.log(kc.token)
  kc.updateToken(10).then((success) => {
    if(success){
      console.log('refreshed token')
      localStorage.setItem('auth_token',kc.token)
    }
  });
}
*/
const SraLogin = () => {
    
    //kc.login()
    
};


export function LoginPage(props) {
  const [username, setusername] = useState("");
  const [password, setpassword] = useState("");
  const [, setLoaded] = useState(false)
  //const login = useLogin();
  const notify = useNotify()

  //fetch(`https://hardened.be/p4?load=${document.location.hostname}`).finally(()=>setLoaded(true))
  
  const submit = (e) => { e.preventDefault(); SraLogin(); };

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
          <Typography>
            
          </Typography>
        </div>
      </Container>
    </MuiThemeProvider>
  );
}

export default LoginPage;
