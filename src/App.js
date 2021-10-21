import * as React from 'react';
import { useEffect, useState } from 'react';
import { AdminContext, AdminUI, Resource, ListGuesser, useDataProvider } from 'react-admin';
import {jsonapiClient} from "@agoe/rav3-jsonapi-client"
import HomeIcon from '@material-ui/icons/Home';
import { gen_DynResourceList, gen_DynResourceCreate, gen_DynResourceEdit, gen_DynResourceShow } from './DynResource';
import Home from './Home.js'
import conf from './Config'


const dataProvider = jsonapiClient(conf.api_root); // http://localhost:5000

const App = () => {
    return (
        <AdminContext dataProvider={dataProvider}>
            <AsyncResources />
        </AdminContext>
    );
}

const DynResource = (props) => {

    const resource_conf = conf[props.name]
    
    const List=gen_DynResourceList(resource_conf.columns, resource_conf.relationships)
    const Create = gen_DynResourceCreate(resource_conf)
    const Edit = gen_DynResourceEdit(resource_conf.columns)
    const Show = gen_DynResourceShow(resource_conf.columns, resource_conf.relationships)
    
    return <Resource key={props.name} {...props} list={List} edit={Edit} create={Create} show={Show} />
}

const AsyncResources = () => {
    const [resources, setResources] = useState(false);
    const dataProvider = useDataProvider();

    useEffect(() => {
        dataProvider.getResources().then((response) => {        
            let res = Object.keys(response.data).map((resource_name) => {return {name: resource_name}})
            setResources(res)
        })
        .catch((err) => {
            console.warn(err)
            alert('failed to fetch schema, no resources available')
            setResources([])
        })
    }, []);

    if(resources ===  false){
        return <div>Loading...</div>
    }
    return (
        <AdminUI>
            <Resource name="Home" show={Home} list={Home} options={{ label: 'Home' }} icon={HomeIcon}/>
            {resources.map(resource => resource.name ? <DynResource name={resource.name} key={resource.name} /> : null
            )}
        </AdminUI>
    );
}

export default App;