import React, { useState, useEffect } from 'react';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Create,TextInput, useCreate, SimpleForm, SaveButton, Toolbar, useNotify } from 'react-admin';
import { useFormContext } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Card, CardContent, IconButton, Container, Grid } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { WebGenAICreatePanel } from './WebGenAICreate';
import { useConf } from "../../Config";
import { CircularProgress } from '@mui/material';
import { ApiFabCreate } from './ApiFabCreate';

interface DiscreteSliderProps {
  complexity: number;
  setComplexity: (value: number) => void;
}

const DiscreteSlider: React.FC<DiscreteSliderProps> = ({ complexity, setComplexity }) => {
  const { getValues, setValue } = useFormContext();

  const valuetext = (value: number) => {
    setComplexity(value);
    setValue('complexity', value);
    return `${value}`;
  };

  return (
    <Box sx={{ width: 300 }}>
      <Typography>Complexity</Typography>
      <IconButton>
        <HelpOutlineIcon />
      </IconButton>
      <Slider
        onChange={(_, newValue) => setComplexity(newValue as number)}
        aria-label="Complexity"
        value={complexity}
        getAriaValueText={valuetext}
        valueLabelDisplay="auto"
        step={1}
        marks
        min={2}
        max={25}
      />
    </Box>
  );
};

interface ApiCreateToolbarProps {
  setCreateStatus: (status: any) => void;
}

const ApiCreateToolbar: React.FC<ApiCreateToolbarProps> = ({ setCreateStatus }) => {
  const notify = useNotify();
  const onSuccess = (data: any) => {
    notify('ra.notification.created');
    const redirectLoc = `/${data.id || ''}/show`;
    console.log('redirect to', redirectLoc, data);
    setCreateStatus(data);
  };

  return (
    <Toolbar>
      <SaveButton
        label="Create API"
        mutationOptions={{ onSuccess }}
        type="button"
        icon={<AddBoxIcon />}
      />
    </Toolbar>
  );
};

interface CreateStatusProps {
  createStatus: any;
}

