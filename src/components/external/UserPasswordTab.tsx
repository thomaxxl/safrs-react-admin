import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import { Typography, Button } from "@mui/material";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { FormControl } from "@mui/material";
import { useRecordContext, useDataProvider } from "react-admin";
import { httpAuthClient } from "../../rav4-jsonapi-client/ra-jsonapi-client";
import { useConf } from "../../Config";
import { useNotify } from "react-admin";

export const UserPasswordTab = () => {
  const conf = useConf();
  const notify = useNotify();
  const record = useRecordContext();
  const dataProvider = useDataProvider();
  const [pwdValue, setPwdValue] = useState("");
  const [rpwdValue, setRPwdValue] = useState("");
  const [submitColor, setSubmitColor] = useState<
    "default" | "inherit" | "secondary" | "primary" | undefined
  >("secondary");
  const onPwdChange = (e: any) => {
    let pwdValue = e.target.value;
    setPwdValue(pwdValue);
    setSubmitColor(
      pwdValue === rpwdValue && pwdValue.length > 5 ? "primary" : "secondary"
    );
    // console.log(pwdValue, rpwdValue);
  };
  const onRPwdVerify = (e: any) => {
    let rpwdValue = e.target.value;
    setRPwdValue(rpwdValue);
    setSubmitColor(
      pwdValue === rpwdValue && pwdValue.length > 5 ? "primary" : "secondary"
    );
    // console.log(pwdValue, rpwdValue);
  };
  const handleSubmit = () => {
    // console.log(rpwdValue);
    if (pwdValue !== rpwdValue) {
      notify("Passwords don't match", { type: "warning" });
      return;
    }
    if (pwdValue.length < 6) {
      notify("Password too short", { type: "warning" });
      return;
    }
    const data = {
      password: pwdValue,
    };
    httpAuthClient(`${conf.api_root}/Users/${record?.id}/change_password`, {
      method: "POST",
      body: JSON.stringify(data),
    })
      .then(() => notify("Password Changed!"))
      .catch(() => notify(`Error Changing Password`, { type: "warning" }));
  };

  return (
    <Box
      component="form"
      sx={{
        "& .MuiTextField-root": { m: 1, width: "25ch" },
      }}
      noValidate
      autoComplete="off"
    >
      <FormControl>
        <Grid item xs={12} spacing={4}>
          <Typography variant="body2" component="p">
            <b>Change the user password</b>
          </Typography>
        </Grid>
        <Grid item xs={12} spacing={4}>
          <TextField
            id="outlined-password-input"
            label="New Password"
            type="password"
            onChange={onPwdChange}
          />
        </Grid>
        <Grid item xs={12} spacing={4}>
          <TextField
            id="outlined-password-input"
            label="Repeat Password"
            type="password"
            onChange={onRPwdVerify}
          />
        </Grid>
        <Grid item xs={12} spacing={4}>
          <Button
            variant="contained"
            color={submitColor}
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </Grid>
      </FormControl>
    </Box>
  );
};

export const ApiUserPasswordTab = () => {
  const conf = useConf();
  const notify = useNotify();
  const record = useRecordContext();
  const dataProvider = useDataProvider();
  const [curPwdValue, setCurPwdValue] = useState("");
  const [newPwdValue, setNewPwdValue] = useState("");
  const [rpwdValue, setRPwdValue] = useState("");
  const [submitColor, setSubmitColor] = useState<
    "default" | "inherit" | "secondary" | "primary" | undefined
  >("secondary");

  const onCurPwdChange = (e: any) => {
    let pwdValue = e.target.value;
    setCurPwdValue(pwdValue);
    setSubmitColor(
      pwdValue === rpwdValue && pwdValue.length > 5 ? "primary" : "secondary"
    );
  };
  const onNewPwdChange = (e: any) => {
    let pwdValue = e.target.value;
    setNewPwdValue(pwdValue);
    setSubmitColor(
      pwdValue === rpwdValue && pwdValue.length > 5 ? "primary" : "secondary"
    );
  };
  const onRPwdVerify = (e: any) => {
    let rpwdValue = e.target.value;
    setRPwdValue(rpwdValue);
    setSubmitColor(
      newPwdValue === rpwdValue && newPwdValue.length > 5
        ? "primary"
        : "secondary"
    );
  };
  const handleSubmit = () => {
    // console.log(rpwdValue);
    if (newPwdValue !== rpwdValue) {
      notify("Passwords don't match", { type: "warning" });
      return;
    }
    if (newPwdValue.length < 1) {
      notify("Password too short", { type: "warning" });
      return;
    }
    const data = {
      password: newPwdValue,
    };
    httpAuthClient(`${conf.api_root}/Users/${record?.id}/change_password`, {
      method: "POST",
      body: JSON.stringify(data),
    })
      .then(() => notify("Password Changed!"))
      .catch(() => notify(`Error Changing Password`, { type: "warning" }));
  };

  return (
    <Box
      component="form"
      sx={{
        "& .MuiTextField-root": { m: 1, width: "25ch" },
      }}
      noValidate
      autoComplete="off"
    >
      <FormControl>
        <Grid item xs={12} spacing={4} component="div">
          <Typography variant="body2" component="p">
            <b>Current user password</b>
          </Typography>
        </Grid>
        <Grid item xs={12} spacing={4} component="div">
          <TextField
            id="outlined-password-input"
            label="Current Password"
            type="password"
            onChange={onCurPwdChange}
          />
        </Grid>
        <Grid item xs={12} spacing={4} component="div">
          <Typography variant="body2" component="p">
            <b>New user password</b>
          </Typography>
        </Grid>
        <Grid item xs={12} spacing={4} component="div">
          <TextField
            id="outlined-password-input"
            label="New Password"
            type="password"
            onChange={onNewPwdChange}
          />
        </Grid>
        <Grid item xs={12} spacing={4} component="div">
          <TextField
            id="outlined-password-input"
            label="Repeat Password"
            type="password"
            onChange={onRPwdVerify}
          />
        </Grid>
        <Grid item xs={12} spacing={4} component="div">
          <Button
            variant="contained"
            color={submitColor}
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </Grid>
      </FormControl>
    </Box>
  );
};
