import React from "react";
import { useRefresh } from 'react-admin';
import { useDataProvider } from 'react-admin';
import { 
    Confirm,
    useRecordContext,
    DateField,
    FunctionField } from 'react-admin';
import Grid from '@material-ui/core/Grid';
import { Typography } from '@material-ui/core';
import { useQueryWithStore, Loading, Error } from 'react-admin';
import DeleteIcon from "@material-ui/icons/Delete";
import { useState, useEffect, useMemo} from 'react';
import Tooltip from '@mui/material/Tooltip';
import { makeStyles } from '@material-ui/core/styles';
import DensityMediumIcon from '@mui/icons-material/DensityMedium';
import Button from '@material-ui/core/Button';
import { get_Conf } from '../Config';
import JoinModal from './JoinModal'
import { load_custom_component } from '../util';
import { RelatedInstance } from "./DynInstance";
import loadable from '@loadable/component'
import {InfoPopover} from '../util'

const conf = get_Conf();


const useStyles = makeStyles({
    join_attr: {color: '#3f51b5;'},
    delete_icon : {fill: "#3f51b5"},
    edit_grid : { width: "100%" },
    rel_icon: {paddingLeft:"0.4rem", color: "#666", marginBottom:"0px"}
});


const RelLabel = ({text}) => {
    // Relationship column header label
    const classes = useStyles()

    let label = <Tooltip title={text + " Relationship"} placement="top-start" arrow>
                    <span style={{ display: "inline-flex"}}>
                            {text}
                            <DensityMediumIcon 
                                className={classes.rel_icon} style={{width: "0.7rem", height: "0.7rem", paddingTop: "0.5rem"}} 
                            />
                            
                    </span>
                </Tooltip>
    return label
}



const ShowField = ({ label, value }) => {
    if(value && !React.isValidElement(value) && typeof value == "object"){
        try{
            console.log(`Converting value :${value}`)
            value=JSON.stringify(value)
        }
        catch(err){
            console.log(`Invalid element value :${value}`)
            console.warn(err)
            value = <i>Value Error</i>
        }
    }
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


const TruncatedTextField = (props) => {
    
    const record = props.record // "record" is a prop received from the Datagrid
    const source = props.source
    if(!record || !source){
        return <span></span>
    }
    let value = record[source];
    if(value && !React.isValidElement(value) && typeof value == "object"){
        try{
            console.log(`Converting value :${value}`)
            value=JSON.stringify(value)
        }
        catch(err){
            console.log(`Invalid element value :${value}`)
            console.warn(err)
            value = "Value Error"
        }
    }
    if(!value || value.length < 128 || !value.slice || !value.slice instanceof Function){
        return <span>{value}</span>
    }
    return <span>{value.slice(0, 128) + "..." }</span>;
}


const JoinedField = ({attribute, join}) => {
    
    const record = useRecordContext();
    if(record?.attributes){
        Object.assign(record, record.attributes)
    }
    const rel_name = join.name;
    const target_resource = join.target
    const fk = join.fks.join('_')
    const user_key = conf.resources[join.target]?.user_key
    const user_component = conf.resources[join.target]?.user_component
    const id = record ? record[fk] : null
    //console.log({attribute}, {id})
    const { data, loading, error } = useQueryWithStore({ 
        type: 'getOne',
        resource: target_resource,
        payload: { id: id }
    });

    if(!record){
        return null
    }
    
    let item = data || record[rel_name]
    let label = item?.id || id
    
    if(!item){
        return null
    }
    if(user_component){
        // user_component: custom component
        label = load_custom_component(user_component, item)
    }
    else if(item.attributes && user_key){
        const target_col = attribute.relationship.target_resource.attributes.filter((col) => col.name == user_key)
        label = <span>{item.attributes[user_key] || item.id}</span>
    }
    else if (user_key in item){
        label = item[user_key]
        item.type = conf.resources[join.target]?.type
        item.attributes = item
    }
    
    const modal_content = <RelatedInstance instance={item} resource_name={join.target}/>
    return <JoinModal label={label} key={attribute.name} content={modal_content} resource_name={join.target}/>
}


export const attr_fields = (attributes, ...props) => {

    if(! attributes instanceof Array){
        console.warn("Invalid attributes", attributes)
        return []
    }
    
    const fields = attributes.map((attr) => {
            if (attr.hidden){
                return null;
            }
            if(attr.relationship?.direction == "toone"){
                const label_text = attr.label || attr.relationship.resource || attr.name
                const label = <RelLabel text={label_text} />
                return <JoinedField key={attr.name} attribute={attr} join={attr.relationship} label={label}/>
            }
            return AttrField({attribute: attr, ...props})
        }
    )
    return fields
}


const AttrField = ({attribute, ...props}) => {
    
    const component = attribute.component // component name to be loaded
    const style = attribute.style || {}
        
    let result = <TruncatedTextField source={attribute.name} key={attribute.name} sortBy={attribute.name} label={attribute.label || attribute.name} {...props}/>
    
    if(attribute.type?.toLowerCase() == "date"){
        result = <DateField source={attribute.name} key={attribute.name} style={style} locales={conf.settings.locale} {...props}/>
    }
    if(!component){
        return result
    }
    // component is specified => render the specified component
    try{
        const Component = loadable(() => import(`./Custom.js`), {
                resolveComponent: (components) => components[component],
        })
        result = <Component attribute={attribute}/>
    }
    catch(e){
        alert("Custom component error")
        console.error("Custom component error", e)
    }
    return result
}


export const ShowAttrField = ({attr, value}) => {
    const attr_name = attr.name
    const classes = useStyles();
    let label =  <InfoPopover label={attr.label || attr_name} content={attr.info}/>
    let field = <ShowField label={label} value={value}/>
    if(attr.relationship){
        // todo: make the onClick handler open the right tab
        const jf = <JoinedField key={attr.name} attribute={attr} join={attr.relationship} />
        const rel_label = <span style={{ display: "inline-flex"}}>
                                {label}
                                <DensityMediumIcon 
                                    className={classes.rel_icon} style={{width: "0.7rem", height: "0.7rem", paddingTop: "0.3rem"}}
                                />
                                
                    </span>
        field = <ShowField label={rel_label} value={jf} />       
    }
    return field
    //return <Tooltip title={" field"} placement="top-start" arrow>{field}</Tooltip>
}
