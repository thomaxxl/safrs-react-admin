import React, { useState } from "react";
import Grid from '@material-ui/core/Grid';
import { Typography, Button } from '@material-ui/core';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { FormControl } from '@mui/material';
import {useRecordContext, useDataProvider} from "react-admin";
import {httpAuthClient} from "../../rav4-jsonapi-client/ra-jsonapi-client"
import { useConf } from "../../Config";
import { useNotify } from 'react-admin';

export const UserPasswordTab = () => {
    const conf = useConf();
    const notify = useNotify();
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
            notify('Passwords don\'t match',  { type: 'warning' })
            return
        }
        if(pwdValue.length < 6){
            notify('Password too short',  { type: 'warning' })
            return
        }
        const data = {
            "password": pwdValue
        }
        httpAuthClient(`${conf.api_root}/Users/${record.id}/change_password`, {
            method: 'POST',
            body: JSON.stringify(data)
        })
        .then(()=>notify('Password Changed!'))
        .catch(()=>notify(`Error Changing Password`,  { type: 'warning' }))
          
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
                <Typography variant="body2" component="p" ><b>Change the user password</b></Typography>
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


export const ApiUserPasswordTab = () => {
    const conf = useConf();
    const notify = useNotify();
    const record = useRecordContext();
    const dataProvider = useDataProvider();
    const [curPwdValue, setCurPwdValue] = useState("");
    const [newPwdValue, setNewPwdValue] = useState("");
    const [rpwdValue, setRPwdValue] = useState("");
    const [submitColor, setSubmitColor] = useState("")

    const onCurPwdChange = (e) => {
        let pwdValue = e.target.value
        setCurPwdValue(pwdValue)
        setSubmitColor(pwdValue === rpwdValue && pwdValue.length > 5  ? "primary" : "")
    }
    const onNewPwdChange = (e) => {
        let pwdValue = e.target.value
        setNewPwdValue(pwdValue)
        setSubmitColor(pwdValue === rpwdValue && pwdValue.length > 5  ? "primary" : "")
    }
    const onRPwdVerify = (e) => {
        let rpwdValue = e.target.value
        setRPwdValue(rpwdValue)
        setSubmitColor(newPwdValue === rpwdValue && newPwdValue.length > 5 ? "primary" : "")
    }
    const handleSubmit = () => {
        console.log(rpwdValue);
        if(newPwdValue !== rpwdValue){
            notify('Passwords don\'t match',  { type: 'warning' })
            return
        }
        if(newPwdValue.length < 1){
            notify('Password too short',  { type: 'warning' })
            return
        }
        const data = {
            "password": newPwdValue
        }
        httpAuthClient(`${conf.api_root}/Users/${record.id}/change_password`, {
            method: 'POST',
            body: JSON.stringify(data)
        })
        .then(()=>notify('Password Changed!'))
        .catch(()=>notify(`Error Changing Password`,  { type: 'warning' }))
          
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
                <Typography variant="body2" component="p" ><b>Current user password</b></Typography>
            </Grid>
            <Grid item xs={12} spacing={4} margin={5} >
            <TextField
                id="outlined-password-input"
                label="Current Password"
                type="password"
                onChange={onCurPwdChange}
            />
            </Grid>
            <Grid item xs={12} spacing={4} margin={5} >
                <Typography variant="body2" component="p" ><b>New user password</b></Typography>
            </Grid>
            <Grid item xs={12} spacing={4} margin={5} >
            <TextField
                id="outlined-password-input"
                label="New Password"
                type="password"
                onChange={onNewPwdChange}
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
