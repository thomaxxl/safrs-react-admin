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
  useGetList,
} from "react-admin";
import Button from "@mui/material/Button";
import { useState } from "react";
import { attr_fields } from "./DynFields";
import { DynPagination, ExtraComponentProps } from "../util";
import DeleteIcon from "@mui/icons-material/Delete";
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
            <DeleteIcon style={{ color: "#3f51b5" }} />
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
      if (!k?.startsWith("has")) {
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
  let attributes = resource_conf.attributes;
  attributes = attributes.filter((attribute) => attribute.hide_list !== "true");

  const fields = attr_fields(attributes, "list");
  const col_nr = resource_conf.max_list_columns;
  const sort = resource_conf.sort_attr_names
    ? resource_conf.sort_attr_names[0]
    : "";

  let location: any = window.location.href;
  location = location.split("/");
  let basePath = location[location.length - 1].includes("?")
    ? location[location.length - 1].split("?")[0]
    : location[location.length - 1];
  const {
    data,
    isFetching,
    isPending,
    fetchStatus,
    isLoading,
    isSuccess,
    error,
  } = useGetList(basePath);

  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    console.log("data called");
    if (isSuccess === true) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

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
          isPending={loading}
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
