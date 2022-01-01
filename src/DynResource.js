import React from "react";

import { useState, useEffect, useMemo} from 'react';
import { List,
    Datagrid,
    TextField,
    DateField,
    EditButton,
    ShowButton
} from "react-admin";
import Grid from '@material-ui/core/Grid';
import { Resource, TabbedShowLayout, Tab } from 'react-admin';
import {
  Edit,
  Create,
  Show,
  SimpleForm,
  TextInput,
  DateInput,
  SimpleShowLayout,
  TabbedShowLayoutTabs,
  ReferenceManyField,
  useRecordContext,
  Link,
  Confirm
} from "react-admin";
import { Typography } from '@material-ui/core';
import { useRefresh } from 'react-admin';
import { useDataProvider } from 'react-admin';
import { FunctionField } from 'react-admin';
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import {get_Conf} from './Config.js'
import loadable from '@loadable/component'
import Popover from '@material-ui/core/Popover';
import Button from '@material-ui/core/Button';
import JoinModal from './components/JoinModal'
import { AutocompleteInput, ReferenceInput } from 'react-admin';
import { Pagination } from 'react-admin';
import './style/DynStyle.css'
import { useQueryWithStore, Loading, Error } from 'react-admin';
import { useNotify, useRedirect } from 'react-admin';
import { makeStyles } from '@material-ui/core/styles';
import { Switch, Route } from "react-router-dom";
import DynInput from "./components/DynInput.js";
import {useHistory} from "react-router-dom";
import { updateJsxAttribute } from "typescript";
import { configure } from "@testing-library/react";

//import {ExtComp} from './components/ExtComp';

const conf = get_Conf();

const useStyles = makeStyles({
    join_attr: {color: '#3f51b5;'},
    delete_icon : {fill: "#3f51b5"},
    edit_grid : { width: "100%" }
});

const searchFilters = [
    <TextInput source="q" label="Search" alwaysOn />
];


const type2resource = (type) => {
    for(let [resource_name, resource] of Object.entries(conf?.resources)){
        if(resource.type === type){
            return resource_name
        }
    }
    console.warn(`No resource for type "${type}`)
    return conf[type]
};


const get_Component = (name) => {
    try{
        const Component = loadable(() => import(`./components/Custom.js`), {
                resolveComponent: (components) => components[name],
        })
        return Component
    }
    catch(e){
        alert("Custom component error")
        console.error("Custom component error", e)
    }
    return null
};


const TruncatedTextField = (props) => {
    
    const record = props.record // "record" is a prop received from the Datagrid
    const source = props.source
    if(!record || !source){
        return <span></span>
    }
    let value = record[source];
    if(value && !React.isValidElement(value) && typeof value == "object"){
        try{
            console.log(`Converting value :${value}`)
            value=JSON.stringify(value)
        }
        catch(err){
            console.log(`Invalid element value :${value}`)
            console.warn(err)
            value = "Value Error"
        }
    }
    if(!value || value.length < 128 || !value.slice || !value.slice instanceof Function){
        return <span>{value}</span>
    }
    return <span>{value.slice(0, 128) + "..." }</span>;
};

const AttrField = ({attribute, ...props}) => {
    
    const component = attribute.component // component name to be loaded
    const style = attribute.style || {}
        
    let result = <TruncatedTextField source={attribute.name} key={attribute.name} sortBy={attribute.name} label={attribute.label || attribute.name} {...props}/>
    
    if(attribute.type == "DATE"){
        result = <DateField source={attribute.name} key={attribute.name} style={style} locales={conf.settings.locale} {...props}/>
    }
    if(!component){
        return result
    }
    // component is specified => render the specified component
    try{
        const Component = loadable(() => import(`./components/Custom.js`), {
                resolveComponent: (components) => components[component],
        })
        result = <Component attribute={attribute}/>
    }
    catch(e){
        alert("Custom component error")
        console.error("Custom component error", e)
    }
    return result
};


