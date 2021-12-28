import { React } from "react";
import {
    Create,
    SimpleForm,
    PasswordInput,
    TextInput
} from "react-admin"
import Grid from '@material-ui/core/Grid';
import DynInput from "./DynInput";
import {get_Conf} from '../Config.js'

const conf = get_Conf();

export const CreateUser  = ({resource_name, ...props}) => {
    
    const resource = conf.resources[resource_name]

    return <Create {...props}>
                <SimpleForm>
                    <Grid container spacing={3} margin={5} m={400} style={{ width: "40%" }}>
                        {resource.attributes.map((attr) => <Grid item xs={12} spacing={4} margin={5} > <TextInput source={attr.name} fullWidth /> </Grid> )}
                        <Grid item xs={12} spacing={4} margin={5} >
                            <PasswordInput label="Password" defaultValue="" fullWidth inputProps={{ autocomplete: 'current-password' }} />
                        </Grid>
                        <Grid item xs={12} spacing={4} margin={5} >
                            <PasswordInput label="Repeat Password" defaultValue="" fullWidth inputProps={{ autocomplete: 'current-password' }}/>
                        </Grid>
                    </Grid>
                </SimpleForm>
            </Create >
}

