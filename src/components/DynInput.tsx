import {
  TextInput,
  DateInput,
  NumberInput,
  PasswordInput,
  required,
  BooleanInput,
  FileInput,
  ImageInput,
  ImageField,
} from "react-admin";
import { useState, memo, useEffect } from "react";
import Grid from "@mui/material/Grid";
import { useConf } from "../Config";
import get_Component from "../get_Component";
import DynReferenceInput from "./DynReferenceInput";
import * as React from "react";
const DynInput = ({
  renderSwitch,
  setRecords,
  myfocusRef,
  attribute,
  xs,
  className = "",
  currentid,
  currentParent,
}: {
  renderSwitch: any;
  setRecords: any;
  myfocusRef: any;
  attribute: any;
  xs: any;
  className?: any;
  currentid: any;
  currentParent: any;
}) => {
  const [selected_ref, setSelected_ref] = useState(false);
  const conf = useConf();
  useEffect(() => {
    if (attribute.show_when) {
      setRecords(attribute, "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dynamicRender = React.useCallback((name: any, value: any) => {
    setRecords(name, value);
  },[]);

  
  const cb_set_id = React.useCallback((evt: any) => {
    setSelected_ref(evt);
    dynamicRender(attribute.name, evt);
  }, [attribute.name, dynamicRender]);

  const label = attribute.label || attribute.name;
  const input_props = {
    validate: attribute.required ? required() : undefined,
    label: label,
  };
  const GridWrap = (props: any) => (
    <Grid sx={className} item xs={xs || 4} spacing={4}>
      {props.children}
    </Grid>
  );
  const attr_type = attribute.type?.toLowerCase();

  const [validationMessage, setValidationMessage] = useState(false);



  const validateUrl = (name: any, value: any) => {
    try {
      new URL(value);
      setValidationMessage(false);
      setRecords(name, value);
    } catch (error) {
      setValidationMessage(true);
      setRecords(name, "");
    }
  };

  if (attribute.show_when && !renderSwitch.includes(attribute.name)) {
    return <></>;
  }
  let result = (
    <GridWrap xs={8}>
      <TextInput
        onChange={(e) => {
          dynamicRender(attribute.name, e.target.value);
        }}
        defaultValue={null}
        source={attribute.name}
        fullWidth
        rows={12}
        multiline={attribute.multiline}
        {...input_props}
        autoFocus={attribute.name === myfocusRef}
      />
    </GridWrap>
  );

  if (attribute.component) {
    const Component: any = get_Component(attribute.component);
    if (Component !== null) {
      return <Component attr={attribute} mode="edit" />;
    }
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

  if (attr_type === "boolean") {
    result = (
      <GridWrap>
        <BooleanInput
          onChange={(e) => {
            dynamicRender(attribute.name, e?.target?.checked);
          }}
          defaultValue={false}
          source={attribute.name}
          {...input_props}
          autoFocus={attribute.name === myfocusRef}
        />
      </GridWrap>
    );
  }

  if (attr_type === "textarea") {
    result = (
      <GridWrap>
        <TextInput
          source={attribute.name}
          multiline
          onChange={(e) => {
            dynamicRender(attribute.name, e.target.value);
          }}
          {...input_props}
          autoFocus={attribute.name === myfocusRef}
          fullWidth
        />
      </GridWrap>
    );
  }

  if ((attr_type)?.toLowerCase() === "image") {
    result = (
      <GridWrap>
        <ImageInput source={attribute.name} label="Image" accept="image/*" onChange={(e)=>{
          dynamicRender(attribute.name, e?.path);
        }}>
          <ImageField source="src" title="title" />
        </ImageInput>
      </GridWrap>
    );
  }

  if (attr_type === "link") {
    result = (
      <GridWrap>
        <TextInput
          onBlur={(e) => {
            validateUrl(attribute.name, e.target.value);
          }}
          defaultValue={null}
          source={attribute.name}
          fullWidth
          rows={12}
          multiline={attribute.multiline}
          validate={attribute.required ? required() : undefined}
          autoFocus={attribute.name === myfocusRef}
          error={validationMessage}
          helperText={false}
        />
        {validationMessage && (
          <div style={{ color: "red", fontSize: "12px" }}>
            Enter a Valid URL
          </div>
        )}
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
      let search_cols;
      if (conf.resources && conf.resources[attribute.relationship.target]) {
        search_cols = conf.resources[attribute.relationship.target].search_cols;
      }
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
    const ri_props: { defaultValue?: any } = {};
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
        cb_set_id={cb_set_id}
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