const load_custom_component = (component_name, item) => {

    try{
        const LabelComponent = loadable(() => import(`./components/Custom.js`), {
            resolveComponent: (components) => components[`${component_name}`],
        })
        return <LabelComponent instance={item} />
    }
    catch(e){
        alert("Custom component error")
        console.error("Custom component error", e)
    }
    return null
}


const JoinedField = ({attribute, join}) => {
    
    const record = useRecordContext();
    if(record?.attributes){
        Object.assign(record, record.attributes)
    }
    const rel_name = join.name;
    const target_resource = join.target
    const fk = join.fks.join('_')
    const user_key = conf.resources[join.target]?.user_key
    const user_component = conf.resources[join.target]?.user_component
    const id = record ? record[fk] : null
    
    const { data, loading, error } = useQueryWithStore({ 
        type: 'getOne',
        resource: target_resource,
        payload: { id: id }
    });

    if(!record){
        return null
    }
    
    let item = data || record[rel_name]
    let label = item?.id || id
    
    if(!item){
        return null
    }
    if(user_component){
        // user_component: custom component
        label = load_custom_component(user_component, item)
    }
    else if(item.attributes && user_key){
        const target_col = attribute.relationship.target_resource.attributes.filter((col) => col.name == user_key)
        label = <span>{item.attributes[user_key] || item.id}</span>
    }
    else if (user_key in item){
        label = item[user_key]
        item.type = conf.resources[join.target]?.type
        item.attributes = item
    }
    
    const modal_content = <RelatedInstance instance={item} resource_name={join.target}/>
    return <JoinModal label={label} key={attribute.name} content={modal_content} resource_name={join.target}/>
}


const attr_fields = (attributes, ...props) => {

    if(! attributes instanceof Array){
        console.warn("Invalid attributes", attributes)
        return []
    }
    
    const fields = attributes.map((attr) => {
            if (attr.hidden){
                return null;
            }
            if(attr.relationship?.direction == "toone"){
                let label = attr.label || attr.relationship.resource || attr.name
                return <JoinedField key={attr.name} attribute={attr} join={attr.relationship} label={label}/>
            }
            return AttrField({attribute: attr, ...props})
        }
    )
    return fields
}


const DynPagination = (props) => {
    return <Pagination rowsPerPageOptions={[10, 25, 50, 100]}
                perPage={props.perPage || 25 }
                {...props} />
}


const DetailPanel = ({attributes}) => {
    return <Grid container spacing={3} margin={5} m={40}>
                {attributes.map((attr) => <ShowRecordField source={attr} key={attr.name}/> )}
            </Grid>
}


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

