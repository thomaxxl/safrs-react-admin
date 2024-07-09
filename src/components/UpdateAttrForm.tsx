/* eslint-disable no-eval */
/* eslint-disable no-throw-literal */
import React, { useEffect, useRef, useState } from "react";
import DynInput from "./DynInput";
import {
  DeleteButton,
  SaveButton,
  SimpleForm,
  Toolbar,
  useDelete,
  useRecordContext,
  useUpdate,
} from "react-admin";
import { useRedirect, useNotify } from "react-admin";
import Grid from "@mui/material/Grid";
import { useLocation } from "react-router";

const textClass = {
  "& textarea": {
    height: "100px !important",
  },
};

const UpdateAttrForm = ({
  attributes,
  ...props
}: {
  attributes: [];
  [key: string]: any;
}) => {
  const record = useRecordContext();
  console.log('record: ', record);
  attributes = attributes.filter((attribute) => attribute.hide_list !== "true");
  const recordRef = useRef({ data: {}, id: {},previousData:{} });
  const prevDataRef = useRef();
  const [, setData] = useState(recordRef.current.data);
  const [renderSwitch, setRenderSwitch] = useState([]);
  const id = window.location.href.split("/").pop();
  recordRef.current.id = id;

  const [update, {data, error, isPending }] = useUpdate(
    attributes[0].resource.name,
    recordRef.current,{
      onSuccess: (data) => {
        console.log('onSuccess data:', data);
      },
    }
  );

  const [deleteOne ] = useDelete(
    attributes[0].resource.name,
    recordRef.current
  );

  useEffect(() => {
    recordRef.current.id = id;
    if (!recordRef.current || Object.keys(recordRef.current).length === 0) {
      console.error('useUpdate mutation requires a non-empty data object');
    }
  }, [id]);
  
  const focusRef = useRef("");
  const redirect = useRedirect();
  const notify = useNotify();
  // const refresh = useRefresh();
  // console.log('refresh: ', refresh);

  useEffect(() => {
    prevDataRef.current = data;
  }, [data]);



  const CustomToolbar =  (props: any) => {
    const location = useLocation();

    const handleClickDelete = async (event) => {
      event.preventDefault();
      setData(recordRef.current.data);
      recordRef.current.previousData = record
      console.log("Updated recordRef before update:", recordRef.current);
      try {
         await deleteOne(attributes[0].resource.name, {
          id: recordRef.current.id,
          data: recordRef.current.data,
          previousData: recordRef.current.previousData,
        },{
          onSuccess: (data) => {
            console.log('onSuccess data:', data);
            notify("Element deleted");
            let url = window.location.href.split("/").pop()
            redirect(`${url}`);
          },
          onFailure: (error) => {
            console.log('error: ', error);
            notify(`Error: ${error.message}`, { type: "warning"});
          },
          onError: (error) => {
            console.log('error: ', error);
            notify(`Error: ${error.message}`, { type: "warning"});
          }
        });
      } catch (error) {
        console.log('error: ', error);
      }
    }

    const handleClick = async (event) => {
      event.preventDefault();
      setData(recordRef.current.data);
      recordRef.current.previousData = record
      console.log("Updated recordRef before update:", recordRef.current);
      try {
        await update(
          attributes[0].resource.name, 
          {
            id: recordRef.current.id,
            data: recordRef.current.data,
            previousData: recordRef.current.previousData,
          },
          {
            onSuccess: (data) => {
              console.log('onSuccess data:', data);
              notify("Element updated");
              let url = window.location.href;
              url = url + "/show";
              redirect(`${url}`);
            },
            onFailure: (error) => {
              console.log('error: ', error);
              notify(`Error: ${error.message}`, { type: "warning" });
            }
          }
        );
      } catch (error) {
        console.log('error: ', error);
        notify(`Error: ${error.message}`, { type: "warning" });
      }
    };

    return (
      <Toolbar {...props}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <SaveButton
            type="button"
            label="Save"
            variant="outlined"
            onClick={handleClick}
            mutationOptions={{
              onSuccess: (data) => {
                console.log('onSuccess data:', data);
                notify("Element updated");
                const redirect_loc =
                  location.pathname.replace("create", "") + "/show";
                console.log("redirect to", redirect_loc);
                redirect(redirect_loc);
              },
              onError: (error) => {
                console.log("error: ", error);
                notify("Error occurred while updating", { type: "error" });
              },

            }}
            disabled={isPending}
          />

          <DeleteButton
          onClick={handleClickDelete}
          mutationOptions={{
            onSuccess: (data) => {
              console.log('onSuccess data:', data);
              notify("Element updated");
              const redirect_loc =
                location.pathname.replace("create", "") + "/show";
              console.log("redirect to", redirect_loc);
              redirect(redirect_loc);
            },
            onError: (error) => {
              console.log("error: ", error);
            },
          }}
          disabled={isPending}
          />
        </div>
      </Toolbar>
    );
  };

  interface resource {
    relationship: [];
    hidden: boolean;
  }

  interface attributes {
    name: string;
  }
  // eslint-disable-next-line no-unused-vars
  const setRecords = (name: string, value: string) => {
    focusRef.current = name;
    recordRef.current.data = { ...recordRef.current.data, [name]: value };
    console.log("Updated recordRef:", recordRef.current);
    const record = recordRef.current.data;
    // eslint-disable-next-line no-unused-vars
    // const record = recordRef.current;
    const recordsArray = attributes
      .filter(
        (attr: any) =>
          attr?.show_when &&
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
              redirect(props?.basePath);
              // refresh();
            }
          })()
      )
      .map((attr: attributes) => attr.name);
    setRenderSwitch((previousState: any) => {
      if (recordsArray.length === previousState.length) {
        return previousState;
      }
      return recordsArray;
    });
  };

  return (
    <SimpleForm {...props} toolbar={<CustomToolbar />}>
      <Grid container spacing={2} sx={{ width: "100%" }} component="div">
        {attributes
          .filter((attr: resource) => !attr.relationship && !attr.hidden)
          .map((attr: any) => (
            <DynInput
              className={attr.type === "textarea" ? textClass : ""}
              renderSwitch={renderSwitch}
              setRecords={setRecords}
              myfocusRef={focusRef.current}
              attribute={attr}
              key={attr.name}
              xs={4}
              currentid={null}
              currentParent
            />
          ))}
      </Grid>
      <Grid container spacing={2} style={{ width: "100%" }} component="div">
        {attributes
          .filter((attr: resource) => attr.relationship && !attr.hidden)
          .map((attr: attributes, i: number) => (
            <React.Fragment key={i}>
              <DynInput
                renderSwitch={renderSwitch}
                setRecords={setRecords}
                myfocusRef={focusRef.current}
                attribute={attr}
                xs={5}
                currentid={null} // Add the currentid property here
                currentParent
              />
              <Grid item xs={6} />
            </React.Fragment>
          ))}
      </Grid>
    </SimpleForm>
  );
};

export default UpdateAttrForm;
