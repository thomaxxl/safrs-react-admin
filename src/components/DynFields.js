import React from "react";
import { ImageField, useGetOne } from "react-admin";
import { useRecordContext, DateField } from "react-admin";
import Grid from "@material-ui/core/Grid";
import { Typography } from "@material-ui/core";
import { useState } from "react";
import Tooltip from "@mui/material/Tooltip";
import { makeStyles } from "@material-ui/core/styles";
import DensityMediumIcon from "@mui/icons-material/DensityMedium";
import Button from "@material-ui/core/Button";
import { useConf } from "../Config";
import JoinModal from "./JoinModal";
import { load_custom_component } from "../util";
import { RelatedInstance } from "./DynInstance";
import loadable from "@loadable/component";
import { InfoPopover } from "../util";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";

const useStyles = makeStyles({
  join_attr: { color: "#3f51b5;" },
  delete_icon: { fill: "#3f51b5" },
  edit_grid: { width: "100%" },
  rel_icon: { paddingLeft: "0.4rem", color: "#666", marginBottom: "0px" },
  joined_field: { border: "2px solid red", cursor: "pointer" },
});

const RelLabel = ({ text }) => {
  // Relationship column header label
  const classes = useStyles();

  let label = (
    <Tooltip title={text + " Relationship"} placement="top-start" arrow>
      <span style={{ display: "inline-flex" }}>
        {text}
        <DensityMediumIcon
          className={classes.rel_icon}
          style={{ width: "0.7rem", height: "0.7rem", paddingTop: "0.5rem" }}
        />
      </span>
    </Tooltip>
  );
  return label;
};

const TruncatedTextField = (props) => {
  const record = useRecordContext();
  const source = props.source;
  if (!record || !source) {
    return <span></span>;
  }
  let value = record[source];
  if (value && !React.isValidElement(value) && typeof value == "object") {
    try {
      console.log(`Converting value :${value}`);
      value = JSON.stringify(value);
    } catch (err) {
      console.log(`Invalid element value :${value}`);
      console.warn(err);
      value = "Value Error";
    }
  }
  if (
    !value ||
    value.length < 128 ||
    !value.slice ||
    !(value.slice instanceof Function)
  ) {
    return <span>{value}</span>;
  }
  return <span>{value.slice(0, 128) + "..."}</span>;
};

const NestedJoinedField = ({ resource_name, id }) => {
  // Nested foins no longer have access to the right RecordContext
  // this doesn't work for composite keys :// (because we just pass a single id)
  const conf = useConf();
  const user_key = conf.resources[resource_name]?.user_key || "id";
  const { data } = useGetOne(resource_name, { id: id });
  const modal_content = (
    <RelatedInstance instance={data} resource_name={resource_name} />
  );
  return (
    <JoinModal
      label={data && data[user_key]}
      content={modal_content}
      resource_name={resource_name}
    />
  );
};

const JoinedField = ({ attribute, pvalue }) => {
  const record = useRecordContext();
  const join = attribute.relationship;
  if (record?.attributes) {
    Object.assign(record, record.attributes);
  }
  const rel_name = join.name;
  const target_resource = join.target_resource;
  const user_key = target_resource?.user_key;
  const user_component = target_resource?.user_component;
  const fk = join.fks.join("_");
  const id = record ? record[fk] : null;
  const { data, isLoading } = useGetOne(target_resource.name, { id: id });

  if (!record) {
    return null;
  }

  if (isLoading) {
    return <span>{id}</span>;
  }

  let item = data || record[rel_name];
  let label = item?.id || id;

  if (!item) {
    // no item: if there is data then we're in a nested view and pvalue already holds our id
    // without data this join is empty
    return data ? (
      <NestedJoinedField resource_name={target_resource.name} id={pvalue} />
    ) : null;
  }
  if (user_component) {
    // user_component: custom component
    label = load_custom_component(user_component, item);
  } else if (item.attributes && user_key) {
    label = <span>{item.attributes[user_key] || item.id}</span>;
  } else if (user_key in item) {
    label = item[user_key];
    item.type = target_resource?.type;
    item.attributes = item;
  }
  if (!label) {
    label = "NNN";
  }
  const modal_content = (
    <RelatedInstance instance={item} resource_name={target_resource.name} />
  );
  return (
    <JoinModal
      label={label}
      key={attribute.name}
      content={modal_content}
      resource_name={target_resource.name}
    />
  );
};

const ToOneJoin = ({ attribute }) => {
  const record = useRecordContext();
  const label_text =
    attribute.label || attribute.relationship.resource || attribute.name;
  const label = <RelLabel text={label_text} />;
  return (
    <JoinedField
      key={attribute.name}
      attribute={attribute}
      label={label}
      pvalue={record?.id}
    />
  );
};

