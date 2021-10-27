import React from "react";

import { useState, useEffect, useMemo} from 'react';
import { List,
    Datagrid,
    TextField,
    EditButton,
} from "react-admin";
import Grid from '@material-ui/core/Grid';
import { Resource, TabbedShowLayout, Tab } from 'react-admin';
import {
  Edit,
  Create,
  Show,
  SimpleForm,
  TextInput,
  SimpleShowLayout,
  ReferenceManyField,
  useRecordContext,
  Link
} from "react-admin";
import { Typography } from '@material-ui/core';
import { useRefresh } from 'react-admin';
import { useDataProvider } from 'react-admin';
import { FunctionField } from 'react-admin';
import DeleteIcon from "@material-ui/icons/Delete";
import {get_Conf} from './Config.js'
import loadable from '@loadable/component'
import Popover from '@material-ui/core/Popover';
import Button from '@material-ui/core/Button';
import JoinModal from './components/JoinModal'
import { AutocompleteInput, ReferenceInput } from 'react-admin';
import { Pagination } from 'react-admin';
//import {ExtComp} from './components/ExtComp';

const conf = get_Conf();

const searchFilters = [
    <TextInput source="q" label="Search" alwaysOn />
];

const ColumnField = ({column}) => {
    
    const component = column.component // component name to be loaded
    const style = column.style || {}
        
    const default_comp = <TextField source={column.name} key={column.name} style={style} />
    if(!component){
        return default_comp
    }
    // component is specified => render the specified component
    try{
        //const Component = loadable(() => import(`./components/Custom.js`), {
        const Component = loadable(() => import(`./components/Custom.js`), {
                resolveComponent: (components) => components[component],
        })
        return <Component column={column}/>
    }
    catch(e){
        alert("Custom component error")
        console.error("Custom component error", e)
    }
    return default_comp
}


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
    return <span/>
}

const JoinedField = ({column, join}) => {
    const record = useRecordContext();
    const id = record.id
    const target_resource = join.target
    const [item, setItem] = useState(false)
    const dataProvider = useDataProvider();
    const fk = join.fks[0]
    
    useEffect(() => {
        dataProvider.getOne(target_resource, { id: record[fk] })
            .then(({ data }) => {
                setItem(data);
            })
    }, []);
    
    const user_key = conf.resources[join.target]?.user_key
    const user_component = conf.resources[join.target]?.user_component
    let label = id
    
    if(item && user_component){
        // user_component: custom component
        label = load_custom_component(user_component, item)
    }
    else if(item && user_key){
        const target_col = column.relationship.target_resource.columns.filter((col) => col.name == user_key)
        label = <span>{item[user_key] || id}</span>
        
    }
    
    
    const data = <RelatedInstance instance={item} resource_name={join.target}/>
    return <JoinModal label={label} key={column.name} content={data}/>
}


const column_fields = (columns, relationships) => {

    const joins = relationships.filter(rel => rel.direction === "toone")
    const fields = columns.map((column) => {

        if (column.hidden){
            return null;
        }
        for(let join of joins){
            // check if the column is a (toone) relationship FK
            for(let fk of join.fks){
                if(column.name == fk){
                    return <JoinedField key={column.name} column={column} join={join} label={column.label? column.label: column.name}/>
                }
            }
        }
        return <ColumnField key={column.name} column={column} label={column.label? column.label: column.name} style={column.header_style} />
        }
    )
    return fields
}


const DynPagination = props => (
    <Pagination rowsPerPageOptions={[10, 25, 50, 100]}
                perPage={25}
                {...props} />
);


export const gen_DynResourceList = (resource) => (props) => {

    const columns = resource.columns
    const relationships = resource.relationships
    const dataProvider = useDataProvider();
    const refresh = useRefresh();
    const fields = column_fields(columns, relationships);
    const buttons = [
        resource.edit !== false ? <EditButton key={resource.name} label={""}/> : null,
        resource.delete !== false ? <FunctionField 
                onClick={(e)=> {e.stopPropagation()}}
                key={resource.name}
                render={record => <DeleteIcon style={{fill: "#3f51b5"}} onClick={(item)=>deleteField(dataProvider, props.resource, record, refresh)}/>}
        /> : null
    ]
    
    return <List filters={searchFilters} 
                perPage={resource.perPage || 20}
                {...props} >
                <Datagrid rowClick="show">
                    {fields}
                    {buttons}
                </Datagrid>
            </List>
};


export const gen_DynResourceEdit = (resource) => {
    
    const columns = resource.columns;

    const Result = (props) => {
        console.log(props)
        return <Edit {...props}>
            <SimpleForm>
                {columns.map((col) => <DynInput column={col} key={col.name}/> )}
            </SimpleForm>
        </Edit>
    }
    return Result;
}


const deleteField = (dataProvider, resource, record, refresh) => {

    console.log(record)
    dataProvider.delete(resource, record).then(()=>{
        refresh();
        }
    ).catch((e)=> alert('error'))
}


