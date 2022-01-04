import {
    TextInput,
    DateInput,
    ReferenceInput,
    AutocompleteInput,
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
import AttrForm from './AttrForm.js'
import {get_Conf} from '../Config.js'

const conf = get_Conf();

function QuickCreateButton({ onChange, resource_name }) {
    
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
                    // Update the comment form to target the newly created post
                    // Updating the ReferenceInput value will force it to reload the available posts
                    form.change('post_id', data.id);
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

const PostReferenceInput = (props) => {
    const classes = useStyles();
    const [version, setVersion] = useState(0);
    const { values } = useFormState({ subscription: spySubscription });
    const handleChange = useCallback(() => setVersion(version + 1), [version]);

    return (
        <div className={classes.root}>
            <ReferenceInput key={version} {...props}>
                <AutocompleteInput optionText={props.optionText} key={props.source} />
            </ReferenceInput>

            <QuickCreateButton onChange={handleChange} resource_name={props.reference}/>
            {/*!!values.post_id && <PostQuickPreviewButton id={values.post_id} />*/}
        </div>
    );
};

const DynInput = ({attribute, resource, xs}) => {

    const input_props = {validate : attribute.required ? required() : false}

    let result = <TextInput source={attribute.name} fullWidth  {...input_props}/>
    if(attribute.type == "DATE"){
        result = <DateInput source={attribute.name} fullWidth />
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
        result = <ReferenceInput source={attribute.name}
                                 label={`${attribute.relationship.name} (${attribute.name})`}
                                 reference={attribute.relationship.target}
                                 resource={attribute.relationship.resource}
                                 fullWidth>
                    <AutocompleteInput optionText={optionText} key={attribute.name} />
                </ReferenceInput>
        result = <PostReferenceInput 
                    source={attribute.name}
                    label={`${attribute.relationship.name} (${attribute.name})`}
                    reference={attribute.relationship.target}
                    resource={attribute.relationship.resource}
                    fullWidth
                    optionText={optionText}
                    >
                    
                    </PostReferenceInput>
    }
    
    return <Grid item xs={xs | 4} spacing={4} margin={5} >{result}</Grid>
}

export default DynInput