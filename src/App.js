import * as React from 'react';
import { useEffect, useState } from 'react';
import { AdminContext, Admin, AdminUI, Resource, useDataProvider } from 'react-admin';
//import {jsonapiClient} from "@agoe/rav3-jsonapi-client"
import {jsonapiClient} from "./rav3-jsonapi-client/ra-jsonapi-client"
import HomeIcon from '@material-ui/icons/Home';
import { DynResource } from './DynResource';
import Home from './components/Home.js'
import ConfigurationUI, {LoadYaml} from './components/ConfigurationUI'
import Dashboard from './pages/Dashboard';
import {get_Conf} from './Config'
import { Layout }  from './components/Layout';
import { put, takeEvery } from 'redux-saga/effects';
import { showNotification } from 'react-admin';
import createAdminStore from './createAdminStore';
import { Provider } from 'react-redux';
import { createHashHistory } from 'history';
import SettingsIcon from '@material-ui/icons/Settings';
import DashboardIcon from '@material-ui/icons/Dashboard';
import authProvider from './authprovider';
import LoginPage from './pages/LoginPage';
import { cacheDataProviderProxy } from 'react-admin'; 

const history = createHashHistory();

const bcR =  (previousState = 0, { type, payload }) => {

    if(type === 'RA/CRUD_GET_LIST_SUCCESS'){
        console.log('bcR', type, payload)
        console.log(previousState);
    }
   
    return previousState;
}

const conf = get_Conf();
//const dataProvider = jsonapiClient(conf.api_root, {includeRelations : [{resource: "OrderDetail", includes : ["Order", "Product"] }] }); // http://localhost:5000
const dataProvider = cacheDataProviderProxy(jsonapiClient(conf.api_root, {}), 2000); // 2000ms caching


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
            setResources([])
        })
    }, []);

    if(resources ===  false){
        return <div>Loading...</div>
    }
    
    return (
        <Provider
        store={createAdminStore({
            authProvider,
            dataProvider,
            history,
        })}
    >
        <AdminUI layout={Layout} loginPage={LoginPage} disableTelemetry>
            
            <Resource name="Home" show={Home} list={Home} options={{ label: 'Home' }} icon={HomeIcon}/>
            <Resource name="Configuration" show={ConfigurationUI} list={ConfigurationUI} options={{ label: 'Configuration' }} icon={SettingsIcon}/>
            {
                resources.map(resource => <DynResource name={resource.name} key={resource.name} />)
                // <Resource name="Dashboard" show={Dashboard} list={Dashboard} options={{ label: 'Dashboard' }} icon={DashboardIcon}/>
            }
            

        </AdminUI>
        </Provider>
    );
}



const App = () => {
    if(!localStorage.getItem("raconf")){
        LoadYaml(null)
    }
    return (
        <AdminContext loginPage={LoginPage} dataProvider={dataProvider}  customReducers={{ admin2: bcR }} authProvider={authProvider} disableTelemetry>
            <AsyncResources />
        </AdminContext>
    );
}

export default App;