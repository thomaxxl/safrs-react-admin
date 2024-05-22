import Grid from "@material-ui/core/Grid";
import { Typography } from "@material-ui/core";
import { TextField, PasswordInput } from "react-admin";
import * as React from "react";
import { useRecordContext } from "react-admin";
export * from "./external/UserPasswordTab";
export * from "./ApiAdmin";
export * from "./external";

export const SampleColumnField = ({ attribute }: { attribute: any }) => {
  console.log("attribute: ", attribute);
  return (
    <TextField
      source={attribute.name}
      key={attribute.name}
      style={{ color: "red" }}
    />
  );
};

export const EmployeeLabel = (props: any) => {
  const employee = props.instance;
  return (
    <div>
      {" "}
      {employee.attributes?.FirstName} {employee.attributes?.LastName}
    </div>
  );
};

export const CustomerLabel = (props: any) => {
  const customer = props.instance;
  return (
    <div>
      {" "}
      <b>{customer.attributes?.CompanyName}</b>{" "}
      <i>{customer.attributes?.ContactName}</i>
    </div>
  );
};

export const UserPasswordField = (props: any) => {
  if (props.mode === "list") {
    return <span />;
  }
  if (props.mode === "edit") {
    return (
      <>
        <Grid item xs={12} spacing={4}>
          <Typography variant="h6" component="h6">
            Change Password
          </Typography>
        </Grid>
        <Grid item xs={4} spacing={4}>
          <PasswordInput source="_password" />{" "}
        </Grid>
        <Grid item xs={4} spacing={4}>
          <PasswordInput source="_password" />{" "}
        </Grid>
        <Grid item xs={4} spacing={4}></Grid>
      </>
    );
  }
  return <></>;
};

export const CustomTab = (props: any) => {
  // eslint-disable-next-line no-unused-vars
  const record = useRecordContext();
  return <div>Some Text</div>;
};