const DynInput = ({column, resource}) => {

    if(column.relationship?.direction == "toone" && column.relationship.target){
        const search_cols = conf.resources[resource].search_cols || ["name"]
        if(!search_cols){
            console.error("no searchable columns configured");
        }
        return <ReferenceInput label={column.name} source={column.name} reference={column.relationship.target}>
                    <AutocompleteInput optionText={search_cols[0]} />
                </ReferenceInput>
    }
    return <TextInput source={column.name}/>
}

export const gen_DynResourceCreate = (resource) => (props) => {

    return <Create {...props}>
        <SimpleForm>
            {resource.columns.map((col) => <DynInput column={col} resource={resource} key={col.name}/> )}
        </SimpleForm>
    </Create >
};


const ResourceTitle = ({ record }) => {

    return <span>{record ? `${record.type ? record.type : null}, ID: "${record.id}"` : ''}</span>;
};


const ShowRecordField = ({ source }) => {
  const record = useRecordContext();
  return record ? <ShowField label={source} value={record[source]}/> : null
};


const ShowField = ({ label, value }) => {
    
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
  

const DynRelationship = (resource, id, relationship) => {

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();
    const [related, setRelated] = useState(false);
    const dataProvider = useDataProvider();
    
    useEffect(() => {
        dataProvider.getOne(resource, { id: id })
            .then(({ data }) => {
                console.log('data',data);
                return { rel_resource: data[relationship.target]?.data.type, rel_id: data[relationship.target]?.data.id }
            })
            .then(({rel_resource, rel_id}) => {
                console.log(rel_resource, rel_id)
                dataProvider.getOne(rel_resource, { id: rel_id }).then(({data}) =>
                   setRelated(data)
                )
                setLoading(false);
            })
            .catch(error => {
                setError(error);
                setLoading(false);
            })
    }, []);
    

    return <Tab label={relationship.name}>
               <RelatedInstance instance={related} resource_name={relationship.target} />
            </Tab>
}

const RelatedInstance = ({instance, resource_name}) => {

    if (!instance){
        return null;
    }
    const resource_conf = conf.resources[resource_name]
    const columns = resource_conf?.columns ? resource_conf?.columns : [];

    const result = [<Grid container spacing={3} margin={5} m={40}>
                            {columns.map((col) => <ShowField label={col.name} value={instance[col.name]}/> )}
                    </Grid>,
                    <div style={{textAlign:"left", width:"100%"}}><Button
                        component={Link}
                        to={{
                            pathname: `${resource_name}/${instance.id}`
                            }}
                        label="Link"><EditButton /></Button></div>
                    ]
    
    return result;
}


const DynRelationshipMany = (resource, id, relationship) => {

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();
    const [related, setRelated] = useState(false);
    const dataProvider = useDataProvider();

    useEffect(() => {
        dataProvider.getOne(resource, { id: id })
            .then(({ data }) => {
                setRelated(data.relationships);
                setLoading(false);
            })
            .catch(error => {
                setError(error);
                setLoading(false);
            })
    }, []);

    const target_cols = conf.resources[relationship.target]?.columns
    return <Tab label={relationship.name}>
                <ReferenceManyField reference={relationship.target} target={relationship.fks[0]} addLabel = {false}>
                    <Datagrid rowClick="show">
                        {target_cols?.map( (col) => 
                            <FunctionField
                                    label={col.name}
                                    key={col.name}
                                    render={record => <span>{record?.attributes ? record?.attributes[col.name] : ''}</span>} />
                        )}
                    <EditButton />
                    </Datagrid>
                </ReferenceManyField>
            </Tab>
}


export const gen_DynResourceShow = (resource_conf) => (props) => {

    const columns = resource_conf.columns
    const relationships= resource_conf.relationships

    return <Show title={<ResourceTitle />} {...props}>
                
                <SimpleShowLayout>
                    <Typography variant="h5" component="h5" style={{ margin: "30px 0px 30px" }}>
                        Instance Data
                    </Typography>

                    <Grid container spacing={3} margin={5} m={40}>
                        {columns.map((col) => <ShowRecordField source={col.name}/> )}
                    </Grid>
                    
                    <hr style={{ margin: "30px 0px 30px" }}/>
                    <Typography variant="h5" component="h5" style={{ margin: "30px 0px 30px" }}>
                        Related Data
                    </Typography>                    

                    <TabbedShowLayout>
                        {relationships.map((rel) => rel.direction === "tomany" ?  // <> "toone"
                            DynRelationshipMany(props.resource, props.id, rel) : 
                            DynRelationship(props.resource, props.id, rel)) }
                    </TabbedShowLayout>

                </SimpleShowLayout>
            </Show>
}


export const DynResource = (props) => {
    window.addEventListener("storage", ()=>window.location.reload())
    const resource_conf = conf.resources[props.name]
    const List= useMemo(()=> gen_DynResourceList(resource_conf), [resource_conf])
    const Create = useMemo(()=> gen_DynResourceCreate(resource_conf), [resource_conf])
    const Edit = useMemo(()=> gen_DynResourceEdit(resource_conf), [resource_conf])
    const Show = useMemo(()=> gen_DynResourceShow(resource_conf), [resource_conf])    
    return <Resource key={props.name} {...props} list={List} edit={Edit} create={Create} show={Show} />
}

