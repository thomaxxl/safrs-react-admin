import React from "react";
import { useState, useMemo } from "react";
import { Resource } from "react-admin";
import {Create } from "react-admin";
import { Toolbar, SaveButton } from "react-admin";
import { useConf } from "./Config.js";
import "./style/DynStyle.css";
import { makeStyles } from "@material-ui/core/styles";
import AttrForm from "./components/AttrForm.js";
import gen_DynResourceList from "./components/DynList";
import { gen_DynResourceShow } from "./components/DynInstance";
import get_Component from "./get_Component";
import { gen_DynResourceEdit } from "./components/DynResourceEdit";
//import {ExtComp} from './components/ExtComp';

const useStyles = makeStyles({
  join_attr: { color: "#3f51b5;" },
  delete_icon: { fill: "#3f51b5" },
  edit_grid: { width: "100%" },
  rel_icon: { paddingLeft: "0.4rem", color: "#666", marginBottom: "0px" },
  save_button: { marginLeft: "1%" },
});

export const gen_DynResourceCreate = (resource) => (props) => {
  const classes = useStyles();
  const attributes = resource.attributes;

  if (resource.create) {
    const CreateComp = get_Component(resource.create);
    return <CreateComp resource_name={resource.name} {...props}></CreateComp>;
  }

  const Mytoolbar = (props) => {
    return (
      <Toolbar {...props}>
        <SaveButton
          label="save"
          redirect={props.basePath}
          submitOnEnter={true}
        />
        <SaveButton
          className={classes.save_button}
          label="save and add another"
          redirect={false}
          submitOnEnter={false}
          variant="outlined"
        />
        <SaveButton
          className={classes.save_button}
          label="save and show"
          redirect="show"
          submitOnEnter={false}
          variant="outlined"
        />
      </Toolbar>
    );
  };

  return (
    <Create {...props}>
      <AttrForm attributes={attributes} toolbar={<Mytoolbar />} isInserting={false} />
    </Create>
  );
};

export const DynResource = (props) => {
  const conf = useConf();
  window.addEventListener("storage", () => window.location.reload());
  const [, updateState] = React.useState();
  const [resource_conf, setConf] = useState(conf.resources[props.name]);
  const List = useMemo(
    () => gen_DynResourceList(resource_conf),
    [resource_conf]
  );
  const Create = useMemo(
    () => gen_DynResourceCreate(resource_conf),
    [resource_conf]
  );
  const Edit = useMemo(
    () => gen_DynResourceEdit(resource_conf),
    [resource_conf]
  );
  const Show = useMemo(
    () => gen_DynResourceShow(resource_conf),
    [resource_conf]
  );
  return (
    <Resource
      key={props.name}
      list={List}
      edit={Edit}
      create={Create}
      show={Show}
      options={(() => {
        if (
          resource_conf.label &&
          resource_conf.label !=
            resource_conf.name
        ) {
          return {label:resource_conf.label};
        } return {label:resource_conf.type}
      })()}
      {...props}
    />
  );
};