const CreateStatus: React.FC<CreateStatusProps> = ({ createStatus }) => {
  const [data, setData] = useState<string | null>(null);
  const [error, setError] = useState<any>(null);

  const fetchData = async () => {
    try {
      console.log('fetching', createStatus?.response);
      const response = await fetch(createStatus?.response || '');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const text = await response.text();
      setData(text);
    } catch (error) {
      setError('Error fetching data');
    }
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, [createStatus]);

  if (!createStatus) {
    return null;
  }

  return (
    <div>
      <Link to="/ApiDefinition">Go to API definitions</Link>
      <br />
      <pre>{JSON.stringify(createStatus, null, 4)}</pre>
      <Container maxWidth={false}>
        <Card>
          <CardContent>
            <Typography variant="h5">GPT Response</Typography>
            <Typography>{data}</Typography>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
};

const ApiCreate = () => {
  const [complexity, setComplexity] = useState<number>(4);
  const [promptVal, setPromptVal] = useState<string>('');
  const [create] = useCreate();
  const [createStatus, setCreateStatus] = useState<any>(null);

  const handleSubmit = async (data: any) => {
    data['complexity'] = String(complexity);
    console.log('Form data:', data);
    const result = await create('ApiDefinition', { data }, {
      onSuccess: ({ data }) => {
        console.log('Created record:', data);
      }
    });
    setCreateStatus(result);
  };

  return (
    <Create resource="ApiDefinition">
      <SimpleForm onSubmit={handleSubmit} toolbar={<ApiCreateToolbar setCreateStatus={setCreateStatus} />}>
        <Typography>Create your API-driven app by describing it in the prompt.</Typography>
        <TextInput source="prompt" multiline fullWidth value={promptVal} onChange={(e) => setPromptVal(e.target.value)} />
        <DiscreteSlider setComplexity={setComplexity} complexity={complexity} />
      </SimpleForm>
      <CreateStatus createStatus={createStatus} />
    </Create>
  );
};

export const ApiFab = () => {
  const attributes = [
    {label: "prompt", "name" : "prompt" , resource: {"name": "Project"}, type: 'textarea'},
    {label: "complexity", "name" : "complexity" , resource: {"name": "Project"}}
  ]

  return (
    <div className="MuiTypography-root jss4">
      <Typography variant="h4" align="center">
      <ApiFabCreate attributes={attributes} />
      </Typography>
    </div>
  );
};


const ApiDetails = ({record} : {record: any}) => {

  console.log('rendering', record)
  const projUrl = record.download
  return <Grid item xs={3}>
      <h2>App Details</h2>
      <Typography variant="body2" color="textSecondary" component="p">
          Name
        </Typography>
        <Typography variant="body2" component="p">
        {record.name}
        </Typography>
        
        <br/>
        <Typography variant="body2" color="textSecondary" component="p">
          {"Links"}
        </Typography>
        
        <Typography variant="body2" >
          <Link to={record.download} target='_blank'>Project Download</Link>
        </Typography>

        <Typography variant="body2" >
          <Link to={`https://apifabric.ai/${record.id}`} >API Swagger</Link>
        </Typography>
        
        <Typography variant="body2" >
          <Link to={record?.download?.replace('.tgz','').replace('ALP_','gen_')} target='_blank'>Project Files</Link>
        </Typography>
        
        <br/>
        <Typography variant="body2" color="textSecondary" component="p">
          {"Prompt"}
        </Typography>
        
        <Typography variant="body2" >
          {record.prompt}
        </Typography>
        
        <br/>
        <Typography variant="body2" color="textSecondary" component="p">
          {"Complexity"}
        </Typography>
        
        <Typography variant="body2" >
          {record.complexity}
        </Typography>
        
        <br/>
        <Typography variant="body2" color="textSecondary" component="p">
          {"Description"}
        </Typography>
        
        <Typography variant="body2" >
          {record.description}
        </Typography>
        
        <br/>
        <Typography variant="body2" color="textSecondary" component="p">
          {"ID"}
        </Typography>
        
        <Typography variant="body2" >
          {record.id}
        </Typography>
        
        <Typography variant="body2" color="textSecondary" component="p">
          {"Created At"}
        </Typography>
        
        <Typography variant="body2" >
          {record.created_att}
        </Typography>
        
        <br/>
        <Typography variant="body2" color="textSecondary" component="p">
          {"Run project in container"}
        </Typography>
        
        <Typography variant="body2" >
        <code>docker run -p5656:5656 -it apilogicserver/api_logic_server bash -c "curl {record.download} | tar xvfz - ; ./run.sh"</code>
        </Typography>
  </Grid>
}

/*
 * Fetch the project config output generated by apifabric.ai when the project was created
 * this is not the admin.yaml
 */
const fetchGapiJsonConfig = async (projectId : string) => {
  const response = await fetch(`https://g.apifabric.ai/projects/gen_${projectId}/config.json`);
  const text = await response.text();
  try{
    const config = JSON.parse(text)
    return config;
  }
  catch(e){
    console.error('json parse error',text, e)
    return {}
  }
}

export const GApiFab = () => {
  const conf = useConf();
  const [apiConf, setApiConf] = useState<any>(null);

  const apiRoot = conf.api_root;
  const projectId = apiRoot?.split('/').pop();
  
  useEffect(() => {
    if(!apiConf && projectId){
      const intervalId = setInterval(() => fetchGapiJsonConfig(projectId!).then(c => setApiConf(c)), 1000);
      return () => clearInterval(intervalId);
    }
  }, [apiConf]);

  const details = apiConf ? <ApiDetails record={apiConf} /> : <CircularProgress/>
  return (
    <>
      {details}
    </>
  );
};

