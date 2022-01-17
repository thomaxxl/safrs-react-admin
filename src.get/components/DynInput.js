import {
    TextInput,
    DateInput,
    ReferenceInput,
    AutocompleteInput,
    NumberInput,
    SelectInput,
    required,
    useCreate,
    useNotify,
    Button,
    SaveButton,
    FormWithRedirect
} from 'react-admin'
import { useForm } from 'react-final-form';
import React, { useState, useCallback } from 'react';
import { useFormState } from 'react-final-form';
import { makeStyles } from '@material-ui/core/styles';
import IconContentAdd from '@material-ui/icons/Add';
import IconCancel from '@material-ui/icons/Cancel';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Grid from '@material-ui/core/Grid';
import {get_Conf} from '../Config.js'
import QuickPreviewButton from './QuickPreviewButton.js'
import get_Component from "../get_Component";

const conf = get_Conf();

function QuickCreateButton({ onChange, resource_name, cb_set_id }) {
    
    const [showDialog, setShowDialog] = useState(false);
    const [create, { loading }] = useCreate(resource_name);
    const notify = useNotify();
    const form = useForm();
    const resource = conf.resources[resource_name]
    const attributes = resource?.attributes || []

    const handleClick = () => {
        setShowDialog(true);
    };

    const handleCloseClick = () => {
        setShowDialog(false);
    };

    const handleSubmit = async values => {
        create(
            { payload: { data: values } },
            {
                onSuccess: ({ data }) => {
                    setShowDialog(false);
                    // Update the form to target the newly created item
                    // Updating the ReferenceInput value will force it to reload the available posts
                    form.change('id', data.id);
                    cb_set_id(data.id)
                    onChange();
                },
                onFailure: ({ error }) => {
                    notify(error.message, 'error');
                }
            }
        );
    };
    const title = `Create ${resource.type}`
    return (
        <>
            <Button onClick={handleClick} label="ra.action.create">
                <IconContentAdd />
            </Button>
            <Dialog
                fullWidth
                maxWidth="md"
                open={showDialog}
                onClose={handleCloseClick}
                aria-label={title}
            >
                <DialogTitle>{title}</DialogTitle>

                <FormWithRedirect
                    resource={resource_name}
                    save={handleSubmit}
                    render={({
                        handleSubmitWithRedirect,
                        pristine,
                        saving
                    }) => (
                        <>
                            <DialogContent>
                                <Grid container spacing={2} margin={2} m={40}>
                                {attributes.filter(attr => !attr.relationship).map((attr) => <DynInput attribute={attr} key={attr.name}/> )}
                                </Grid>
                                <Grid container spacing={2} margin={2} m={40} xs={4}>
                                {attributes.filter(attr => attr.relationship).map((attr) => <DynInput attribute={attr} key={attr.name} xs={8}/> )}
                                </Grid>
                            </DialogContent>
                            <DialogActions>
                                <Button
                                    label="ra.action.cancel"
                                    onClick={handleCloseClick}
                                    disabled={loading}
                                >
                                    <IconCancel />
                                </Button>
                                <SaveButton
                                    handleSubmitWithRedirect={
                                        handleSubmitWithRedirect
                                    }
                                    pristine={pristine}
                                    saving={saving}
                                    disabled={loading}
                                />
                            </DialogActions>
                        </>
                    )}
                />
            </Dialog>
        </>
    );
}


const useStyles = makeStyles({
    root: {
        display: 'flex',
        alignItems: 'center'
    }
});

const spySubscription = { values: true };

const DynReferenceInput = (props) => {
    const classes = useStyles();
    const [version, setVersion] = useState(0);
    const { values } = useFormState({ subscription: spySubscription });
    const [selected, setSelected] = useState(props.selected)
    const handleChange = useCallback((event) => setVersion(version + 1), [version]);
    
    return <>
            <Grid item xs={4} spacing={4} margin={5} >
                <ReferenceInput key={version} {...props}>
                    <AutocompleteInput  optionText={props.optionText} key={props.source} onChange={(evt) => setSelected(evt.target.value)} />
                </ReferenceInput>
            </Grid>
            <Grid item xs={2} spacing={4} margin={5} >
                <QuickCreateButton onChange={handleChange} resource_name={props.reference} cb_set_id={props.cb_set_id}/>
                {selected && <QuickPreviewButton id={props.selected} resource_name={props.reference}/> }
            </Grid>
        </>
};

const DynInput = ({attribute, resource, xs}) => {

    const label = attribute.label || attribute.name
    const input_props = {validate : attribute.required ? required() : false , label: label}
    
    const [selected_ref, setSelected_ref] = useState(false)
    const grid_wrap = (el) => <Grid item xs={xs | 4} spacing={4} margin={5} >{el}</Grid>
    const attr_type = attribute.type?.toLowerCase()
    let result = grid_wrap(<TextInput source={attribute.name} fullWidth  {...input_props}/>)

    if(attribute.component){
        const Component = get_Component(attribute.component)
        return <Component attr={attribute} mode="edit"/>
    }
    if(attr_type == "date"){
        result = grid_wrap(<DateInput source={attribute.name} fullWidth />)
    }
    if(attr_type == "number" || attr_type == "decimal"){
        result = grid_wrap(<NumberInput source={attribute.name} fullWidth={false}  {...input_props}/>)
    }

    if(attribute.relationship?.direction == "toone" && attribute.relationship.target){
        const search_cols = conf.resources[attribute.relationship.target].search_cols
        let optionText = ""
        
        if(!search_cols){
            console.error("no searchable attributes configured");
        }
        else if(search_cols.length == 0){
            console.warn(`no searchable attributes configured for ${attribute.relationship.target}`);
        }
        else{
            optionText = search_cols[0].name
        }
        /*result = <ReferenceInput source={attribute.name}
                                 label={`${attribute.relationship.name} (${attribute.name})`}
                                 reference={attribute.relationship.target}
                                 resource={attribute.relationship.resource}
                                 fullWidth>
                    <AutocompleteInput optionText={optionText} key={attribute.name} id={0}/>
                </ReferenceInput>*/
        const ri_props = {}
        if(selected_ref){
            ri_props['defaultValue'] = selected_ref
        }
        result = <DynReferenceInput 
                    source={attribute.name}
                    label={`${attribute.relationship.name} (${attribute.name})`}
                    reference={attribute.relationship.target}
                    resource={attribute.relationship.resource}
                    fullWidth
                    optionText={optionText}
                    cb_set_id={(v)=>{setSelected_ref(v)} }
                    allowEmpty={!attribute.required}
                    selected={selected_ref}
                    {...ri_props}
                    />
                    
    }
    
    return result
}

export default DynInput