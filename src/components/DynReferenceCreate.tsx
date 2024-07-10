/* eslint-disable no-eval */
/* eslint-disable no-throw-literal */
import { useRef, useState } from "react";
import { Create, SimpleForm, useNotify, useRedirect } from "react-admin";
import Grid from "@mui/material/Grid";
import { Toolbar, useCreate, Button, SaveButton } from "react-admin";
import { useRefresh } from "react-admin";
import { useConf } from "../Config";
import DynInput from "./DynInput";
import IconContentAdd from "@mui/icons-material/Add";
import IconCancel from "@mui/icons-material/Cancel";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import { memo } from "react";
import { useFormContext } from "react-hook-form";
import * as React from "react";
import { useLocation } from "react-router";

function DynReferenceCreate({
  path,
  resource_name,
  currentid,
  currentParent,
}: {
  path: any;
  resource_name: any;
  currentid: any;
  currentParent: any;
}) {
  const location = useLocation();
  const [renderSwitch, setRenderSwitch] = useState([]);
  const recordRef = useRef({ data: {} });
  const focusRef = useRef(null);
  const [showDialog, setShowDialog] = useState(false);
  const [create, { isLoading }] = useCreate(resource_name,
    { data: recordRef });
  const [, setRefreshId] = useState(1);
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
              redirect(path);
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

  const handleClickSaveAndAddAnother = async (event:any) => {
    event.preventDefault();
    try {
      await create(attributes[0].resource.name,
        { data: recordRef },{
        onSuccess: () => {
          notify("Element created");
          redirect(`${location.pathname}`);
        },
        onError: (error) => {
          console.log("error: ", error);
          notify(`Error: ${error.message}`, { type: "warning" });
        },
      });
    } catch (error:any) {
      console.log("error: ", error);
      notify(`Error: ${error.message}`, { type: "warning" });
    }
    handleCloseClick()
  };

  const handleClickSave = async (event) => {
    event.preventDefault();
    try {
      await create(
        attributes[0].resource.name,
        { data: recordRef },
        {
          onSuccess: (data) => {
            console.log("onSuccess data:", data);
            notify("Element created");
            let url = location.pathname.replace(
              "create",
              data.id + "/show"
            );
            redirect(`${url}`);
          },
          onError: (error) => {
            console.log("error: ", error);
            notify(`Error: ${error.message}`, { type: "warning" });
          }
        }
      );
    } catch (error:any) {
      console.log("error: ", error);
      notify(`Error: ${error.message}`, { type: "warning" });
    }
    handleCloseClick()
  };

  const handleClick = () => {
    setShowDialog(true);
  };

  const handleCloseClick = () => {
    setShowDialog(false);
    refresh();
  };
  const title = `Create ${resource_name}`;
  const onSuccessShow = (data: any) => {
    notify(`${resource_name} created successfully`);
    redirect(`/${resource_name}/${data.id}/show`);
  };
  const Mytoolbar = (props: any) => {
    const { reset } = useFormContext();
    return (
      <Toolbar
        {...props}
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <div style={{}}>
          <Button
            label="ra.action.cancel"
            onClick={handleCloseClick}
            disabled={isLoading}
          >
            <IconCancel />
          </Button>
        </div>
        <div style={{ display: "flex" }}>
        <SaveButton
            type="button"
            label="save"
            variant="outlined"
            onClick={handleClickSave}
            mutationOptions={
              {
                onSuccess :() => {
                }
              }
            }
          />
         <SaveButton
              type="button"
              label="save and add another"
              onClick={handleClickSaveAndAddAnother}
              // submitOnEnter={false}
              variant="outlined"
              mutationOptions={{
                onError: (error) => {
                  console.log("error: ", error);
                  notify("Error: Element not created", { type: "error" });
                },
                onSuccess: () => {
                  notify("Element created");
                  reset();
                },
              }}
            />
        </div>
      </Toolbar>
    );
  };

  const initialValue = () => {
    const attribute = attributes.find(
      (attr: any) => attr.relationship?.resource === currentParent
    );
    const fks = attribute.relationship.fks;
    if (fks.length === 1) {
      return { [fks[0]]: currentid };
    }
    let id = currentid.split("_");
    let resobj: Record<string, any> = {};
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
                      currentid={null}
                      xs={0}
                      currentParent={""}
                    />
                  ))}
              </Grid>
              <Grid
                container
                spacing={2}
                style={{ margin: "2rem", width: "100%" }}
              >
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