export const gen_DynResourceList = (resource) => (props) => {

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


export const gen_DynResourceEdit = (resource) => {
    
    const attributes = resource.attributes;
    
    const Result = (props) => {
        const notify = useNotify();
        const refresh = useRefresh();
        const redirect = useRedirect();
        const classes = useStyles();
        const history = useHistory();

        const onFailure = (error) => {
            notify(`Error Saving Changes`,  { type: 'warning' })
            redirect('edit', props.basePath, props.id);
            refresh();
        }

        const onSuccess = () => {
            notify(`Changes Saved`);
            //redirect('show', props.basePath, props.id);
            history.goBack()
            refresh();
        }
    
        return <Edit {...props} onFailure={onFailure} onSuccess={onSuccess}  mutationMode="pessimistic">
            <SimpleForm>
                <Grid container spacing={2} margin={2} m={40} className={classes.edit_grid}>
                    {attributes.map((attr) => <DynInput attribute={attr} key={attr.name}/> )}
                </Grid>
            </SimpleForm>
        </Edit>
    }
    return Result;
}


export const gen_DynResourceCreate = (resource) => (props) => {

    const refresh = useRefresh();
    const redirect = useRedirect();
    const classes = useStyles();
    const history = useHistory();
    const notify = useNotify();

    if(resource.create){
        const CreateComp = get_Component(resource.create)
        console.log({resource})
        return <CreateComp resource_name={resource.name} {...props}></CreateComp>
    }

    const onSuccess = () => {
        notify(`Changes Saved`);
        history.goBack()
        refresh();
    }

    return <Create {...props} onSuccess={onSuccess}>
        <SimpleForm>
            <Grid container spacing={3} margin={5} m={400} style={{ width: "100%" }}>
                {resource.attributes.map((col) => <DynInput attribute={col} resource={resource} key={col.name}/> )}
            </Grid>
        </SimpleForm>
    </Create >
};


const ResourceTitle = ({ record }) => {
    return <span>{record ? `${record.type ? record.type +" " : ""} #${record.id} ` : ''}</span>;
};


const ShowRecordField = ({ source }) => {
    const record = useRecordContext();
    const classes = useStyles();
    const attr_name = source.name
    const label =  source.label || attr_name
    let value = record[attr_name]

    return <ShowAttrField attr={source} value={value} />
};


const ShowAttrField = ({attr, value}) => {
    const attr_name = attr.name
    const label =  attr.label || attr_name
    
    if(!attr.relationship){
        return <ShowField label={label} value={value}/>
    }
    // todo: make the onClick handler open the right tab
    const jf = <JoinedField key={attr.name} attribute={attr} join={attr.relationship} />
    return <ShowField label={attr.label? attr.label: attr.name + " (R)"} value={jf} />
}

const ShowField = ({ label, value }) => {
    if(value && !React.isValidElement(value) && typeof value == "object"){
        try{
            console.log(`Converting value :${value}`)
            value=JSON.stringify(value)
        }
        catch(err){
            console.log(`Invalid element value :${value}`)
            console.warn(err)
            value = <i>Value Error</i>
        }
    }
    return (
      <Grid item xs={3}>
        <Typography variant="body2" color="textSecondary" component="p">
          {label}
        </Typography>
        <Typography variant="body2" component="p">
          {value}
        </Typography>
      </Grid>
    )
};


const DynRelationshipOne = (resource, id, relationship) => {
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();
    const [related, setRelated] = useState(false);
    const dataProvider = useDataProvider();
    
    useEffect(() => {
        dataProvider.getOne(resource, { id: id })
            .then(({ data }) => {
                const rel_resource = type2resource(data[relationship.name]?.data?.type)
                const rel_id = data[relationship.name]?.data?.id
                if(!rel_resource){
                    console.log(data)
                    console.warn(`Related resource not found ${resource}.${relationship.name}`)
                }
                return { rel_resource: rel_resource, rel_id: rel_id }
            })
            .then(({rel_resource, rel_id}) => {
                if(!rel_resource){
                    setLoading(false);
                    return {}
                }
                dataProvider.getOne(rel_resource, { id: rel_id }).then(({data}) =>
                {
                    console.log(data)
                    return setRelated(data)
                }
                )
                .then(()=>console.log(related))
                setLoading(false);
            })
            .catch(error => {
                console.error(error)
                setError(error);
                setLoading(false);
            })
    }, []);

    return <Tab label={relationship.label || relationship.name} key={relationship.name}>
                <RelatedInstance instance={related} />
           </Tab>
}

const DynRelationshipMany = (resource_name, id, relationship) => {

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();
    const [related, setRelated] = useState(false);
    const dataProvider = useDataProvider();

    console.debug({resource_name}, {id}, {relationship})

    useEffect(() => {
        dataProvider.getOne(resource_name, { id: id })
            .then(({ data }) => {
                setRelated(data.relationships);
                setLoading(false);
            })
            .catch(error => {
                setError(error);
                setLoading(false);
            })
    }, []);

    const target_resource = conf.resources[relationship.target]
    if(!target_resource){
        console.warn(`${resource_name}: No resource conf for ${target_resource}`)
        return null
    }

    if(!target_resource?.attributes){
        console.log("No target resource attributes")
        return null
    }

    /*
        Render the datagrid, this is similar to the grid in gen_DynResourceList
        todo: merge these into one component
    */
    const attributes = target_resource.attributes.filter(col => col.relationship?.target !== resource_name) // ignore relationships pointing back to the parent resource
    const fields = attr_fields(attributes);
    const col_nr = target_resource.max_list_columns
    const fk = relationship.fks.join('_')

    return <Tab label={relationship.label || relationship.name} key={relationship.name}>
                <ReferenceManyField reference={relationship.target} target={fk} addLabel={false} pagination={<DynPagination/>}  perPage={target_resource.perPage || 10}>
                    <Datagrid rowClick="show" expand={<DetailPanel attributes={target_resource.attributes} />}>
                        {fields.slice(0,col_nr)}
                        <EditButton />
                    </Datagrid>
                </ReferenceManyField>            
            </Tab>
}


const ShowInstance = ({attributes, relationships, resource_name, id}) => {

    const title = <Typography variant="h5" component="h5" style={{ margin: "30px 0px 30px" }}>
                        {resource_name}<i style={{color: "#ccc"}}> #{id}</i>
                   </Typography>

    const tabs = <TabbedShowLayout tabs={<TabbedShowLayoutTabs variant="scrollable" scrollButtons="auto" />}>
                    {relationships.map((rel) => rel.direction === "tomany" ?  // <> "toone"
                        DynRelationshipMany(resource_name, id, rel) : 
                        DynRelationshipOne(resource_name, id, rel)) }
                    </TabbedShowLayout>

    return <SimpleShowLayout>
                {title}
                <Grid container spacing={3} margin={5} m={40}>
                    {attributes.map((attr) => <ShowRecordField key={attr.name} source={attr}/> )}
                </Grid>
                
                <hr style={{ margin: "30px 0px 30px" }}/>

                {tabs}

            </SimpleShowLayout>
}


const RelatedInstance = ({instance}) => {

    if (!instance?.type){
        return <span></span>;
    }
    const resource_name = type2resource(instance?.type)
    if (!resource_name){
        return <span>...</span>;
    }
    
    const resource_conf = conf.resources[resource_name]
    const attributes = resource_conf?.attributes || [];
    const relationships = resource_conf?.relationships || [];
    
    // ugly manual styling because adding to TabbedShowLayout didn't work
    const result = <div style={{left: "-16px", position: "relative"}}> 
                        <div style={{textAlign:"right", width:"100%"}} >
                            <Button
                                title="edit"
                                component={Link}
                                to={{
                                    pathname: `${resource_name}/${instance.id}`
                                    }}
                                label="Link"><EditIcon />Edit
                            </Button>
                            <Button
                                title="view"
                                component={Link}
                                to={{
                                    pathname: `/${resource_name}/${instance.id}/show`
                                    }}
                                label="Link"><KeyboardArrowRightIcon />View
                            </Button>
                        </div>
                        <Grid container spacing={3}>
                                { //{attributes.map((attr) => <ShowField label={attr.name} key={attr.name} value={instance.attributes[attr.name]}/> )}
                                attributes.map((attr) => <ShowAttrField key={attr.name} attr={attr} value={instance.attributes[attr.name]}/> )
                                }
                        </Grid>
                    </div>
   
    return result;
}


export const gen_DynResourceShow = (resource_conf) => (props) => {

    const attributes = resource_conf.attributes
    const relationships= resource_conf.relationships

    return <Show title={<ResourceTitle />} {...props}>
                <ShowInstance attributes={attributes} relationships={relationships} resource_name={props.resource} id={props.id}/>
            </Show>
}

export const DynResource = (props) => {
    window.addEventListener("storage", ()=>window.location.reload())
    const [, updateState] = React.useState();
    const [resource_conf, setConf] = useState(conf.resources[props.name])
    const List= useMemo(()=> gen_DynResourceList(resource_conf), [resource_conf])
    const Create = useMemo(()=> gen_DynResourceCreate(resource_conf), [resource_conf])
    const Edit = useMemo(()=> gen_DynResourceEdit(resource_conf), [resource_conf])
    const Show = useMemo(()=> gen_DynResourceShow(resource_conf), [resource_conf])
    let options = {}
    if(resource_conf.label && resource_conf.label != resource_conf.name){
        //adding a label works, but causes a full rerender of the component which may not be desirable
        options={label: resource_conf.label}
        return <Resource key={props.name} list={List} edit={Edit} create={Create} show={Show} options={options} {...props}/>
    }
    return <Resource key={props.name} list={List} edit={Edit} create={Create} show={Show} {...props}/>
}

