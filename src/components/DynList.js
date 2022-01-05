import React from "react";
import { Typography } from '@material-ui/core';
import { 
    Datagrid,
    TextField,
    DateField,
    EditButton,
    ShowButton,
    List,
    TextInput,
    useDataProvider,
    useRefresh,
    useRecordContext,
    Confirm,
    FunctionField
} from "react-admin";
import Button from '@material-ui/core/Button';
import { useState, useEffect, useMemo} from 'react';
import { attr_fields } from "./DynFields.js";
import { DynPagination } from "../util.js";
import { makeStyles } from '@material-ui/core/styles';
import DeleteIcon from "@material-ui/icons/Delete";
import { DetailPanel } from "./DynInstance.js";
import { ListActions as RAListActions, FilterButton, TopToolbar, CreateButton, ExportButton } from 'react-admin';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import {InfoPopover} from '../util'
import { Modal, Box  } from "@material-ui/core";

const useStyles = makeStyles({
    icon : {color: '#ccc',
            '&:hover' : {color: '#3f51b5'}
            },
    delete_icon : {color: '#3f51b5'}
});

const searchFilters = [
    <TextInput source="q" label="Search" alwaysOn />
];

const deleteField = (dataProvider, resource, record, refresh) => {
    /*
        resource: name of the resource
    */
    dataProvider.delete(resource, record)
        .then(()=>refresh())
        .catch((e)=> alert('error'))
}


const DeleteButton = (props) => {

    const [open, setOpen] = useState(false);
    const dataProvider = useDataProvider();
    const refresh = useRefresh();
    const record = useRecordContext();
    const classes = useStyles();
    
    return <span>
            <FunctionField title="Delete"
                onClick={(e)=> {setOpen(true); e.stopPropagation()}}
                key={`${props.resource.name}_delete`}
                render={record => <Button> 
                                    <DeleteIcon className={classes.delete_icon} />
                                </Button>}
                {...props} />
            <Confirm
                    isOpen={open}
                    title={`Delete "${props.resource}, id ${record.id}"`}
                    content={`Are you sure you want to delete this record?`}
                    onConfirm={() => {deleteField(dataProvider, props.resource, record, refresh);setOpen(false)}}
                    onClose={()=>{setOpen(false);}}
                />
            </span>
}


const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: "75%",
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    textAlign: "left"
  };
  
  
  
const InfoModal = ({label, resource}) => {
    const [open, setOpen] = React.useState(false);
    const handleOpen = (e) => {setOpen(true); e.stopPropagation();}
    const handleClose = (e) => {e.stopPropagation();setOpen(false);}
  
    return (
      <span>
        <span onClick={handleOpen} title={`${resource.name} Info`}>{label} </span>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
          <HelpOutlineIcon />
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              {resource.info}
            </Typography>
          </Box>
        </Modal>
      </span>
    );
}

const ListActions = ({resource}) => {
    
    const classes = useStyles();
    let info_btn;
    if(resource.info){
        const label = <Button label="Info"><HelpOutlineIcon className={classes.icon}/></Button>
        info_btn= <InfoModal label={label} resource={resource}/>
    }

    return <TopToolbar>
                <FilterButton/>
                {info_btn}
                <CreateButton/>
                <ExportButton/>
                
            </TopToolbar>
}


const gen_DynResourceList = (resource) => (props) => {

    const ButtonField = (props) => {
        let filtered_props = {}
        for(let [k, v] of Object.entries(props)){
            //filtered_props[k] = v
            // filter "hasCreate" etc, this causes console warnings
            //if(! k.startsWith('has') && ! k == "syncWithLocation"){
            if(! k.startsWith('has')){
                filtered_props[k] = v
            }
        }
        const buttons = <span>
                {resource.edit !== false ? <EditButton title="Edit" key={`${resource.name}_edit`} label={""} {...filtered_props} /> : null}
                {resource.delete !== false ? <DeleteButton {...filtered_props} /> : null}
                <ShowButton title="Show" label="" {...filtered_props} />
            </span>
        return buttons
    }
    
    const attributes = resource.attributes
    const fields = attr_fields(attributes);
    const col_nr = resource.max_list_columns
    const sort = resource.sort_attr_names ? resource.sort_attr_names[0] : ""
    document.title = resource.label || resource.name

    return <List filters={searchFilters} perPage={resource.perPage || 25}
                actions={<ListActions resource={resource}/>}
                pagination={<DynPagination/>}
                sort={{field: sort, order: 'ASC'}}
                {...props} >
                <Datagrid rowClick="show" expand={<DetailPanel attributes={attributes} />}>
                    {fields.slice(0, col_nr)}
                    <ButtonField resource={resource} {...props} />
                </Datagrid>
            </List>
};

export default gen_DynResourceList