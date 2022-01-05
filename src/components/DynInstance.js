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
  Link
} from "react-admin";
import { Typography } from '@material-ui/core';
import { useRefresh } from 'react-admin';
import { useDataProvider } from 'react-admin';
import EditIcon from "@material-ui/icons/Edit";
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import {get_Conf} from '../Config.js'
import Popover from '@material-ui/core/Popover';
import Button from '@material-ui/core/Button';
import { AutocompleteInput, ReferenceInput } from 'react-admin';
import { Pagination } from 'react-admin';
import '../style/DynStyle.css'
import { useQueryWithStore, Loading, Error } from 'react-admin';
import { useNotify, useRedirect } from 'react-admin';
import { makeStyles } from '@material-ui/core/styles';
import { Switch, Route } from "react-router-dom";
import {useHistory} from "react-router-dom";
import { updateJsxAttribute } from "typescript";
import { configure } from "@testing-library/react";
import { type2resource } from "../util.js";
import { ShowAttrField } from "./DynFields.js";
import { attr_fields } from "./DynFields.js";
import {DynPagination} from '../util'


const conf = get_Conf();

const useStyles = makeStyles({
    join_attr: {color: '#3f51b5;'},
    delete_icon : {fill: "#3f51b5"},
    edit_grid : { width: "100%" },
    rel_icon: {paddingLeft:"0.4rem", color: "#666", marginBottom:"0px"}
});


const ResourceTitle = ({ record }) => {
    return <span>{record ? `${record.type ? record.type +" " : ""} #${record.id} ` : ''}</span>;
};

export const DetailPanel = ({attributes}) => {
    return <Grid container spacing={3} margin={5} m={40}>
                {attributes.map((attr) => <ShowRecordField source={attr} key={attr.name}/> )}
            </Grid>
}

export const ShowRecordField = ({ source }) => {
    const record = useRecordContext();
    const classes = useStyles();
    const attr_name = source.name
    const label =  source.label || attr_name
    let value = record[attr_name]

    return <ShowAttrField attr={source} value={value} />
};


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

const DynRelationshipOne = (resource, id, relationship) => {
    
    const [loading, setLoading] = useState(true);
    const [related, setRelated] = useState(false);
    const dataProvider = useDataProvider();
    const { loaded, error, data } = useQueryWithStore({
        type: 'getOne',
            resource: resource,
            payload: { id: id }
        })
    let tab_content = " - "
    if (!loaded) { 
        tab_content = <Loading key={relationship.name}/>; 
    }
    else if (error) { 
        tab_content = <Error key={relationship.name}/>; 
    }
    else if(data[relationship.name]?.data === null){
        tab_content = "Empty"
    }
    else if(data && data[relationship.name]?.type && data[relationship.name].type === relationship?.target_resource?.type){
        tab_content = <RelatedInstance instance={data[relationship.name]} />
    }
    else if(data[relationship.name]?.data){
        // todo: might be obsolote, tbd
        // todo: fix the data provider so we can simplify this conditional and use <RelatedInstance> instead
        const rel_resource = type2resource(data[relationship.name].data?.type)
        const rel_id = data[relationship.name]?.data?.id
        if(!rel_resource){
            console.log(data)
            console.warn(`Related resource not found ${resource}.${relationship.name}`)
        }
        else{
            tab_content = <LoadingRelatedInstance rel_resource={rel_resource} rel_id={rel_id}/>
        }
    }
    
    return <Tab label={relationship.label || relationship.name} key={relationship.name}>
                {tab_content}
           </Tab>
}

const LoadingRelatedInstance = ({rel_resource, rel_id}) =>{
    // obsolete?
    console.log('LoadingRelatedInstance', {rel_resource}, {rel_id})
    const { loaded, error, data } = useQueryWithStore({
        type: 'getOne',
            resource: rel_resource,
            payload: { id: rel_id }
    })
    if (!loaded) { 
        return <Loading />; 
    }
    if (error) { 
        return <Error />; 
    }
    return <RelatedInstance instance={data} />
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
    let attributes = target_resource.attributes.filter(attr => attr.relationship?.target !== resource_name) // ignore relationships pointing back to the parent resource
    attributes = relationship.attributes ? attributes.filter(attr => relationship.attributes.find(r_attr=> r_attr.name == attr.name)) : attributes
    
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


export const RelatedInstance = ({instance}) => {

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