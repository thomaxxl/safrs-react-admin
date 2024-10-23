import Grid from "@mui/material/Grid";
import { Typography } from "@mui/material";
import { TextField, PasswordInput } from "react-admin";
import * as React from "react";
import { useRecordContext, useRedirect } from "react-admin";
import { Create, SimpleForm } from 'react-admin';
import { TextInput } from 'react-admin';
import {ApiFabCreate} from './apifab/ApiFabCreate.tsx'
import {ShowApiFab} from './apifab/ApiFabShow.tsx'
import { Box } from '@mui/material';

export * from "./external/UserPasswordTab";
export * from "./apifab/DBCreate.tsx";
export * from "./external";
export * from "./apifab/ApiFabComponents.tsx"
export * from './apifab/ApiFab'
export * from "./custom/InlineUpdate.tsx";


/*
SampleColumnField: demonstrates how to create a custom field component
*/
export const SampleColumnField = ({ attribute, label, mode, ...props }: { attribute: any, label: string, mode: string }) => {
  console.log("attribute: ", attribute);
  console.log("mode: ", mode); // list, show, edit
  console.log("label: ", label);
  console.log("props: ", props);
  if(!attribute){
    return <span style={{ color: "red" }}>
      No attr - {mode}
    </span>
  }
  return <>XX 
    <TextField
      source={attribute?.name}
      key={attribute?.name}
      style={{ color: "green" }}
    /> XX - 
    {mode}

  </>
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


export const CreateLocation = (props) => {
  return <>
  <Create>
    <ApiFabCreate attributes={[]} />
  </Create>
  </>
};

export const Overlay = () => (
  // full-screen overlay
  <>
    <div id="popup-overlay"></div>
  </>
);


export const showApiFab = () => {
  return <ShowApiFab />
}

export const CreateApiFab = () => {
  
  const redirect = useRedirect();
  React.useEffect(() => {
      // edit view
      redirect('/Home')
  }, [])

  return <></>
}

export const DateTime = ({ attribute, mode, ...props}: {attribute: any, mode: string}) => {
  const record = useRecordContext();
  if(!record || !attribute?.name){
    return <></>
  }
  //console.log("DateTime: ", attribute, mode, props);
  const value = record[attribute?.name].split('.')[0];
  return <>{value}</>;
}

const redactConnstr = (connstr: string) => {
  let redacted = null
  if(connstr){
    const groups = connstr.match(/(.*):(.*)@(.*)/)
    redacted = groups ? `${groups[1]}:********@${groups[3]}` : connstr; 
  }
  return <>{redacted}</>;
}

export const ConnectionString = (props: any) => {
  const record = useRecordContext();
  //return <span style={{width: "16em", display: "inline-block", wordWrap: "break-word", wordBreak: "break-all"}}>{redactConnstr(record?.connection_string)}</span>;
  return <span>{redactConnstr(record?.connection_string)}</span>;  
}
