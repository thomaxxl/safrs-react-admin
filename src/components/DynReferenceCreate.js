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
import { memo } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Save } from "@mui/icons-material";

const useStyles = makeStyles({
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  button: { float: "left" },
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

  const handleSubmit = async (values) => {
    create(
      { payload: { data: values } },
      {
        onSuccess: () => {
          setShowDialog(false);
          notify(`Changes Saved`);
          refresh();
        },
        onFailure: ({ error }) => {
          notify(error.message, "error");
        },
      }
    );
  };
  const handleSubmitAndShow = async (values) => {
    create(
      { payload: { data: values } },
      {
        onSuccess: (data) => {
          setShowDialog(false);
          notify(`Changes Saved`);
          redirect(`/${resource_name}/${data.data.id}/show`);
        },
        onFailure: ({ error }) => {
          notify(error.message, "error");
        },
      }
    );
  };
  const handleSubmitAndAdd = async (values) => {
    create(
      { payload: { data: values } },
      {
        onSuccess: () => {
          notify(`Changes Saved`);
          setRefreshId((previousId) => previousId + 1);
        },
        onFailure: ({ error }) => {
          notify(error.message, "error");
        },
      }
    );
  };
  const title = `Create ${resource_name}`;
  const classes = useStyles();
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
          key={refreshId}
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
                <Grid container spacing={2} margin={2} m={40}>
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
              </DialogContent>
              <DialogActions className={classes.container}>
                <div style={{ width: "50%" }}>
                  <Button
                    className={classes.button}
                    label="ra.action.cancel"
                    onClick={handleCloseClick}
                    disabled={loading}
                  >
                    <IconCancel />
                  </Button>
                </div>
                <div
                  style={{
                    width: "65%",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <SaveButton
                    handleSubmitWithRedirect={handleSubmitWithRedirect}
                    pristine={pristine}
                    saving={saving}
                    disabled={loading}
                  />
                  <SaveButton
                    label="save and add another"
                    variant="outlined"
                    handleSubmitWithRedirect={handleSubmitWithRedirect}
                    onSave={handleSubmitAndAdd}
                    pristine={pristine}
                    saving={saving}
                    disabled={loading}
                    redirect={false}
                  >
                    <Save />
                  </SaveButton>
                  <SaveButton
                    label="save and show"
                    handleSubmitWithRedirect={handleSubmitWithRedirect}
                    onSave={handleSubmitAndShow}
                    variant="outlined"
                    pristine={pristine}
                    saving={saving}
                    disabled={loading}
                  >
                    <Save />
                  </SaveButton>
                </div>
              </DialogActions>
            </>
          )}
        />
      </Dialog>
    </>
  );
}

export default memo(DynReferenceCreate);
