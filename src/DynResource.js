import React from "react";
import { useState, useMemo} from 'react';
import { Resource} from 'react-admin';
import {
  Edit,
  Create
} from "react-admin";
import { useRefresh } from 'react-admin';
import { useDataProvider } from 'react-admin';
import {useConf} from './Config.js'
import './style/DynStyle.css'
import { useNotify, useRedirect } from 'react-admin';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from "react-router-dom";
import AttrForm from "./components/AttrForm.js";
import gen_DynResourceList from './components/DynList'
import { gen_DynResourceShow } from './components/DynInstance'
import get_Component from "./get_Component";
import {gen_DynResourceEdit} from './components/DynResourceEdit'
//import {ExtComp} from './components/ExtComp';

const useStyles = makeStyles({
    join_attr: {color: '#3f51b5;'},
    delete_icon : {fill: "#3f51b5"},
    edit_grid : { width: "100%" },
    rel_icon: {paddingLeft:"0.4rem", color: "#666", marginBottom:"0px"}
});


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
    const conf = useConf();
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

