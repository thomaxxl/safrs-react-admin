import {
    TextInput,
    DateInput,
    ReferenceInput,
    AutocompleteInput  
} from 'react-admin'
import Grid from '@material-ui/core/Grid';
import {get_Conf} from '../Config.js'

const conf = get_Conf();

const DynInput = ({attribute, resource}) => {

    let result = <TextInput source={attribute.name} fullWidth />
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
    }
    
    return <Grid item xs={4} spacing={4} margin={5} >{result}</Grid>
}

export default DynInput