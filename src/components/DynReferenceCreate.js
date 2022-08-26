import React, { useState } from "react";
import {
  Create,
  FormWithRedirect,
  SimpleForm,
  useNotify,
  useRedirect,
} from "react-admin";
import Grid from "@material-ui/core/Grid";
import { Toolbar, useCreate, Button, SaveButton } from "react-admin";
import { useRefresh } from "react-admin";
import { useConf } from "../Config.js";
import DynInput from "./DynInput.js";
import IconContentAdd from "@material-ui/icons/Add";
import IconCancel from "@material-ui/icons/Cancel";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import { memo } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Save } from "@mui/icons-material";

const useStyles = makeStyles({
  edit_grid: { width: "100%" },
  save_button1:{marginLeft: "23%"},
  save_button:{marginLeft:"2%"}
});
function DynReferenceCreate({ path, resource_name, currentid, currentParent }) {
  const [renderSwitch, setRenderSwitch] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [create, { loading }] = useCreate(resource_name);
  const [refreshId, setRefreshId] = useState(1);
  const notify = useNotify();
  const conf = useConf();
  const redirect = useRedirect();
  const refresh = useRefresh();
  const resource = conf.resources[resource_name];
  const attributes = resource?.attributes || [];

  const setRecords = (record) => {
    const recordsArray = attributes
      .filter(
        (attr) =>
          attr.show_when &&
          (() => {
            try {
              if (
                attr.resource.attributes.find(
                  (object) => object.name == attr.show_when.split(/'|"/)[1]
                )
              ) {
                return eval(attr.show_when);
              } else {
                throw "invalid attribute name";
              }
            } catch (e) {
              console.log(e);
              notify(
                "Error occurred while evaluating 'show_when' : Invalid Expression",
                { type: "error" }
              );
              redirect(path);
              refresh();
            }
          })()
      )
      .map((attr) => attr.name);
    setRenderSwitch((previousState) => {
      if (recordsArray.length === previousState.length) {
        return previousState;
      }
      return recordsArray;
    });
  };

  const handleClick = () => {
    setShowDialog(true);
  };

  const handleCloseClick = () => {
    setShowDialog(false);
  };
  const title = `Create ${resource_name}`;
  const classes = useStyles();
  const onSuccessShow = (data) => {
    notify(`${resource_name} created successfully`);
    redirect(`/${resource_name}/${data.data.id}/show`);
  };
  const Mytoolbar = (props) => {
    return (
      <Toolbar {...props}>
        <Button
          className={classes.button}
          label="ra.action.cancel"
          onClick={handleCloseClick}
          disabled={loading}
        >
          <IconCancel />
        </Button>

        <SaveButton
          className={classes.save_button1}
          label="save"
          redirect={path}
          submitOnEnter={true}
          onSuccess={() => {
            handleCloseClick();
            refresh();
          }}
        />
        <SaveButton
          className={classes.save_button}
          label="save and add another"
          redirect={false}
          submitOnEnter={false}
          variant="outlined"
          onSuccess={()=>{refresh();notify(`${resource_name} created successfully`)}}
        />
        <SaveButton
          className={classes.save_button}
          label="save and show"
          redirect={false}
          onSuccess={onSuccessShow}
          submitOnEnter={false}
          variant="outlined"
        />
      </Toolbar>
    );
  };

  const initialValue = () => {
    const attribute = attributes.find((attr) => attr.relationship?.resource == currentParent)
    const fks = attribute.relationship.fks
    if(fks.length == 1){
      return {[fks[0]]:currentid}
    }
    let id = currentid.split('_')
    let resobj = {};
    for (let i = 0; i < fks.length; i++) {
      resobj[fks[i]] = id[i]
    }
    return resobj
  }
  return (
    <>
      <Button onClick={handleClick} label={`Add New ${resource_name}`}>
        <IconContentAdd />
      </Button>
      <Dialog
        fullWidth
        maxWidth="md"
        open={showDialog}
        onClose={handleCloseClick}
        aria-label={title}
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Create basePath={path} resource={resource_name}>
            <SimpleForm
              initialValues={initialValue()}
              toolbar={<Mytoolbar />}
            >
              <Grid
                container
                spacing={2}
                margin={2}
                m={40}
                className={classes.edit_grid}
              >
                {attributes
                  .filter((attr) => !attr.relationship)
                  .map((attr) => (
                    <DynInput
                      renderSwitch={renderSwitch}
                      setRecords={setRecords}
                      attribute={attr}
                      key={attr.name}
                    />
                  ))}
              </Grid>
              <Grid
                container
                spacing={2}
                margin={2}
                m={40}
                className={classes.edit_grid}
              >
                {attributes
                  .filter((attr) => attr.relationship)
                  .map((attr) => (
                    <DynInput
                      renderSwitch={renderSwitch}
                      setRecords={setRecords}
                      attribute={attr}
                      key={attr.name}
                      xs={8}
                      currentid={currentid}
                      currentParent={currentParent}
                    />
                  ))}
              </Grid>
            </SimpleForm>
          </Create>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default memo(DynReferenceCreate);
