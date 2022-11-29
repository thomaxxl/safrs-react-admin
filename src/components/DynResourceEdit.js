import {
  Edit
} from "react-admin";
import { useRefresh } from 'react-admin';
import { useNotify, useRedirect } from 'react-admin';
import { useNavigate } from "react-router-dom"
import AttrForm from "./AttrForm.js";



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
        const navigate = useNavigate();

        const onFailure = (error) => {
            notify(`Error Saving Changes`,  { type: 'warning' })
            redirect('edit', props.basePath, props.id);
            refresh();
        }

        const onSuccess = () => {
            notify(`Changes Saved`);
            navigate(-1)
            refresh();
        }
        
        refresh()

        return <DynEdit {...props} attributes={attributes} onFailure={onFailure} onSuccess={onSuccess}  mutationMode="pessimistic" />
        
    }
    return Result;
}
