import React from "react";
import { useState, useMemo} from 'react';
import { Resource} from 'react-admin';
import {
  Edit
} from "react-admin";
import { useRefresh } from 'react-admin';
import { useDataProvider } from 'react-admin';
import { useNotify, useRedirect } from 'react-admin';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from "react-router-dom";
import AttrForm from "./AttrForm.js";

const useStyles = makeStyles({
    join_attr: {color: '#3f51b5;'},
    delete_icon : {fill: "#3f51b5"},
    edit_grid : { width: "100%" },
    rel_icon: {paddingLeft:"0.4rem", color: "#666", marginBottom:"0px"}
});

const DynEdit = (props) => {


    return <Edit {...props}>
                <AttrForm attributes={props.attributes} isInserting={true} />
            </Edit>
}

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

        return <DynEdit {...props} attributes={attributes} onFailure={onFailure} onSuccess={onSuccess}  mutationMode="pessimistic" />
        
    }
    return Result;
}
