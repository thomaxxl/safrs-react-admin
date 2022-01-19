import React, { useState } from "react";
import Grid from '@material-ui/core/Grid';
import { Typography, Button } from '@material-ui/core';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { FormControl } from '@mui/material';
import {useRecordContext, useDataProvider} from "react-admin";

export const UserPasswordTab = () => {
    const record = useRecordContext();
    const dataProvider = useDataProvider();
    const [pwdValue, setPwdValue] = useState("");
    const [rpwdValue, setRPwdValue] = useState("");
    const [submitColor, setSubmitColor] = useState("")
    const onPwdChange = (e) => {
        let pwdValue = e.target.value
        setPwdValue(pwdValue)
        setSubmitColor(pwdValue === rpwdValue && pwdValue.length > 5  ? "primary" : "")
        console.log(pwdValue, rpwdValue);
    }
    const onRPwdVerify = (e) => {
        let rpwdValue = e.target.value
        setRPwdValue(rpwdValue)
        setSubmitColor(pwdValue === rpwdValue && pwdValue.length > 5 ? "primary" : "")
        console.log(pwdValue, rpwdValue);
        
    }
    const handleSubmit = () => {
        console.log(rpwdValue);
        if(pwdValue !== rpwdValue){
            alert('Passwords don\'t match')
            return
        }
        if(pwdValue.length < 6){
            alert('Password too short')
            return
        }
        
    }

    return (
        <Box
        component="form"
        sx={{
            '& .MuiTextField-root': { m: 1, width: '25ch' },
        }}
        noValidate
        autoComplete="off"
        >
        <FormControl>
            <Grid item xs={12} spacing={4} margin={5} >
                <Typography variant="body2" component="p" >Change the user password</Typography>
            </Grid>
            <Grid item xs={12} spacing={4} margin={5} >
            <TextField
                id="outlined-password-input"
                label="New Password"
                type="password"
                onChange={onPwdChange}
            />
            </Grid>
            <Grid item xs={12} spacing={4} margin={5} >
            <TextField
                id="outlined-password-input"
                label="Repeat Password"
                type="password"
                onChange={onRPwdVerify}
            />
            </Grid>
            <Grid item xs={12} spacing={4} margin={5} >
            <Button variant="contained" color={submitColor} onClick={handleSubmit}>Submit</Button>
            </Grid>
        </FormControl>
        </Box>
    );
}
