import { useState} from "react";
import { MuiThemeProvider } from "@material-ui/core/styles";
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
import { Input } from "@mui/material";


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
    width: "100%",
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

const RedirBtn = () => {
    const conf = useConf();
    const classes = useStyles();  
    const [redir, setRedir] = useState(false);

    if(redir){
        window.location.href = conf.authentication.redirect;
    }

    return <div className={classes.paper}>
        
        <Button onClick={()=>setRedir(1)} color="primary" variant="outlined" >Click to redirect to {conf.authentication.sso}</Button>
        
        </div>
}

export function SSOLogin(props) {
  
  return (
    <MuiThemeProvider>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <RedirBtn/>    
      </Container>
    </MuiThemeProvider>
  );
}

export default SSOLogin;
