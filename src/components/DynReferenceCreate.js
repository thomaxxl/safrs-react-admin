import { useState } from "react";
import { FormWithRedirect, useNotify, useRedirect } from "react-admin";
import Grid from "@material-ui/core/Grid";
import { useCreate, Button, SaveButton } from "react-admin";
import { useRefresh } from "react-admin";
import { useConf } from "../Config.js";
import DynInput from "./DynInput.js";
import IconContentAdd from "@material-ui/icons/Add";
import IconCancel from "@material-ui/icons/Cancel";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import { useHistory } from "react-router-dom";
import { memo } from "react";


 function DynReferenceCreate({ resource_name, basePath}) {
  const [renderSwitch, setRenderSwitch] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [create, { loading }] = useCreate(resource_name);
  const notify = useNotify();
  const conf = useConf();
  const redirect = useRedirect();
  const refresh = useRefresh();
  const history = useHistory();
  const resource = conf.resources[resource_name];
  const attributes = resource?.attributes || [];

  const setRecords = (record) => {
    const recordsArray = attributes
      .filter(
        (attr) =>
          attr.show_when &&
          (() => {
            try {
              return eval(attr.show_when);
            } catch (e) {
              console.log(e);
              notify(
                "Error occurred while evaluating 'show_when' : Invalid Expression",
                { type: "error" }
              );
              redirect(basePath);
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

  const handleSubmit = async (values) => {
    create(
      { payload: { data: values } },
      {
        onSuccess: () => {
          setShowDialog(false);
          notify(`Changes Saved`);
          history.goBack();
          refresh();
        },
        onFailure: ({ error }) => {
          notify(error.message, "error");
        },
      }
    );
  };
  const title = `Create ${resource_name}`;
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

        <FormWithRedirect
          resource={resource_name}
          save={handleSubmit}
          render={({ handleSubmitWithRedirect, pristine, saving }) => (
            <>
              <DialogContent>
                <Grid container spacing={2} margin={2} m={40}>
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
                <Grid container spacing={2} margin={2} m={40} xs={4}>
                  {attributes
                    .filter((attr) => attr.relationship)
                    .map((attr) => (
                      <DynInput
                        renderSwitch={renderSwitch}
                        setRecords={setRecords}
                        attribute={attr}
                        key={attr.name}
                        xs={8}
                      />
                    ))}
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button
                  label="ra.action.cancel"
                  onClick={handleCloseClick}
                  disabled={loading}
                >
                  <IconCancel />
                </Button>
                <SaveButton
                  handleSubmitWithRedirect={handleSubmitWithRedirect}
                  pristine={pristine}
                  saving={saving}
                  disabled={loading}
                />
              </DialogActions>
            </>
          )}
        />
      </Dialog>
    </>
  );

}

export default memo(DynReferenceCreate);
