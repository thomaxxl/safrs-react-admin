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
//import Button from "@mui/material/Button";
import {Button} from "react-admin";
import { useState } from "react";
import { attr_fields } from "./DynFields";
import { DynPagination } from "../util";
import DeleteIcon from "@mui/icons-material/Delete";
import { DetailPanel } from "./DynInstance";
import {
  FilterButton,
  TopToolbar,
  CreateButton,
  ExportButton,
  TextField,
} from "react-admin";
import InfoModal from "./InfoModal";
import get_Component from "../get_Component";
import { useInfoToggle } from "../SraToggleContext";
import { Typography } from "@mui/material";
//import {styled} from "@mui/material"
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
    <>
      <FunctionField
        title="Delete"
        onClick={(e: any) => {
          setOpen(true);
          e.stopPropagation();
        }}
        key={`${props.resource.name}_delete`}
        render={(record: any) => (
          <Button color="primary">
            <DeleteIcon  />
          </Button>
        )}
        {...props}
      />
      <Confirm
        isOpen={open}
        title={`Delete "${props.resource}, id ${record?.id}"`}
        content={`Are you sure you want to delete this record?`}
        onConfirm={() => {
          deleteField(dataProvider, props.resource, record, refresh);
          setOpen(false);
        }}
        onClose={() => {
          setOpen(false);
        }}
      />
    </>
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

const CustomButton = ({btnConf, props}: { btnConf: any, props: any}) => {
  
  if(!btnConf.component){
    return null
  }
  const Component: any = get_Component(btnConf.component)
  if(Component !== null){
    return <Component attribute={{}} attr={{}} value={props}/>
  }
  return null
}

const DynListButtons = ({resource_conf, filtered_props}: { resource_conf: any, filtered_props: any}) => {

  const hideShow = resource_conf.buttons?.some((btn:any) => btn.name === "show" && btn.hidden) || resource_conf.show === false
  const hideEdit = resource_conf.buttons?.find((btn:any) => btn.name === "edit" && btn.hidden) || resource_conf.edit === false
  const hideDelete = resource_conf.buttons?.find((btn:any) => btn.name === "delete" && btn.hidden) || resource_conf.delete === false
  
  const defaultButtons = (
    <span key={`${resource_conf.name}_defbtns`}>
      {resource_conf.edit !== false ? (
        <EditButton
          title="Edit"
          key={`${resource_conf.name}_edit`}
          label={""}
          sx={{border: "0px solid black", margin: "0px", textAlign: "center"}}
          style={{ width: '0px' }} 
        />
      ) : null}
      {resource_conf.delete !== false ? (
        <DeleteButton {...filtered_props} key={`${resource_conf.name}_delete`}/>
      ) : null}
      {resource_conf.show !== false && !hideShow ? (
      <ShowButton title="Show" label="" key={`${resource_conf.name}_show`}/>)
      : null
      }
    </span>
  );

  const customButtons = resource_conf.buttons?.map((btn : any) => <CustomButton btnConf={btn} props={filtered_props} key={`${btn.name}`}/>)

  return <span  style={{whiteSpace: "nowrap"}}>
  {customButtons}
  {defaultButtons}
  </span>
}


export const SimpleList = () => (
  <List>
      <Datagrid>
          <TextField source="id" />
          
      </Datagrid>
  </List>
);

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
    const buttons = <DynListButtons resource_conf={resource_conf} filtered_props={filtered_props} />
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
    if (isSuccess === true || !isFetching || !isPending || !isLoading) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, isFetching, isPending, isLoading]);


  document.title = resource_conf.label || resource_conf.name;
  console.log("DynList", document.location.hash, resource_conf, props);
  
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

  if (resource_conf.list) {
    const Wrapper: any = get_Component(resource_conf.list);

    if (Wrapper !== null) {
      list = <Wrapper list={list} />;
    }
  }

  return list;
};

export default gen_DynResourceList;
