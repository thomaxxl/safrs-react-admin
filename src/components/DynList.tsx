import {
  Datagrid,
  EditButton,
  ShowButton,
  List,
  TextInput,
  useDataProvider,
  useRefresh,
  useRecordContext,
  Confirm,
  FunctionField,
} from "react-admin";
import Button from "@material-ui/core/Button";
import { useState } from "react";
import { attr_fields } from "./DynFields";
import { DynPagination, ExtraComponentProps } from "../util";
import { makeStyles } from "@material-ui/core/styles";
import DeleteIcon from "@material-ui/icons/Delete";
import { DetailPanel } from "./DynInstance";
import {
  FilterButton,
  TopToolbar,
  CreateButton,
  ExportButton,
} from "react-admin";
import InfoModal from "./InfoModal";
import get_Component from "../get_Component";
import { useInfoToggle } from "../InfoToggleContext";
import { Typography } from "@mui/material";
import * as React from "react";

const useStyles = makeStyles({
  icon: { color: "#ccc", "&:hover": { color: "#3f51b5" } },
  delete_icon: { color: "#3f51b5" },
});

const searchFilters = [<TextInput source="q" label="Search" alwaysOn />];

const deleteField = (
  dataProvider: any,
  resource: any,
  record: any,
  refresh: any
) => {
  /*
        resource: name of the resource
    */
  dataProvider
    .delete(resource.type, record)
    .then(() => refresh())
    .catch((e: any) => alert("error"));
};

const DeleteButton = (props: any) => {
  const [open, setOpen] = useState(false);
  const dataProvider = useDataProvider();
  const refresh = useRefresh();
  const record = useRecordContext();
  const classes = useStyles();

  return (
    <span>
      <FunctionField
        title="Delete"
        onClick={(e: any) => {
          setOpen(true);
          e.stopPropagation();
        }}
        key={`${props.resource.name}_delete`}
        render={(record: any) => (
          <Button>
            <DeleteIcon className={classes.delete_icon} />
          </Button>
        )}
        {...props}
      />
      <Confirm
        isOpen={open}
        title={`Delete "${props.resource}, id ${record.id}"`}
        content={`Are you sure you want to delete this record?`}
        onConfirm={() => {
          deleteField(dataProvider, props.resource, record, refresh);
          setOpen(false);
        }}
        onClose={() => {
          setOpen(false);
        }}
      />
    </span>
  );
};

const ShowInfoContent = (props: any) => {
  const [infoToggle] = useInfoToggle();
  const content = props.resource[`info_list`];
  return (
    <>
      {infoToggle ? (
        <div>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            <div
              id="info_content"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </Typography>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

const ListActions = ({ resource }: { resource: any }) => {
  return (
    <TopToolbar>
      <FilterButton />
      <InfoModal resource={resource} mode="list" />
      <CreateButton label="ra.action.create" />
      <ExportButton label="ra.action.export" />
    </TopToolbar>
  );
};

const gen_DynResourceList = (resource_conf: any) => (props: any) => {
  const ButtonField = (props: any) => {
    let filtered_props: { [key: string]: any } = {};
    for (let [k, v] of Object.entries(props)) {
      //filtered_props[k] = v
      // filter "hasCreate" etc, this causes console warnings
      //if(! k.startsWith('has') && ! k == "syncWithLocation"){
      if (!k.startsWith("has")) {
        filtered_props[k] = v;
      }
    }
    const buttons = (
      <span>
        {resource_conf.edit !== false ? (
          <EditButton
            title="Edit"
            key={`${resource_conf.name}_edit`}
            label={""}
          />
        ) : null}
        {resource_conf.delete !== false ? (
          <DeleteButton {...filtered_props} />
        ) : null}
        <ShowButton title="Show" label="" />
      </span>
    );
    return buttons;
  };

  const ListTitle = (props: any) => <>{resource_conf.name} List</>;
  const attributes = resource_conf.attributes;
  const fields = attr_fields(attributes, "list");
  const col_nr = resource_conf.max_list_columns;
  const sort = resource_conf.sort_attr_names
    ? resource_conf.sort_attr_names[0]
    : "";

  document.title = resource_conf.label || resource_conf.name;
  let list = (
    <>
      <ShowInfoContent resource={resource_conf} />
      <List
        actions={<ListActions resource={resource_conf} />}
        filters={searchFilters}
        perPage={resource_conf.perPage || 25}
        pagination={<DynPagination />}
        sort={{ field: sort, order: "ASC" }}
        title={<ListTitle />}
        {...props}
      >
        <Datagrid
          rowClick="show"
          expand={<DetailPanel attributes={attributes} path={""} />}
        >
          {fields.slice(0, col_nr)}
          <ButtonField resource={resource_conf} {...props} />
        </Datagrid>
      </List>
    </>
  );

  if (resource_conf.components?.list) {
    const Wrapper: any = get_Component(resource_conf.components?.list);

    if (Wrapper !== null) {
      list = <Wrapper list={list} />;
    }
  }

  return list;
};

export default gen_DynResourceList;
