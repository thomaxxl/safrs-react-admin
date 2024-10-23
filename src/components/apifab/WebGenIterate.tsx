import React, { useEffect, useRef, useState } from "react";
import DynInput from "../DynInput";
import {
  SimpleForm,
  useDataProvider
} from "react-admin";
import { useRedirect, useRefresh, useNotify, TextInput, Link } from "react-admin";
import Grid from "@mui/material/Grid";
import { redirect, useLocation } from "react-router";
import { useFormContext } from "react-hook-form";
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import { Card, CardContent, IconButton, Container, Box } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { attributes } from "../types/SraTypes"
import { ProjectCreateToolbar } from "./ApiFabCreate";
import {WebGenAICreatePanel} from "./WebGenAICreate";


export const IterateProjectWGAI = ({handleCreate, recordRef, ...props}: {handleCreate: any, recordRef: any}) => {
  
  // TODO: CSRF token
  const paramsObject = {prompt : '', project_id : null};
  const [params, setParams] = useState(paramsObject);
  
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('?')) {
      const queryString = hash.substring(hash.indexOf('?')); // Remove the leading '#'
      const searchParams = new URLSearchParams(queryString);
      
      for (const [key, value] of searchParams.entries()) {
        paramsObject[key] = value;
      }
      setParams(paramsObject);
      console.log(paramsObject)
      recordRef.current = { data: { parent_id: paramsObject.project_id, prompt: paramsObject.prompt}};
      recordRef.current.data.connection_string = ""
      handleCreate().then(() => {
        //recordRef.current = { data: { }};
      });
    }
  }, []);
  
//   return (
//     <Card sx={{ p: 3 }}>
//       <Typography variant="h6">Iterate Project</Typography>
//       <pre>{JSON.stringify(params, null, 2)}</pre>
//     </Card>
//   );

    if(!params.prompt && !params.project_id){
        return <></>
    }

    return <>
            <Typography variant="h6">Iterate Project</Typography>
            <TextInput source="prompt" multiline fullWidth defaultValue={params.prompt} disabled />
    </>
};


  