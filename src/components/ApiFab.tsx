import * as React from "react";
import MuiAccordion from "@mui/material/Accordion";
import MuiAccordionSummary from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import { Create, SimpleForm, TextInput, useNotify, useRedirect } from 'react-admin';

import { useConf } from "../Config";


export const GApiFab = () => {
  const conf = useConf();
  const api_root = conf.api_root
  const proj_id = api_root.split('/').pop()
  const proj_tgz = `https://g.apifabric.ai/projects/ALP_${proj_id}.tgz`
  const proj_files = `https://g.apifabric.ai/projects/gen_${proj_id}`
  return <>
  Project ID : {proj_id}
  <ul>
    <li><a href={api_root} >Swagger API </a></li>
    <li><a href={proj_tgz} >Project Download </a></li>
    <li><a href={proj_files} >Browse Project Files </a></li>
    <li>Run project in container: <br/><code>docker run -p5656:5656 -it apilogicserver/api_logic_server bash -c "curl {proj_tgz} | tar xvfz - ; ./run.sh"</code></li>
</ul>
  </>;
}


const ApiCreate = () => {
    const notify = useNotify();
    const redirect = useRedirect();

    const onSuccess = (data) => {
        notify(`Creating API`);
        //redirect(`/ApiDefinition/${data.id}`);
        redirect(`/ApiDefinition`);
    };

    return <Create resource="ApiDefinition" mutationOptions={{ onSuccess }}>
        Create your api-driven app by describing it in the prompt.
        <SimpleForm>
            <TextInput source="prompt" multiline fullWidth />
        </SimpleForm>
    </Create>
};


export const ApiFab = () => {

    return <div className="MuiTypography-root jss4">
    <Typography variant="h4" align="center">
    Generate API Logic Server Projects
    </Typography>
    
    
    <ApiCreate/>

    
    </div>;
}