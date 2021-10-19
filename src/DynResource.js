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


const customerFilters = [
    <TextInput source="q" label="Search" alwaysOn />
];


export const gen_DynResourceList = (columns) => (props) => {

    const dataProvider = useDataProvider();
    const refresh = useRefresh();
    
    return <List filters={customerFilters} perPage={10}  {...props} >
                <Datagrid rowClick="show">
                    {columns.map((col) => <TextField source={col.name} key={col.name}/> )}
                    <EditButton label={""}/>
                    <FunctionField onClick={(e)=> {e.stopPropagation()}}
                                render={record => <DeleteIcon style={{fill: "#3f51b5"}} onClick={(item)=>deleteField(dataProvider, props.resource, record, refresh)}/>}
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
    
    const target_cols = conf[relationship.target].columns;

    return <Tab label={relationship.name}>
                <dl>
                    {target_cols.map( (col) => <div>
                                    <dt><b>{col.name}</b></dt><dd>{related[col.name]}</dd>
                                    </div>
                                )}
                </dl>
            </Tab>
}


const DynRelationshipMany = (resource, id, relationship) => {

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();
    const [related, setRelated] = useState(false);
    const dataProvider = useDataProvider();

    useEffect(() => {
        dataProvider.getOne(resource, { id: id })
            .then(({ data }) => {
                console.log('data',data);
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
                        {relationships.map((rel) => rel.direction === "tomany" ? 
                            DynRelationshipMany(props.resource, props.id, rel) : 
                            DynRelationship(props.resource, props.id, rel)) }
                    </TabbedShowLayout>

                </SimpleShowLayout>
            </Show>
}
