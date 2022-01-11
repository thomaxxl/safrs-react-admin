import { useState, useEffect, useMemo} from 'react';
import {
    Datagrid,
    EditButton
} from "react-admin";

import Grid from '@material-ui/core/Grid';
import { Resource, TabbedShowLayout, Tab } from 'react-admin';
import {
  Show,
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
import Button from '@material-ui/core/Button';
import { useQueryWithStore, Loading, Error } from 'react-admin';
import { makeStyles } from '@material-ui/core/styles';
import { type2resource } from "../util.js";
import { ShowAttrField } from "./DynFields.js";
import { attr_fields } from "./DynFields.js";
import {DynPagination} from '../util'
import { ListActions as RAListActions, FilterButton, TopToolbar, CreateButton, ExportButton } from 'react-admin';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import InfoModal from "./InfoModal.js";
import get_Component from '../get_Component.js';
import BlockIcon from '@mui/icons-material/Block';

const conf = get_Conf();

const useStyles = makeStyles({
    join_attr: {color: '#3f51b5'},
    delete_icon : {fill: "#3f51b5"},
    edit_grid : { width: "100%" },
    rel_icon: {paddingLeft:"0.4rem", color: "#666", marginBottom:"0px"},
    many_tab : {color: "#3f51b5"},
    instance_title : { margin: "30px 0px 30px" }
});


const ResourceTitle = ({ record }) => {
    return <span>{record ? `${record.type ? record.type +" " : ""} #${record.id} ` : ''}</span>;
};

export const DetailPanel = ({attributes}) => {
    return <Grid container spacing={3} margin={5} m={40}>
                {attributes.map((attr) => <ShowRecordField source={attr} key={attr.name}/> )}
            </Grid>
}

export const ShowRecordField = ({ source, tabs }) => {
    const record = useRecordContext();
    const classes = useStyles();
    const attr_name = source.name
    const label =  source.label || attr_name
    let value = record[attr_name]
    if(source.component){
        const Component = get_Component(source.component)
        return <Component attr={source} value={value} mode="show"/>
    }
    return <ShowAttrField attr={source} value={value} />
};


const ShowInstance = ({attributes, tab_groups, resource_name, id}) => {

    const classes = useStyles()
    const title = <Typography variant="h5" component="h5" className={classes.instance_title}>
                        {resource_name}<i style={{color: "#ccc"}}> #{id}</i>
                  </Typography>

    const tabs = tab_groups?.map((tab) => {
            if(tab.component){
                const Component = get_Component(tab.component)
                return <Tab label={tab.name || 'Tab'} key={tab.name}><Component/></Tab>
            }
            if(tab.direction === "tomany"){ // <> "toone"
                return DynRelationshipMany(resource_name, id, tab)
            }
            if (tab.direction === "toone"){
                return id !== undefined ? DynRelationshipOne(resource_name, id, tab) : null
            }
    })

    return <SimpleShowLayout>
                {title}
                <Grid container spacing={3} margin={5} m={40}>
                    {attributes.map((attr) => <ShowRecordField key={attr.name} source={attr} tabs={tabs}/> )}
                </Grid>
                <hr style={{ margin: "30px 0px 30px" }}/>
                <TabbedShowLayout tabs={<TabbedShowLayoutTabs variant="scrollable" scrollButtons="auto" />}>
                {tabs}
                </TabbedShowLayout>
            </SimpleShowLayout>
}


const DynRelationshipOne = (resource, id, relationship) => {
    
    console.log("DR1", resource, id)
    const [rel_data, setRelData]  =useState(false)
    const [loading, setLoading] = useState(true);
    const [rel_error, setRelError] = useState(false);
    const {loaded, error, data} = useQueryWithStore({
        type: 'getOne',
            resource: resource,
            payload: { id: id }
        })
    const rel_id = data && relationship.fks.map(fk => data[fk] ? data[fk] : "").join('_')
    const dataProvider = useDataProvider();
    let tab_content = " - "
    useEffect(() => {
        if(rel_id === undefined || rel_id === ""){
            setLoading(false);
            return
        }
        dataProvider.getOne(relationship.resource, { id: rel_id })
            .then(({ data }) => {
                setRelData(data);
                setLoading(false);
            })
            .catch(error => {
                console.warn(error)
                setRelError(error || "Relationship Error");
                setLoading(false);
            })
    }, [data]);
    
    if (!rel_data) { 
        tab_content = loading ? <Loading key={relationship.name}/> : <BlockIcon style={{fill : "#ccc"}} title="No data"/>
    }
    else if (error || rel_error) {
        console.log({resource}, {id}, {relationship}, relationship.name)
        console.log({data}, {rel_data})
        tab_content = <Error key={relationship.name} error={error || rel_error}/>;
    }
    else if(rel_data){
        tab_content = <RelatedInstance instance={rel_data} />
    }
    else{
        // Deprecated.. Delete this stmt??
        console.warn("Hit deprecated code!")
        if(data[relationship.name]?.data === null){
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
    }

    return <Tab label={relationship.label || relationship.name} key={relationship.name}>
                {tab_content}
           </Tab>
}

const LoadingRelatedInstance = ({rel_resource, rel_id}) =>{

    return <div>LoadingRelatedInstance</div>
    // obsolete?
    /*console.log('LoadingRelatedInstance', {rel_resource}, {rel_id})
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
    return <RelatedInstance instance={data} />*/
}


const DynRelationshipMany = (resource_name, id, relationship) => {

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();
    const [related, setRelated] = useState(false);
    const dataProvider = useDataProvider();
    const classes = useStyles();

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

    const target_resource = conf.resources[relationship?.resource]
    if(!target_resource){
        console.warn(`${resource_name}: No resource conf for ${relationship.resource}`)
        console.log({relationship})
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
    const label = relationship.label || relationship.name
    
    return <Tab label={label} key={relationship.name} className={classes.many_tab}>
                <ReferenceManyField reference={relationship.resource} target={fk} addLabel={false} pagination={<DynPagination/>}  perPage={target_resource.perPage || 25}>
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

const ShowActions = ({ basePath, data, resource}) => {
    
    const classes = useStyles();
    let info_btn;
    if(resource.info){
        const label = <Button label="Info"><HelpOutlineIcon className={classes.icon}/></Button>
        info_btn= <InfoModal label={label} resource={resource}/>
    }

    return <TopToolbar>
                {info_btn}
                <EditButton basePath={basePath} record={data} />
            </TopToolbar>
}

export const gen_DynResourceShow = (resource_conf) => (props) => {

    const attributes = resource_conf.attributes
    const tab_groups= resource_conf.tab_groups

    return <Show title={<ResourceTitle />} actions={<ShowActions resource={resource_conf}/>} {...props}>
                <ShowInstance attributes={attributes} tab_groups={tab_groups} resource_name={props.resource} id={props.id}/>
            </Show>
}