import * as React from 'react';
import { useEffect, useState } from 'react';
import { AdminContext, AdminUI, Resource, ListGuesser, useDataProvider } from 'react-admin';
//import {jsonapiClient} from "@agoe/rav3-jsonapi-client"
import {jsonapiClient} from "@agoe/rav3-jsonapi-client"
import HomeIcon from '@material-ui/icons/Home';
import { DynResource } from './DynResource';
import Home from './components/Home.js'
import conf from './Config'
import { Layout }  from './components/Layout';

const dataProvider = jsonapiClient(conf.api_root); // http://localhost:5000

const AsyncResources = () => {
    const [resources, setResources] = useState(false);
    
    const dataProvider = useDataProvider();
    

    useEffect(() => {
        dataProvider.getResources().then((response) => {        
            let res = Object.keys(response.data.resources).map((resource_name) => { return {name: resource_name} })
            setResources(res)
        })
        .catch((err) => {
            console.warn(err)
            alert(`failed to fetch schema, no resources available for api ${conf.api_root}`)
            setResources([])
        })
    }, []);

    if(resources ===  false){
        return <div>Loading...</div>
    }
    return (
        <AdminUI layout={Layout}>
            <Resource name="Home" show={Home} list={Home} options={{ label: 'Home' }} icon={HomeIcon}/>
            {resources.map(resource => <DynResource name={resource.name} key={resource.name} />)}
        </AdminUI>
    );
}

const App = () => {
    
    return (
        <AdminContext dataProvider={dataProvider}>
            <AsyncResources />
        </AdminContext>
    );
}

export default App;