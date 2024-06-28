import { Create, SimpleForm, PasswordInput, TextInput } from "react-admin";
import Grid from "@mui/material/Grid";
import { useConf } from "../Config";
import * as React from "react";

export const CreateUser = ({ resource_name, ...props }:{ resource_name:any}) => {
  const conf = useConf();
  let resource;
  if (conf && conf.resources) {
    resource = conf.resources[resource_name];
  }

  return (
    <Create {...props}>
      <SimpleForm>
        <Grid container spacing={3} style={{ width: "40%" }}>
          {resource.attributes.map((attr:any) => (
            <Grid item xs={12} spacing={4}>
              {" "}
              <TextInput source={attr.name} fullWidth />{" "}
            </Grid>
          ))}
          <Grid item xs={12} spacing={4}>
            <PasswordInput
              source="password"
              label="Password"
              defaultValue=""
              fullWidth
              inputProps={{ autocomplete: "current-password" }}
            />
          </Grid>
          <Grid item xs={12} spacing={4}>
            <PasswordInput
              source="Repeat Password"
              label="Repeat Password"
              defaultValue=""
              fullWidth
              inputProps={{ autocomplete: "current-password" }}
            />
          </Grid>
        </Grid>
      </SimpleForm>
    </Create>
  );
};
