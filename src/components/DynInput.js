import {
  TextInput,
  DateInput,
  NumberInput,
  PasswordInput,
  required,
  BooleanInput,
} from "react-admin";
import { useState, memo, useEffect } from "react";
import Grid from "@material-ui/core/Grid";
import { useConf } from "../Config.js";
import get_Component from "../get_Component";
import DynReferenceInput from "./DynReferenceInput.js";

const DynInput = ({
  renderSwitch,
  setRecords,
  myfocusRef,
  attribute,
  xs,
  currentid,
}) => {
  const [selected_ref, setSelected_ref] = useState(false);
  const conf = useConf();
  useEffect(()=>{
    if(attribute.show_when){
    setRecords(attribute,"" )}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])
  const label = attribute.label || attribute.name;
  const input_props = {
    validate: attribute.required ? required() : false,
    label: label,
  };
  const GridWrap = (props) => (
    <Grid item xs={xs | 4} spacing={4} margin={5}>
      {props.children}
    </Grid>
  );
  const attr_type = attribute.type?.toLowerCase();

  const dynamicRender = (name, value) => {
    setRecords(name, value);
  };

  if (attribute.show_when && !renderSwitch.includes(attribute.name)) {
    return <></>;
  }
  let result = (
    <GridWrap>
      <TextInput
        onChange={(e) => {
          dynamicRender(attribute.name, e.target.value);
        }}
        defaultValue={null}
        source={attribute.name}
        fullWidth
        multiline={attribute.multiline}
        {...input_props}
        autoFocus={attribute.name === myfocusRef}
      />
    </GridWrap>
  );

  if (attribute.component) {
    const Component = get_Component(attribute.component);
    return <Component attr={attribute} mode="edit" />;
  }
  if (attr_type === "date") {
    result = (
      <GridWrap>
        <DateInput
          onChange={(e) => {
            dynamicRender(attribute.name, e.target.value);
          }}
          defaultValue={null}
          source={attribute.name}
          fullWidth
          autoFocus={attribute.name === myfocusRef}
          />
      </GridWrap>
    );
  }
  if (attr_type === "password") {
    result = (
      <GridWrap>
        <PasswordInput
          onChange={(e) => {
            dynamicRender(attribute.name, e.target.value);
          }}
          defaultValue={null}
          source={attribute.name}
          key={attribute.name}
          autoFocus={attribute.name === myfocusRef}
          />
      </GridWrap>
    );
  }
  if (attr_type === "number" || attr_type === "decimal") {
    result = (
      <GridWrap>
        <NumberInput
          onChange={(e) => {
            dynamicRender(attribute.name, e.target.value);
          }}
          defaultValue={null}
          source={attribute.name}
          fullWidth={false}
          {...input_props}
          autoFocus={attribute.name === myfocusRef}
          />
      </GridWrap>
    );
  }
  
  if(attr_type === "boolean") {
    result = (
      <GridWrap>
         <BooleanInput 
            onChange={(e) => {
              dynamicRender(attribute.name, e.target.value);
            }}
            defaultValue={false}
            source={attribute.name}
            {...input_props}
            autoFocus={attribute.name === myfocusRef}
          />
      </GridWrap>
    );
  }
  
  if (
    attribute.relationship?.direction === "toone" &&
    attribute.relationship.target
  ) {
    let optionText = "";
    let optionValue = "id";
    if (
      attribute.relationship.fks?.length !== 1 &&
      attribute.relationship.fks?.includes(attribute.name)
    ) {
      optionText = attribute.name.toLowerCase();
      optionValue = attribute.name.toLowerCase();
    } else {
      const search_cols =
        conf.resources[attribute.relationship.target].search_cols;
      if (!search_cols) {
        console.error("no searchable attributes configured");
      } else if (search_cols.length === 0) {
        console.warn(
          `no searchable attributes configured for ${attribute.relationship.target}`
        );
      } else {
        optionText = search_cols[0].name;
      }
    }
    const ri_props = {};
    if (selected_ref) {
      ri_props["defaultValue"] = selected_ref;
    }
    result = (
      <DynReferenceInput
        source={attribute.name}
        label={`${attribute.relationship.name} (${attribute.name})`}
        reference={attribute.relationship.target}
        resource={attribute.relationship.resource}
        fullWidth
        optionText={optionText}
        optionValue={optionValue}
        cb_set_id={(v) => {
          setSelected_ref(v);
        }}
        allowEmpty={!attribute.required}
        selected={selected_ref}
        currentid={currentid}
        key={attribute.name}
        {...ri_props}
      />
    );
  }

  return result;
};

export default memo(DynInput);
