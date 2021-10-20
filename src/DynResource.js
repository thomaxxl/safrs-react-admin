import { React } from "react";
import { useState, useEffect } from 'react';
import { List,
    Datagrid,
    TextField,
    EditButton,
} from "react-admin";
import Grid from '@material-ui/core/Grid';
import { TabbedShowLayout, Tab } from 'react-admin';
import {
  Edit,
  Create,
  Show,
  SimpleForm,
  TextInput,
  SimpleShowLayout,
  ReferenceManyField,
  useRecordContext
} from "react-admin";
import { Typography } from '@material-ui/core';
import { useRefresh } from 'react-admin';
import { useDataProvider } from 'react-admin';
import { FunctionField } from 'react-admin';
import DeleteIcon from "@material-ui/icons/Delete";
import conf from './Config.js'
import loadable from '@loadable/component'
import Popover from '@material-ui/core/Popover';
import Button from '@material-ui/core/Button';
import JoinModal from './components/JoinModal'


const customerFilters = [
    <TextInput source="q" label="Search" alwaysOn />
];

const ColumnField = ({column}) => {
    
    const component = column.component
    const default_comp = <TextField source={column.name} key={column.name} />
    if(!component){
        return default_comp
    }
    // component is specified => render the specified component
    try{
        const Component = loadable(() => import(`./components/Custom.js`), {
            resolveComponent: (components) => components[`${component}`],
        })
        return <Component column={column}/>
    }
    catch(e){
        alert("Custom component error")
        console.error("Custom component error", e)
    }
    return default_comp
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
    
    const join_label = conf[join.target]?.join_label
    let label = id
    if(item && join_label){
        try{
            const LabelComponent = loadable(() => import(`./components/Custom.js`), {
                resolveComponent: (components) => components[`${join_label}`],
            })
            label = <LabelComponent instance={item} />
        }
        catch(e){
            alert("Custom component error")
            console.error("Custom component error", e)
        }
    }
    
    const data = <RelatedInstance instance={item} resource_name={join.target}/>
    return <JoinModal label={label} key={column.name} content={data}/>
}


const column_fields = (columns, relationships) => {

    const joins = relationships.filter(rel => rel.direction === "toone")
    const fields = columns.map((column) => {

        if (column.hidden){
            return <span/> 
        }
        for(let join of joins){
            // check if the column is a (toone) relationship FK
            for(let fk of join.fks){
                if(column.name == fk){
                    return <JoinedField column={column} join={join} label={column.label? column.label: column.name}/>
                }
            }
        }
        return <ColumnField column={column} label={column.label? column.label: column.name}/>
        }
    )

    return fields
}

export const gen_DynResourceList = (columns, relationships) => (props) => {

    const dataProvider = useDataProvider();
    const refresh = useRefresh();
    const fields = column_fields(columns, relationships);

    return <List filters={customerFilters} perPage={10}  {...props} >
                <Datagrid rowClick="show">
                    {fields}
                    <EditButton label={""}/>
                    <FunctionField 
                            onClick={(e)=> {e.stopPropagation()}}
                            render={record => <DeleteIcon style={{fill: "#3f51b5"}}
                            onClick={(item)=>deleteField(dataProvider, props.resource, record, refresh)}/>}
                    />
                </Datagrid>
            </List>
};


export const gen_DynResourceEdit = (columns) => (props) => (
    <Edit {...props}>
        <SimpleForm>
            {columns.map((col) => <TextInput source={col.name} key={col.name}/> )}
        </SimpleForm>
    </Edit>
);


const deleteField = (dataProvider, resource, record, refresh) => {

    console.log(record)
    dataProvider.delete(resource, record).then(()=>{
        refresh();
        }
    ).catch((e)=> alert('error'))
}


export const gen_DynResourceCreate = (columns) => (props) => (
    <Create {...props}>
        <SimpleForm>
            {columns.map((col) => <TextField source={col.name}/> )}
        </SimpleForm>
    </Create >
);


const ResourceTitle = ({ record }) => {
    return <span>Post {record ? `ID: "${record.id}" ContactName: "${record.ContactName}"` : ''}</span>;
};



const ShowField = ({ source }) => {
  const record = useRecordContext();
  return record ? (
    <Grid item xs={3}>
      <Typography variant="body2" color="textSecondary" component="p">
        {source}
      </Typography>
      <Typography variant="body2" component="p">
        {record[source]}
      </Typography>
    </Grid>
  ) : null;
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

    const resource_conf = conf[resource_name]
    const columns = resource_conf?.columns ? resource_conf?.columns : [];
    const result = <dl>
                        {columns.map( (col) => <div key={col.name}>
                                    <dt><b>{col.name}</b></dt><dd>{instance[col.name]}</dd>
                                    </div>
                                )}
                    </dl>
    
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

    const target_cols = conf[relationship.target]?.columns

    return <Tab label={relationship.name}>
                <ReferenceManyField reference={relationship.target} target={relationship.fks[0]} addLabel = {false}>
                    <Datagrid rowClick="show">
                        {target_cols.map( (col) => 
                            <FunctionField
                                    label={col.name}
                                    render={record => <span>{record?.attributes ? record?.attributes[col.name] : ''}</span>} />
                        )}
                    <EditButton />
                    </Datagrid>
                </ReferenceManyField>
            </Tab>
}


export const gen_DynResourceShow = (columns, relationships) => (props) => {

    return <Show title={<ResourceTitle />} {...props}>
                <SimpleShowLayout>
                    
                    <Typography variant="h5" component="h5" style={{ margin: "30px 0px 30px" }}>
                        Instance Data:
                    </Typography>

                    <Grid container spacing={3} margin={5} m={40}>
                        {columns.map((col) => <ShowField source={col.name}/> )}
                    </Grid>
                    
                    <hr style={{ margin: "30px 0px 30px" }}/>

                    <TabbedShowLayout>
                        {relationships.map((rel) => rel.direction === "tomany" ?  // <> "toone"
                            DynRelationshipMany(props.resource, props.id, rel) : 
                            DynRelationship(props.resource, props.id, rel)) }
                    </TabbedShowLayout>

                </SimpleShowLayout>
            </Show>
}