export const attr_fields = (attributes, mode, ...props) => {
  if (!(attributes instanceof Array)) {
    console.warn("Invalid attributes", attributes);
    return [];
  }

  const fields = attributes.map((attr) => {
    if (attr.hidden === mode || attr.hidden === true) {
      //return null;
    }
    if (attr.relationship?.direction === "toone") {
      const label_text = attr.label || attr.relationship.resource || attr.name;
      return <ToOneJoin attribute={attr} label={label_text} key={attr.name} />;
    }
    return AttrField({ attribute: attr, mode: mode, ...props });
  }); //.filter((attr) => attr?.key) // filter out "null" items, for ex when it's not supposed to show up in this mode

  return fields;
};

const AttrField = ({ attribute, mode, ...props }) => {
  /* Attribute fields
        Return a component that will be filled in depending on the record context
    */
  const component = attribute.component; // component name to be loaded
  const style = attribute.style || {};
  /*if(attribute.hidden === mode || attribute.hidden === true){
        return null
    }*/

  const conf = useConf();
  let result = (
    <TruncatedTextField
      source={attribute.name}
      key={attribute.name}
      sortBy={attribute.name}
      label={attribute.label || attribute.name}
      {...props}
    />
  );

  if (attribute.type?.toLowerCase() === "date") {
    result = (
      <DateField
        source={attribute.name}
        key={attribute.name}
        style={style}
        locales={conf.settings.locale}
        {...props}
      />
    );
  }
  if (!component) {
    return result;
  }

  // component is specified => render the specified component
  try {
    const Component = loadable(() => import(`./Custom.js`), {
      resolveComponent: (components) => components[component],
    });
    const label_text = attribute.label || attribute.name;
    result = <Component attribute={attribute} mode={mode} label={label_text} />;
  } catch (e) {
    alert("Custom component error");
    console.error("Custom component error", e);
  }
  return result;
};

const ShowField = ({ label, value, attr, mode, id, ...props }) => {
  // Field like it is shown in the instance /show
  console.log(id)
  const trunc_size = Number(attr.trunc_size) || 1024;
  const [full_text, setFullText] = useState(false);
  const style = {};
  let shown = value;
  let component = attr.component || "p";
  if (value && !React.isValidElement(value) && typeof value == "object") {
    try {
      console.log(`Converting value :${value}`);
      shown = JSON.stringify(value, null, 2);
      component = "pre";
      style["width"] = "40%";
    } catch (err) {
      console.log(`Invalid element value :${value}`);
      console.warn(err);
      shown = <i>Value Error</i>;
    }
  }

  if (
    !value ||
    value.length < trunc_size ||
    !value.slice ||
    !(value.slice instanceof Function)
  ) {
  } else {
    shown = (
      <>
        {value.slice(0, trunc_size)}
        <br />
        <Button outlined color="primary" onClick={() => setFullText(value)}>
          More...
        </Button>
      </>
    );
    component = "pre";
  }
  const result = () => {
    if (attr?.type === "Boolean") {
      return (
        <Grid item xs={3}>
          <Typography variant="body2" color="textSecondary" component="p">
            {label}
          </Typography>
          {shown ? <CheckIcon /> : <ClearIcon />}
        </Grid>
      );
    }

    if (attr?.type=== "Image") {
      console.log(shown)
      if(shown === null || shown.trim() === "" ){
        return <></>
      }
      const arr = (full_text || shown).split("/");
      const index = arr.findIndex((e) => (e === "http:" || e === "https:"));
      let image_url;
      if (index === -1) {  
        image_url = `${(JSON.parse(localStorage.getItem("raconf")).api_root).slice(0, -4)}/ui/images/${full_text || shown}`
      } else {
        image_url = full_text||shown;
      }
      return (
        <Grid item xs={3}>
          <Typography variant="body2" color="textSecondary" component="p">
            {label}
          </Typography>
          <img
            src={image_url}
            alt={""}
            width="100"
            height="100"
          />
        </Grid>
      );
    }
    return (
      <Grid item xs={3}>
        <Typography variant="body2" color="textSecondary" component="p">
          {label}
        </Typography>
        <Typography variant="body2" component={component} style={style}>
          {full_text || shown}
        </Typography>
      </Grid>
    );
  };

  return <>{result()}</>;
};

export const ShowAttrField = ({ attr, value, id}) => {
  const attr_name = attr.name;
  const classes = useStyles();
  let label = (
    <InfoPopover label={attr.label || attr_name} content={attr.info} />
  );
  let field_props = {
    //label : label,
    //value: value,
    attr: attr,
    mode: "show",
  };
  if (attr.relationship) {
    // todo: make the onClick handler open the corresponding tab
    const jf = <JoinedField key={attr.name} attribute={attr} pvalue={value} />;
    const rel_label = (
      <span style={{ display: "inline-flex" }}>
        {attr.name} / {label}
        <DensityMediumIcon
          className={classes.rel_icon}
          style={{ width: "0.7rem", height: "0.7rem", paddingTop: "0.3rem" }}
        />
      </span>
    );
    field_props[label] = "rel_label";
    field_props[value] = "jf";
    label = rel_label;
    value =
      value || value === 0 ? (
        <>
          {value} / {jf}
        </>
      ) : (
        <></>
      );
  }
  return <ShowField {...field_props} value={value} label={label} id={id} />;
};
