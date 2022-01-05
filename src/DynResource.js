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
import {get_Conf} from './Config.js'
import loadable from '@loadable/component'
import Popover from '@material-ui/core/Popover';
import JoinModal from './components/JoinModal'
import { AutocompleteInput, ReferenceInput } from 'react-admin';
import { Pagination } from 'react-admin';
import './style/DynStyle.css'
import { useQueryWithStore, Loading, Error } from 'react-admin';
import { useNotify, useRedirect } from 'react-admin';
import { makeStyles } from '@material-ui/core/styles';
import { Switch, Route } from "react-router-dom";
import {useHistory} from "react-router-dom";
import { updateJsxAttribute } from "typescript";
import { configure } from "@testing-library/react";
import AttrForm from "./components/AttrForm.js";
import gen_DynResourceList from './components/DynList'
import {ShowAttrField, attr_fields} from './components/DynFields'
import {RelatedInstance, gen_DynResourceShow} from './components/DynInstance'
import { type2resource } from "./util.js";
//import {ExtComp} from './components/ExtComp';

const conf = get_Conf();

const useStyles = makeStyles({
    join_attr: {color: '#3f51b5;'},
    delete_icon : {fill: "#3f51b5"},
    edit_grid : { width: "100%" },
    rel_icon: {paddingLeft:"0.4rem", color: "#666", marginBottom:"0px"}
});


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

export const gen_DynResourceEdit = (resource) => {
    
    const attributes = resource.attributes;
    
    const Result = (props) => {
        
        const notify = useNotify();
        const refresh = useRefresh();
        const redirect = useRedirect();
        const dataProvider = useDataProvider();
        const classes = useStyles();
        const history = useHistory();
        const [loaded, setLoaded] = useState(false)

        const onFailure = (error) => {
            notify(`Error Saving Changes`,  { type: 'warning' })
            redirect('edit', props.basePath, props.id);
            refresh();
        }

        const onSuccess = () => {
            notify(`Changes Saved`);
            history.goBack()
            refresh();
        }
        
        refresh()

        return <Edit {...props} attributes={attributes} onFailure={onFailure} onSuccess={onSuccess}  mutationMode="pessimistic">
            <AttrForm attributes={attributes} /></Edit>
    }
    return Result;
}



export const gen_DynResourceCreate = (resource) => (props) => {

    const refresh = useRefresh();
    const history = useHistory();
    const notify = useNotify();
    const attributes = resource.attributes

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
                <AttrForm attributes={attributes} />
            </Create >
};



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

