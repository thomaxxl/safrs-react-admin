import * as React from "react";
import { useState, useEffect } from "react";
import Slider from '@mui/material/Slider';
import Typography from "@mui/material/Typography";
import Box from '@mui/material/Box';
import { TextInput, useCreate } from 'react-admin';
import { Create, SimpleForm, SaveButton, Toolbar, useRedirect, useNotify, useCreateController, NumberInput } from 'react-admin';
import { useInput } from 'react-admin';
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { Link } from 'react-router-dom';
import { Card, CardContent, IconButton, Container } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';


import { useConf } from "../Config";
import AddBoxIcon from '@mui/icons-material/AddBox';



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

  
// style={{display:'none'}}
export default function DiscreteSlider({complexity, setComplexity} : {complexity : number, setComplexity: any}) {

    const { getValues, setValue } = useFormContext();

    function valuetext(value: number) {
        setComplexity(value)
        setValue('complexity', value)
        return `${value}`;
    }

    return (
      <Box sx={{ width: 300 }}>
        Complexity
        
        <IconButton>
            <HelpOutlineIcon />
        </IconButton>
        <Slider
          onChange={(_, newValue) => setComplexity(newValue)}
          aria-label="Complexity"
          value={complexity}
          getAriaValueText={valuetext}
          valueLabelDisplay="auto"
          shiftStep={30}
          step={1}
          marks
          min={2}
          max={25}
        />
      </Box>
    );
  }

const ApiCreateToolbar = ({setCreateStatus}) => {

    const notify = useNotify();
    const onSuccess = (data : any) => {
        notify('ra.notification.created');
        const redirect_loc = `/${data.id || ''}/show`
        console.log('redirect to', redirect_loc, data);
        setCreateStatus(data)
    }
   
    return (
        <Toolbar>
            <SaveButton
                label="Create API"
                mutationOptions={{
                    onSuccess
                }}
                type="button"
                icon={<AddBoxIcon />} 
            />
        </Toolbar>
    );
};


const CreateStatus = ({createStatus}:{createStatus:any}) => {

    const url = createStatus.response;
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            console.log('fetching', createStatus.response)
            const response = await fetch(createStatus.response);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.text();
            //console.log(data)
            setData(data);
        } catch (error) {
            setData('...')
        }
    };

    useEffect(() => {
        // Fetch data initially
        fetchData();
        // Set up interval to fetch data every 5 seconds
        const intervalId = setInterval(fetchData, 5000);
        // Clean up interval on component unmount
        return () => clearInterval(intervalId);
    }, []);

    
    if(!createStatus){
        return <></>
    }

    return <div>
        <Link to="/ApiDefinition">Go to api definitions</Link>
        <br/>
        <pre>
        {JSON.stringify(createStatus,null,4)}
        </pre>
        <Container maxWidth={false}>
            <Card>
                <CardContent>
                    <Typography variant="h5" component="div">
                        GPT Response
                    </Typography>
                </CardContent>
                <CardContent>
                    <Typography component="div">
                        {data}
                    </Typography>
                </CardContent>
                
            </Card>
        </Container>
    </div>
}


const ApiCreate = () => {
    const [complexity, setComplexity] = useState(4);
    const [promptVal, setPromptVal] = useState("");
    const [result, setResult] = useState("");
    const [create] = useCreate();
    const [createStatus, setCreateStatus] = useState(false);

    const handleSubmit = async (data : any) => {
        
        data['complexity'] = String(complexity)
        console.log('Form data:', data);
        
        const result = await create('ApiDefinition', 
            { data },
            {
                onSuccess: ({ data }) => {
                    console.log('Created record:', data);
                    // Update the form field with the response data   
                }
            })
        setResult(result)
    }
    
    const changeComplexity = (val: number) => {
        setComplexity(val)
    }

    return <>
        <Create resource="ApiDefinition" >
            <SimpleForm onSubmit={handleSubmit}  toolbar={<ApiCreateToolbar  setCreateStatus={setCreateStatus}/>} >
            Create your api-driven app by describing it in the prompt.
            
                <TextInput source="prompt" multiline fullWidth value={promptVal}/>
                <DiscreteSlider setComplexity={changeComplexity} complexity={complexity}/>
            </SimpleForm> 
        </Create>
        <CreateStatus createStatus={createStatus} />
    </>
};




export const ApiFab = () => {

    return <div className="MuiTypography-root jss4">
        <Typography variant="h4" align="center">
        Generate API Logic Server Projects
        </Typography>
        <ApiCreate/>    
    </div>;
}