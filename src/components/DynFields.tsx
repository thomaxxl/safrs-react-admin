// fuck i hate this code :((
import {  useGetOne } from "react-admin";
import { useRecordContext, DateField } from "react-admin";
import Grid from "@mui/material/Grid";
import { Typography } from "@mui/material";
import { useState } from "react";
import Tooltip from "@mui/material/Tooltip";
import DensityMediumIcon from "@mui/icons-material/DensityMedium";
import Button from "@mui/material/Button";
import { useConf } from "../Config";
import JoinModal from "./JoinModal";
import { load_custom_component } from "../util";
import { RelatedInstance } from "./DynInstance";
import loadable from "@loadable/component";
import { InfoPopover } from "../util";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import { Icon } from '@mui/material';
import * as React from "react";
const URL = require("url-parse");

const RelLabel = ({ text }: { text: any }) => {
  // Relationship column header label

  let label = (
    <Tooltip title={text + " Relationship"} placement="top-start" arrow>
      <span style={{ display: "inline-flex" }}>
        {text}
        <DensityMediumIcon
          style={{
            paddingLeft: "0.4rem",
            color: "#666",
            marginBottom: "0px",
            width: "0.7rem",
            height: "0.7rem",
            paddingTop: "0.5rem",
          }}
        />
      </span>
    </Tooltip>
  );
  return label;
};

/*
  Text field that truncates the text to 64 characters, these are used in the list view
*/
const TruncatedTextField = (props: any) => {
  const record = useRecordContext();
  const source = props.source;
  const length = props.length || 128;
  if (!record || !source) {
    return <span>-</span>; // Return "-" when there is no record or source
  }
  let value = record[source];
  if (value && !React.isValidElement(value) && typeof value == "object") {
    try {
      value = JSON.stringify(value);
    } catch (err) {
      console.warn(err);
      value = "Value Error";
    }
  }
  if(typeof value === "number"){
    return <span>{value.toString()}</span>
  }
  if (
    !value ||
    value.length < length ||
    !value.slice ||
    !(value.slice instanceof Function)
  ) {
    if ((props.type)?.toLowerCase() === "image") {
      return (
        <>
          {value ? (
            <img src={`${value}`} style={{ width: "40px", height: "40px" }} />
          ) : (
            ""
          )}
        </>
      );
    }
    return <span>{value && value !== 0 ? value : "-"}</span>; // Return "-" when value is null or undefined
  }

  if ((props.type)?.toLowerCase() === "image") {
    return (
      <>
        {value ? (
          <img src={`${value}`} style={{ width: "40px", height: "40px" }} />
        ) : (
          ""
        )}
      </>
    );
  }
  return <span>{value.slice(0, 128) + "..."}</span>;
};

