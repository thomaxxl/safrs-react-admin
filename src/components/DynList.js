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
import { ListActions, FilterButton } from 'react-admin';
import IconEvent from '@material-ui/icons/Event';


const useStyles = makeStyles({
    join_attr: {color: '#3f51b5;'},
    delete_icon : {fill: "#3f51b5"},
    edit_grid : { width: "100%" },
    rel_icon: {paddingLeft:"0.4rem", color: "#666", marginBottom:"0px"}
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

const ListActions = (props) => (
    <TopToolbar>
        <FilterButton/>
        <CreateButton/>
        <ExportButton/>
        {/* Add your custom actions */}
        <Button
            onClick={() => { alert('Your custom action'); }}
            label="Show calendar"
        >
            <IconEvent/>
        </Button>
    </TopToolbar>
);


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