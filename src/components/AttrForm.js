import React, { useState } from "react";
import { makeStyles } from '@material-ui/core/styles';
import DynInput from "./DynInput.js";
import {
  SimpleForm
} from "react-admin";
import { useRedirect, useRefresh, useNotify } from 'react-admin';
import Grid from '@material-ui/core/Grid';

const useStyles = makeStyles({
  edit_grid: { width: "100%" }
});

const AttrForm = ({ attributes, ...props }) => {
  const [renderSwitch, setRenderSwitch] = useState([])
  const redirect = useRedirect();
  const refresh = useRefresh();
  const notify = useNotify();
  const setRecords = (record) => {
    const recordsArray = attributes.filter(attr => attr.show_when && (() => {
      try { return (eval(attr.show_when)) } catch (e) {
          console.log(e)
          notify('Error occurred while evaluating \'show_when\' : Invalid Expression',  { type: 'error' })
          redirect(props.basePath)
          refresh()
      }
  })()).map((attr) => attr.name)
    setRenderSwitch(previousState => {
      if (recordsArray.length === previousState.length) {
        return previousState
      } return recordsArray
    })
  }


  const classes = useStyles();
  return <SimpleForm {...props}>
    <Grid container spacing={2} margin={2} m={40} className={classes.edit_grid}>
      {attributes.filter(attr => !attr.relationship && !attr.hidden).map((attr) => <DynInput renderSwitch={renderSwitch} setRecords={setRecords} attribute={attr} key={attr.name} xs={4} />)}
    </Grid>
    <Grid container spacing={2} margin={2} m={40} className={classes.edit_grid}>
      {
        attributes.filter(attr => attr.relationship && !attr.hidden)
          .map((attr, i) => <React.Fragment key={i}>
            <DynInput renderSwitch={renderSwitch} setRecords={setRecords} attribute={attr} xs={5} /><Grid item xs={6} />
          </React.Fragment>)
      }
    </Grid>
  </SimpleForm>
}

export default AttrForm