const NestedJoinedField = ({
  resource_name,
  id,
}: {
  resource_name: any;
  id: any;
}) => {
  // Nested joins no longer have access to the right RecordContext
  // this doesn't work for composite keys :// (because we just pass a single id)
  const conf = useConf();
  const user_key = conf?.resources?.[resource_name]?.user_key || "id";
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
type JoinedFieldProps = {
  attribute: any;
  pvalue: any;
  label: any;
};
const JoinedField: React.FC<JoinedFieldProps> = ({
  attribute,
  pvalue,
}: {
  attribute: any;
  pvalue: any;
}) => {
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
  const id = record && record[fk] != "-" ? record[fk] : null; // "-" is a special value for empty joins
  
  if(!target_resource?.name){
    alert("Invalid DynField join");
    console.warn("Invalid join", attribute, target_resource);
    record = null;
  }
  
  const { data, isLoading } = useGetOne(target_resource?.name, { id: id });

  if (!record) {
    return null;
  }

  if (isLoading) {
    return <span>{id}</span>;
  }

  let item = data || record[rel_name];
  let label = item?.id || id;

  if (!item || item === "-") {
    // no item: if there is data then we're in a nested view and pvalue already holds our id
    // without data this join is empty
    return data ? (
      <NestedJoinedField resource_name={target_resource.name} id={pvalue} />
    ) : item || "-";
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

type ToOneJoinProps = {
  attribute: any;
  label: React.ReactElement; // or the specific type of your label
};

const replaceNullWithDash = (obj: any, visited: any[] = []) => {
  if (obj === null || obj === undefined) {
    return "-";
  }

  if (visited.includes(obj)) {
    return;
  }

  visited.push(obj);

  for (let key in obj) {
    if (obj[key] === null) {
      obj[key] = "-";
    } else if (typeof obj[key] === "object") {
      replaceNullWithDash(obj[key], visited);
    }
  }
};
const ToOneJoin: React.FC<ToOneJoinProps> = ({
  attribute,
}: {
  attribute: any;
}) => {
  const record = useRecordContext();

  replaceNullWithDash(record);
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

export const attr_fields = (attributes: any, mode: any, ...props: any) => {
  if (!(attributes instanceof Array)) {
    console.warn("Invalid attributes", attributes);
    return [];
  }

  const fields = attributes.map((attr) => {
    if (attr.hidden === mode || attr.hidden === true) {
      return null;
    }
    if (attr.relationship?.direction === "toone") {
      const label_text = attr.label || attr.relationship.resource || attr.name;
      return <ToOneJoin attribute={attr} label={label_text} key={attr.name} />;
    }
    return AttrField({ attribute: attr, mode: mode, ...props });
  }); //.filter((attr) => attr?.key) // filter out "null" items, for ex when it's not supposed to show up in this mode

  return fields;
};


const BooleanFieldToString = ({ source, attribute }: { source: string, attribute: any }) => {
  const record = useRecordContext();
  if(!record){
    return null
  }
  const value = record[source] ? "Yes" : "No";
  let text = attribute?.icon ? <Icon sx={{color: "rgb(63, 81, 181)"}}>{attribute.icon}</Icon> : value
  return <span>{text}</span>;
};

const StatusField = ({ source, attribute }: { source: string, attribute: any }) => {
  const record = useRecordContext();
  
  let text = attribute?.icon ? <Icon>{attribute.icon}</Icon> : ""
  return <span>{text}</span>;
};

const OptionField = ({ source, attribute }: { source: string, attribute: any }) => {
  const record = useRecordContext();
  
  let text = record && record[source]
  if(attribute.options){
    text = attribute.options.find((o: any) => o.value === text)?.label
  }
  return <span>{text}</span>;
};


export const LinkField = ({ source, attribute }: { source: string, attribute: any }) => {

  const record = useRecordContext();
  const value = record[source];
  const url = URL(value, {})
  let text = attribute.text ? attribute.text : value
  text =  attribute.icon ? <Icon  sx={{color: "rgb(63, 81, 181)", marginLeft: "0.8em"}}>{attribute.icon}</Icon> : text

  if(!value){
    return <></>
  }
  if(url.protocol === 'http:' || url.protocol === 'https:'){
    return <a href={value} target="_blank" rel="noopener" onClick={e => e.stopPropagation()}>{text}</a>;
  }
  return <span>{text}</span>
}

const AttrField = ({
  attribute,
  mode,
  ...props
}: {
  attribute: any;
  mode: any;
}) => {
  const record = useRecordContext();
  const conf = useConf();
  
  if (attribute.type?.toLowerCase() === "boolean") {
    return <BooleanFieldToString source={attribute.name} attribute={attribute} key={`${attribute.name}_bool`}/>;
  }
  if (attribute.type?.toLowerCase() === "status") {
    return <StatusField source={attribute.name} attribute={attribute} key={`${attribute.name}_status`}/>;
  }
  if (attribute.type?.toLowerCase() === "link") {
    return <LinkField source={attribute.name} attribute={attribute} key={`${attribute.name}_link`}/>;
  }
  
  const component: any = attribute.component;
  const style = attribute.style || {};

  let result = (
    <TruncatedTextField
      source={attribute.name}
      key={attribute.name}
      sortBy={attribute.name}
      label={attribute.label || attribute.name}
      type={attribute.type}
      length={attribute.length}
      {...props}
    />
  );

 
  if (attribute.type?.toLowerCase() === "date") {
    result = (
      <DateField
        source={attribute.name}
        key={attribute.name}
        style={style}
        locales={conf?.settings?.locale}
        {...props}
      />
    );
  }
  if (!component) {
    return result;
  }

  // component is specified => render the specified component
  try {
    const Component: any = loadable(() => import(`./Custom`), {
      resolveComponent: (components: any) => components[component],
    });
    const label_text = attribute.label || attribute.name;
    result = <Component attribute={attribute} mode={mode} label={label_text} record={record} key={`${attribute.name}_comp`}/>;
  } catch (e) {
    alert("Custom component error");
    console.error("Custom component error", e);
  }
  return result;
};

const ShowField = ({
  label,
  value,
  attr,
  mode,
  id,
  type,
  ...props
}: {
  label: any;
  value: any;
  attr: any;
  mode: any;
  id: any;
  type: any;
}) => {
  // Field like it is shown in the instance /show
  const trunc_size = Number(attr.trunc_size) || 1024;
  const [full_text, setFullText] = useState(false);
  type style = {
    [key: string]: string;
  };
  const style: style = {};
  let shown = value;
  let component = attr.component || "p";
  if (value && !React.isValidElement(value) && typeof value == "object") {
    try {
      // console.log(`Converting value :${value}`);
      shown = JSON.stringify(value, null, 2);
      component = "pre";
      style["width"] = "40%";
    } catch (err) {
      // console.log(`Invalid element value :${value}`);
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
    shown = value === true ? "Yes" : value === false ? "No" : value;
  } else {
    shown = (
      <>
        {value.slice(0, trunc_size)}
        <br />
        <Button
          variant="outlined"
          color="primary"
          onClick={() => setFullText(value)}
        >
          More...
        </Button>
      </>
    );
    component = "pre";
  }


  const result = () => {
    if (attr?.type?.toLowerCase() === "link") {
      return <Grid item xs={3}>
              <Typography variant="body2" color="textSecondary" component="p">
                {label}
              </Typography>
              <LinkField source={attr.name} attribute={attr}/>;
              </Grid>
    }

    if (attr?.type?.toLowerCase() === "option") {
      return <Grid item xs={3}>
              <Typography variant="body2" color="textSecondary" component="p">
                {label}
              </Typography>
              <OptionField source={attr.name} attribute={attr}/>
              </Grid>
    }

    if (attr?.type?.toLowerCase() === "code") {
      return <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary" component="p">
                {label}
              </Typography>
              <pre>{value}</pre>
              </Grid>
    }

    if (attr?.type?.toLowerCase() === "textarea") {
      return <Grid item xs={6}>
              <Typography variant="body2" color="textSecondary" component="p">
                {label}
              </Typography>
              {value}
              </Grid>
    }
  
    if (attr?.type?.toLowerCase()  === "boolean") {
      return (
        <Grid item xs={3}>
          <Typography variant="body2" color="textSecondary" component="p">
            {label}
          </Typography>
          {value ? <CheckIcon /> : <ClearIcon />}
        </Grid>
      );
    }

    if (type?.toLowerCase() === "image" && (value?.startsWith('http:/') || value?.startsWith('https:/'))) {
      return (
        <>
          <Grid item xs={3}>
            <Typography variant="body2" color="textSecondary" component="p">
              {label}
            </Typography>
            {value ? (
              <img src={`${value}`} style={{ width: "100%", height: "100%" }} />
            ) : (
              ""
            )}
          </Grid>
        </>
      );
    }

    if (attr?.type?.toLowerCase() === "image") {
      
      if (shown === null || shown.trim() === "") {
        return <></>;
      }
      const arr = (full_text || shown).split("/");
      const index = arr.findIndex((e: any) => e === "http:" || e === "https:");
      let image_url;
      if (index === -1) {
        const raconf = localStorage?.getItem("raconf");
        image_url = `${JSON.parse(raconf ? raconf : "{}").api_root.slice(
          0,
          -4
        )}/ui/images/${full_text || shown}`;
      } else {
        image_url = full_text || shown;
      }
      return (
        <Grid item xs={3}>
          <Typography variant="body2" color="textSecondary" component="p">
            {label}
          </Typography>
          <img src={image_url} alt={""} width="100" height="100" />
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

export const ShowAttrField = ({
  attr,
  value,
  id,
}: {
  attr: any;
  value: any;
  id: any;
}) => {

  const attr_name = attr.name;
  let label: any = (
    <InfoPopover label={attr.label || attr_name} content={attr.info} />
  );
  let field_props: { [key: string]: any } = {
    label: label,
    //value: value,
    attr: attr,
    mode: "show",
    id: id,
  };
  if (attr.relationship) {
    // todo: make the onClick handler open the corresponding tab
    const joinedField = (
      <JoinedField label key={attr.name} attribute={attr} pvalue={value} />
    );
    const rel_label = (
      <span style={{ display: "inline-flex" }}>
        {attr.name} / {label}
        <DensityMediumIcon
          style={{
            paddingLeft: "0.4rem",
            color: "#666",
            marginBottom: "0px",
            width: "0.7rem",
            height: "0.7rem",
            paddingTop: "0.5rem",
          }}
        />
      </span>
    );
    field_props[label] = "rel_label";
    field_props[value] = "jf";
    label = rel_label;
    value =
      value || value === 0 ? (
        <>
          {value} / {joinedField}
        </>
      ) : (
        <></>
      );
  }
  return (
    <ShowField
      {...field_props}
      value={value}
      label={label}
      type={attr.type}
      id={id}
      mode="show"
      attr={attr}
    />
  );
};
