import React, { useState, useEffect } from 'react';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Create,TextInput, useCreate, SimpleForm, SaveButton, Toolbar, useNotify } from 'react-admin';
import { useFormContext } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Card, CardContent, IconButton, Container } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AddBoxIcon from '@mui/icons-material/AddBox';

import { useConf } from "../Config";

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


const CreateStatus = ({createStatus}:{createStatus:any}) => {
    
console.log('createStatus',createStatus);

    const url = createStatus;
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            console.log('fetching', createStatus)
            const response = await fetch(createStatus);
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
  return (
    <div className="MuiTypography-root jss4">
      <Typography variant="h4" align="center">
        Generate API Logic Server Projects
      </Typography>
      <ApiCreate />
    </div>
  );
};

export const GApiFab = () => {
  const conf = useConf();
  const api_root = conf.api_root;
  const proj_id = api_root.split('/').pop();
  const proj_tgz = `https://g.apifabric.ai/projects/ALP_${proj_id}.tgz`;
  const proj_files = `https://g.apifabric.ai/projects/gen_${proj_id}`;

  return (
    <>
      Project ID : {proj_id}
      <ul>
        <li><a href={api_root}>Swagger API</a></li>
        <li><a href={proj_tgz}>Project Download</a></li>
        <li><a href={proj_files}>Browse Project Files</a></li>
        <li>Run project in container: <br /><code>docker run -p5656:5656 -it apilogicserver/api_logic_server bash -c "curl {proj_tgz} | tar xvfz - ; ./run.sh"</code></li>
      </ul>
    </>
  );
};
