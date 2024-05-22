/* eslint-disable no-eval */
/* eslint-disable no-throw-literal */
import React, { useRef, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import DynInput from "./DynInput";
import { SimpleForm } from "react-admin";
import { useRedirect, useRefresh, useNotify } from "react-admin";
import Grid from "@material-ui/core/Grid";

const useStyles = makeStyles({
  edit_grid: { width: "100%" },
});

const AttrForm = ({
  attributes,
  ...props
}: {
  attributes: [];
  [key: string]: any;
}) => {
  const [renderSwitch, setRenderSwitch] = useState([]);
  const [isInserting, setIsInserting] = useState(false);
  const recordRef = useRef({});
  const focusRef = useRef("");
  const redirect = useRedirect();
  const notify = useNotify();
  const refresh = useRefresh();

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
    recordRef.current = { ...recordRef.current, [name]: value };
    // eslint-disable-next-line no-unused-vars
    const record = recordRef.current;
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
              refresh();
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

  const classes = useStyles();
  return (
    <SimpleForm {...props}>
      <Grid
        container
        spacing={2}
        className={classes.edit_grid}
        component="div"

        // style={{ margin: "16px" }}
        // style={{ margin: "320px" }}
      >
        {attributes
          .filter((attr: resource) => !attr.relationship && !attr.hidden)
          .map((attr: attributes) => (
            <DynInput
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
      <Grid container spacing={2} className={classes.edit_grid} component="div">
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

export default AttrForm;
