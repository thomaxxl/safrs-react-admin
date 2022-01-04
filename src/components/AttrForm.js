import React from "react";
import { makeStyles } from '@material-ui/core/styles';
import DynInput from "./DynInput.js";
import {
    SimpleForm
  } from "react-admin";
  
import Grid from '@material-ui/core/Grid';

const useStyles = makeStyles({
    edit_grid : { width: "100%" }
});

const AttrForm = ({attributes, ...props}) => {
    const classes = useStyles();
    return <SimpleForm {...props}>
                <Grid container spacing={2} margin={2} m={40} className={classes.edit_grid}>
                {attributes.filter(attr => !attr.relationship).map((attr) => <DynInput attribute={attr} key={attr.name}/> )}
                </Grid>
                <Grid container spacing={2} margin={2} m={40} xs={4} className={classes.edit_grid}>
                {attributes.filter(attr => attr.relationship).map((attr) => <DynInput attribute={attr} key={attr.name} xs={8}/> )}
                </Grid>
        </SimpleForm>
}

export default AttrForm