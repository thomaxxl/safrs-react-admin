/* eslint-disable no-eval */
/* eslint-disable no-throw-literal */
import {
  ReferenceInput,
  AutocompleteInput,
  useCreate,
  useNotify,
  Button,
  SaveButton,
  useRedirect,
  useRefresh,
  SimpleForm,
  Toolbar,
  Create,
} from "react-admin";
import { useRef, useState, useCallback, memo } from "react";
import IconContentAdd from "@mui/icons-material/Add";
import IconCancel from "@mui/icons-material/Cancel";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Grid from "@mui/material/Grid";
import { useConf } from "../Config";
import QuickPreviewButton from "./QuickPreviewButton";
import DynInput from "./DynInput";
import * as React from "react";

function QuickCreateButton({
  onChange,
  resource_name,
  cb_set_id,
  basePath,
}: {
  onChange: any;
  resource_name: any;
  cb_set_id: any;
  basePath: any;
}) {
  const [renderSwitch, setRenderSwitch] = useState([]);
  const recordRef = useRef({ data: {} });
  const focusRef = useRef(null);
  const [showDialog, setShowDialog] = useState(false);
  const [create,{isLoading}] = useCreate(
    resource_name,
    { data: recordRef }
  );
  const notify = useNotify();
  const conf = useConf();
  const redirect = useRedirect();
  const refresh = useRefresh();
  const resource = conf?.resources?.[resource_name];
  const attributes = resource?.attributes || [];
  // eslint-disable-next-line no-unused-vars
  const isInserting = true;
  const setRecords = (name: any, value: any) => {
    focusRef.current = name;
    recordRef.current = { data: { ...recordRef.current.data, [name]: value } };
    // eslint-disable-next-line no-unused-vars
    const record = recordRef.current;
    const recordsArray = attributes
      .filter(
        (attr: any) =>
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
                    (object: any) => object.name === arr[index].split(/'|"/)[1]
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
              redirect(basePath);
              refresh();
            }
          })()
      )
      .map((attr: any) => attr.name);
    setRenderSwitch((previousState) => {
      if (recordsArray.length === previousState.length) {
        return previousState;
      }
      return recordsArray;
    });
  };

  const handleClickSave = async (event) => {
    if (typeof recordRef.current.data === 'object' && recordRef.current.data !== null) {
      const problematicKey = {}.toString(); 
      delete recordRef.current.data[problematicKey];
    }
    event.preventDefault();
    try {
      await create(
      resource_name,
        { data: recordRef },
        {
          onSuccess: () => {
            notify("Element created", { type: "info" });
          },
          onError: (error) => {
            console.log("error: ", error);
            notify(`Error: ${error.message}`, { type: "warning" });
          },
        }
      );
    } catch (error) {
      console.log("error: ", error);
      notify(`Error: ${error.message}`, { type: "warning" });
    }
    handleCloseClick();
  };

  const handleClick = () => {
    setShowDialog(true);
  };

  const handleCloseClick = () => {
    setShowDialog(false);
  };

  const title = `Create ${resource.type}`;

  const Mytoolbar = (props: any) => {
    return (
      <Toolbar
        {...props}
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <Button
          label="ra.action.cancel"
          onClick={handleCloseClick}
          disabled={isLoading}
        >
          <IconCancel />
        </Button>

        <SaveButton
          type="button"
          label="save"
          // submitOnEnter={true}
          onClick={handleClickSave}
          mutationOptions={{
            onSuccess: () => {
              handleCloseClick();
              refresh();
            },
          }}
        />
      </Toolbar>
    );
  };

  return (
    <>
      <Button onClick={handleClick} label="ra.action.create">
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
            <SimpleForm toolbar={<Mytoolbar />}>
              <Grid
                container
                spacing={2}
                style={{ margin: "2rem", width: "100%" }}
              >
                {attributes
                  .filter((attr: any) => !attr.relationship)
                  .map((attr: any) => (
                    <DynInput
                      renderSwitch={renderSwitch}
                      setRecords={setRecords}
                      myfocusRef={focusRef.current}
                      attribute={attr}
                      key={attr.name}
                      xs={0}
                      currentid={null}
                      currentParent={""}
                    />
                  ))}
              </Grid>
              <Grid container spacing={2} style={{ width: "100%" }}>
                {attributes
                  .filter((attr: any) => attr.relationship)
                  .map((attr: any) => (
                    <DynInput
                      renderSwitch={renderSwitch}
                      setRecords={setRecords}
                      myfocusRef={focusRef.current}
                      attribute={attr}
                      key={attr.name}
                      xs={8}
                      currentid={null}
                      currentParent={""}
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

const DynReferenceInput = React.memo((props: any) => {
  const [version, setVersion] = useState(0);
  const [selected, setSelected] = useState(props.selected);
  const handleChange = useCallback(
    (event: any) => setVersion(version + 1),
    [version]
  );

  const handleChangeSave = (value: any) => {
    console.log("handleChangeSave", value);
    
    if (value !== selected) {
      setSelected(value);
      props.cb_set_id && props.cb_set_id(value);
    }
  };

  return (
    <>
      <Grid item xs={4} spacing={4}>
        <ReferenceInput key={version} {...props} defaultValue={""}>
          <AutocompleteInput
            defaultValue={null}
            translateChoice={false}
            optionText={props.optionText}
            optionValue={props.optionValue}
            key={props.source}
            source={props.source}
            value={props.selected}
            onChange={(value) => handleChangeSave(value)}
          />
        </ReferenceInput>
      </Grid>
      <Grid item xs={2} spacing={4}>
        <QuickCreateButton
          onChange={handleChange}
          resource_name={props.reference}
          cb_set_id={props.cb_set_id}
          basePath={props.basePath}
        />
        {selected && (
          <QuickPreviewButton
            id={props.selected}
            resource_name={props.reference}
          />
        )}
      </Grid>
    </>
  )
});

export default memo(DynReferenceInput);
