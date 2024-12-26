import React, { useEffect, useRef, useState } from "react";
import { TextInput, Link } from "react-admin";
import Typography from '@mui/material/Typography';


export const IterateProjectWGAI = ({handleCreate, recordRef, ...props}: {handleCreate: any, recordRef: any}) => {
  
    // TODO: CSRF token
    const paramsObject = {prompt : '', project_id : null};
    const [params, setParams] = useState(paramsObject);
    const [rows, setRows] = useState<number>(2);
    
    const handleChange = (event: React.SyntheticEvent) => {
        const prompt = event.target.value;
        setRows(Math.max(prompt.split('\n').length, 2))
        console.log('handleChange', prompt);
        paramsObject.prompt = prompt;
    }

    useEffect(() => {
      const hash = window.location.hash;
      if (hash && hash.includes('?')) {
        const queryString = hash.substring(hash.indexOf('?')); // Remove the leading '#'
        const searchParams = new URLSearchParams(queryString);
        
        for (const [key, value] of searchParams.entries()) {
          paramsObject[key] = value;
        }
        setParams(paramsObject);
        console.log('Iterating Project:', paramsObject);
        recordRef.current = { data: { parent_id: paramsObject.project_id, prompt: paramsObject.prompt}};
        recordRef.current.data.connection_string = ""
        handleCreate().then(() => {
          //recordRef.current = { data: { }};
        });
      }
    }, []);

    if(!params.prompt && !params.project_id){
        return <></>
    }

    return <>
            <Typography variant="h6">Iterate Project</Typography>
            <TextInput source="prompt" multiline fullWidth defaultValue={params.prompt} 
                       disabled rows={rows} 
                       onChange={(e) => handleChange(e)}  />
    </>
};


  