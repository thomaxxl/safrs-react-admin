/* eslint-disable no-eval */
/* eslint-disable no-throw-literal */
import { useRef, useState } from "react";
import {
  Create,
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
import { memo } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useFormContext } from "react-hook-form";

const useStyles = makeStyles({
  edit_grid: { width: "100%" },
  toolbar: { display: "flex", justifyContent: "space-between" },
  save_button_group: { display: "flex" },
});
function DynReferenceCreate({ path, resource_name, currentid, currentParent }) {
  const [renderSwitch, setRenderSwitch] = useState([]);
  const recordRef = useRef({});
  const focusRef = useRef(null);
  const [showDialog, setShowDialog] = useState(false);
  const [, { loading }] = useCreate(resource_name);
  const [, setRefreshId] = useState(1);
  const notify = useNotify();
  const conf = useConf();
  const redirect = useRedirect();
  const refresh = useRefresh();
  const resource = conf.resources[resource_name];
  const attributes = resource?.attributes || [];
  // eslint-disable-next-line no-unused-vars
  const isInserting = true;

  const setRecords = (name, value) => {
    focusRef.current = name;
    recordRef.current = { ...recordRef.current, [name]: value };
    // eslint-disable-next-line no-unused-vars
    const record = recordRef.current;
    const recordsArray = attributes
      .filter(
        (attr) =>
          attr.show_when &&
          (() => {
            try {
              const pattern1 = /record\["[a-zA-Z]+"] (==|!=) "[a-zA-Z]+"/;
              const pattern2 = /isInserting (==|!=) (true|false)/;
              const arr = attr.show_when.split(/&&|\|\|/);
              let index = -1;
              for (let i = 0; i < arr.length; ++i) {
                if (arr[i].match(pattern1)) {
                  index = i;
                }
                if (arr[i].match(pattern1) || arr[i].match(pattern2)) {
                  continue;
                } else {
                  throw "invalid expression";
                }
              }
              if (index === -1) {
                return eval(attr.show_when);
              } else {
                if (
                  attr.resource.attributes.find(
                    (object) => object.name === arr[index].split(/'|"/)[1]
                  )
                ) {
                  return eval(attr.show_when);
                } else {
                  throw "invalid attribute name";
                }
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
    refresh()
  };
  const title = `Create ${resource_name}`;
  const classes = useStyles();
  const onSuccessShow = (data) => {
    notify(`${resource_name} created successfully`);
    redirect(`/${resource_name}/${data.id}/show`);
  };
  const Mytoolbar = (props) => {
    const { reset } = useFormContext();
    return (
      <Toolbar {...props} className={classes.toolbar}>
        <div className={classes.button}>
          <Button
            label="ra.action.cancel"
            onClick={handleCloseClick}
            disabled={loading}
          >
            <IconCancel />
          </Button>
        </div>
        <div className={classes.save_button_group}>
          <SaveButton
            type="button"
            label="save"
            submitOnEnter={true}
            mutationOptions={{
              onSuccess: () => {
                handleCloseClick();
                refresh();
                notify(`${resource_name} created successfully`);
              },
            }}
          />
          <SaveButton
            type="button"
            label="save and add another"
            submitOnEnter={false}
            variant="outlined"
            redirect={false}
            mutationOptions={{
              onSuccess: () => {
                notify(`${resource_name} created successfully`);
                reset();
                setRefreshId(x=>x+1)
              },
            }}
          />
          <SaveButton
            type="button"
            label="save and show"
            mutationOptions={{
              onSuccess: (data) => {
                handleCloseClick();
                onSuccessShow(data);
              },
            }}
            submitOnEnter={false}
            variant="outlined"
          />
        </div>
      </Toolbar>
    );
  };

  const initialValue = () => {
    const attribute = attributes.find(
      (attr) => attr.relationship?.resource === currentParent
    );
    const fks = attribute.relationship.fks;
    if (fks.length === 1) {
      return { [fks[0]]: currentid };
    }
    let id = currentid.split("_");
    let resobj = {};
    for (let i = 0; i < fks.length; i++) {
      resobj[fks[i]] = id[i];
    }
    return resobj;
  };
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
          <Create resource={resource_name}>
            <SimpleForm
              defaultValues={() => initialValue()}
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
                      myfocusRef={focusRef.current}
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
                      myfocusRef={focusRef.current}
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
