import React from "react";
import { Typography } from '@material-ui/core';
import {Pagination }  from 'react-admin'
import loadable from '@loadable/component'
import Popover from '@material-ui/core/Popover';


export const type2resource = (type, conf) => {
    for(let [resource_name, resource] of Object.entries(conf?.resources)){
        if(resource.type === type){
            return resource_name
        }
    }
    console.warn(`No resource for type "${type}`)
    return conf[type]
};


export const DynPagination = (props) => {
    return <Pagination rowsPerPageOptions={[10, 25, 50, 100]}
                perPage={props.perPage || 25 }
                {...props} />
}


export const load_custom_component = (component_name, item) => {

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
    return null
}


export const InfoPopover = ({label, content}) => {
    const [anchorEl, setAnchorEl] = React.useState(null);
  
    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };
  
    const handleClose = () => {
      setAnchorEl(null);
    };

    const showInfo = (event) => {
        setAnchorEl(event.currentTarget);   
    }
  
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;
  
    if(!content){
        return label
    }
    return (
      <div>
        <span onClick={handleClick} onMouseOver={showInfo}>
          {label}
        </span>
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          <Typography sx={{ p: 2 }}>{content}</Typography>
        </Popover>
      </div>
    );
}
