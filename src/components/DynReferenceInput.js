
import {
    ReferenceInput,
    AutocompleteInput,
    useCreate,
    useNotify,
    Button,
    SaveButton,
    FormWithRedirect,
    useRedirect,
    useRefresh
} from 'react-admin'
import { useForm } from 'react-final-form';
import React, { useState, useCallback, memo } from 'react';
import { useFormState } from 'react-final-form';
import { makeStyles } from '@material-ui/core/styles';
import IconContentAdd from '@material-ui/icons/Add';
import IconCancel from '@material-ui/icons/Cancel';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Grid from '@material-ui/core/Grid';
import { useConf } from '../Config.js'
import QuickPreviewButton from './QuickPreviewButton.js'
import DynInput from './DynInput.js';


function QuickCreateButton({ onChange, resource_name, cb_set_id, basePath }) {
    const [renderSwitch, setRenderSwitch] = useState([])
    const [showDialog, setShowDialog] = useState(false);
    const [create, { loading }] = useCreate(resource_name);
    const notify = useNotify();
    const form = useForm();
    const conf = useConf()
    const redirect = useRedirect()
    const refresh = useRefresh()
    const resource = conf.resources[resource_name]
    const attributes = resource?.attributes || []
    const setRecords = (record) => {
        const recordsArray = attributes.filter(attr => attr.show_when && (() => {
            try { return (eval(attr.show_when)) } catch (e) {
                console.log(e)
                notify('Error occurred while evaluating \'show_when\' : Invalid Expression', { type: 'error' })
                redirect(basePath)
                refresh()
            }
        })()).map((attr) => attr.name)
        setRenderSwitch(previousState => {
            if (recordsArray.length === previousState.length) {
                return previousState
            } return recordsArray
        })
    }


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
                                    {attributes.filter(attr => !attr.relationship).map((attr) => <DynInput renderSwitch={renderSwitch} setRecords={setRecords} attribute={attr} key={attr.name} />)}
                                </Grid>
                                <Grid container spacing={2} margin={2} m={40} xs={4}>
                                    {attributes.filter(attr => attr.relationship).map((attr) => <DynInput renderSwitch={renderSwitch} setRecords={setRecords} attribute={attr} key={attr.name} xs={8} />)}
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
                <AutocompleteInput optionText={props.optionText} key={props.source} onChange={(evt) => setSelected(evt.target.value)} />
            </ReferenceInput>
        </Grid>
        <Grid item xs={2} spacing={4} margin={5} >
            <QuickCreateButton onChange={handleChange} resource_name={props.reference} cb_set_id={props.cb_set_id} basePath={props.basePath} />
            {selected && <QuickPreviewButton id={props.selected} resource_name={props.reference} />}
        </Grid>
    </>
};



export default memo(DynReferenceInput);