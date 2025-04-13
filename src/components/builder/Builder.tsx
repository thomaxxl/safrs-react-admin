import React, { useEffect, useState } from 'react';
import { Box, Container, Toolbar, Typography, TextField, Button } from '@mui/material';
import { MenuItem, FormControl, Select, InputLabel, Paper, Card, CardContent, Divider, Grid, CircularProgress } from '@mui/material';
import { styled } from '@mui/system';
import { useConf } from '../../Config.ts';
import { useDataProvider } from 'react-admin';
import { LiveProvider, LiveEditor, LivePreview, LiveError } from "react-live";
import Test from './Test.tsx';
import PromptBuilder from './PromptBuilder.tsx';

// const LodgingComponent = ({ data }) => {
//     return <Container>
//             <Paper style={{ padding: 16, marginBottom: 16 }}>
//                 <Typography variant="h4">{data.name}</Typography>
//                 <Typography variant="subtitle1">Type: {data.ja_type}</Typography>
//                 <Typography variant="body1">Capacity: {data.capacity}</Typography>
//                 <Typography variant="body1">Town: {data.town.name}</Typography>
//                 <Typography variant="body2">Location: {data.town.location}</Typography>
//             </Paper>
//         </Container>

// };

// const SupplierOrderComponent = ({ data }) => {
//     return (
//         <Container>
//             <Paper style={{ padding: 16, marginBottom: 16 }}>
//                 <Typography variant="h4">Order Details</Typography>
//                 <Typography variant="subtitle1">Order ID: {data.id}</Typography>
//                 <Typography variant="subtitle1">Order Type: {data.ja_type}</Typography>
//                 <Typography variant="subtitle1">Order Date: {data.order_date}</Typography>
//                 <Typography variant="subtitle1">Quantity Ordered: {data.quantity_ordered}</Typography>
                
//                 <Typography variant="h5" style={{ marginTop: 16 }}>Ingredient Details</Typography>
//                 <Typography variant="subtitle1">Ingredient ID: {data.ingredient.id}</Typography>
//                 <Typography variant="subtitle1">Ingredient Name: {data.ingredient.name}</Typography>
                
//                 <Typography variant="h5" style={{ marginTop: 16 }}>Supplier Details</Typography>
//                 <Typography variant="subtitle1">Supplier ID: {data.supplier.id}</Typography>
//                 <Typography variant="subtitle1">Supplier Name: {data.supplier.name}</Typography>
//                 <Typography variant="subtitle1">Supplier Contact: {data.supplier.contact_info}</Typography>
//             </Paper>
//         </Container>
//     );
// };

const SectionBox = styled(Box)(({ theme }) => ({
    my: theme.spacing(4),
    minHeight: '80vh',
}));

const rawCode = `<>
<Typography variant="h6">{resourceName}</Typography>
        {items.map((item) => (
            <Typography key={item.id} variant="body1">
                <b>{item[label] || item.name || item.id}</b>
                <pre>{JSON.stringify(item, null,4)}</pre>
            </Typography>
        ))}
</>`;

const itemCode = `<>
<Card variant="outlined" sx={{ maxWidth: 600, m: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          FlightCrew Details
        </Typography>

        {/* Crew Member Section */}
        <Box mb={2}>
          <Typography variant="h6" gutterBottom>Crew Member</Typography>
          <Typography variant="body1"><strong>Name:</strong> {item.crew_member.name}</Typography>
          <Typography variant="body1"><strong>Role:</strong> {item.crew_member.role}</Typography>
        </Box>

        <Divider />

        {/* Flight Section */}
        <Box mt={2}>
          <Typography variant="h6" gutterBottom>Flight Details</Typography>
          <Typography variant="body1"><strong>Flight Number:</strong> {item.flight.number}</Typography>
          <Typography variant="body1"><strong>Departure Time:</strong> {item.flight.departure_time}</Typography>
          <Typography variant="body1"><strong>Arrival Time:</strong> {item.flight.arrival_time}</Typography>
          <Typography variant="body1"><strong>Origin Airport ID:</strong> {item.flight.origin_airport_id}</Typography>
          <Typography variant="body1"><strong>Destination Airport ID:</strong> {item.flight.destination_airport_id}</Typography>
        </Box>
      </CardContent>
    </Card>
  
</>`;

const funcCode = ``;


const GenericSection = ({ resourceName, templateName }: {  resourceName: string, templateName: string }) => {

    const dataProvider = useDataProvider();
    const conf = useConf();
    const [ items, setItems ] = useState<any[]>([]);
    const [ code, setCode ] = useState<string>(localStorage.getItem("builderCode") || rawCode);
    const item = items[0] || {};
    const label = conf?.resources && conf?.resources[resourceName].user_key || resourceName;
    const scope = { React, useEffect, useState, Button, Typography, SectionBox, resourceName, 
                    dataProvider, items, setItems, label, conf, Container, Paper, Toolbar, 
                    TextField, MenuItem, FormControl, Select, InputLabel, CircularProgress,
                    Card, CardContent, Divider, Grid,  Box, item
                 };
    

    useEffect(() => {
        dataProvider.getList(resourceName, {
            pagination: { page: 1, perPage: 100 },
            //meta: { include: ["flight.destination_airport"]}
        })
        .then(response => {
            setItems(response?.data || [] );
        })
        .catch(error => {
            console.error("Error fetching page:", error);
        });
    },[resourceName])

    if(!conf.resources){
        return <span>No resources</span>
    }

    console.log("Resource", resourceName);
    console.log("Items", items);
    
    return (
      <SectionBox>
        {/* <Typography variant="h6">{resourceName}</Typography>
        {items.map((item) => (
            <Typography key={item.id} variant="body1">
                <b>{item[label] || item.name || item.id}</b>
                <code>{JSON.stringify(item, null,4)}</code>
                
            </Typography>
        ))}  */}
        <Typography>
        <LiveProvider code={code} scope={scope} noInline>
            <div className="grid grid-cols-2 gap-4">
                <LiveEditor className="font-mono" />
                <LivePreview />
                <LiveError className="text-red-800 bg-red-100 mt-2" />
            </div>
            </LiveProvider>
        </Typography>
      </SectionBox>
    );
};


const ResourceEditor = ({ setSelectedResource, setSelectedTemplate }: { setSelectedResource: any, setSelectedTemplate: any }) => {
    const conf = useConf();
    const [resourceName, setResourceName] = React.useState('');
    const [templateName, setTemplateName] = React.useState('');
    const resources = conf.resources || {};
    const resourceNames = Object.entries(resources).filter(([key, value]) => !value.hidden).map(([key, value]) => key);
    const templateNames = [ "Raw", "Gallery", "List", "Tiles", "Table", "Form", "Markdown" ];

    const handleChangeResource = (event: { target: { value: React.SetStateAction<string>; }; }) => {
        setSelectedResource(event.target.value);
        setResourceName(event.target.value);
    };

    const handleChangeTemplate = (event: { target: { value: React.SetStateAction<string>; }; }) => {
        //setSelectedResource(event.target.value);
        setTemplateName(event.target.value);
    };

    return <>
        <FormControl variant="outlined" sx={{width: "20em"}}>

            <InputLabel id="resource-select-label">Resource</InputLabel>
            <Select
                labelId="resource-select-label"
                id="resource-select"
                value={resourceName}
                onChange={handleChangeResource}
                label="Resource"
            >
                {resourceNames.map((name, index) => (
                    <MenuItem key={index} value={name}>
                        {name}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>

        <FormControl variant="outlined" sx={{width: "20em", paddingLeft: "1em"}}>
            <InputLabel id="Template-select-label">Template</InputLabel>
            <Select
                labelId="Template-select-label"
                id="template-select"
                value={templateName}
                onChange={handleChangeTemplate}
                label="Resource"
            >
                {templateNames.map((name, index) => (
                    <MenuItem key={index} value={name}>
                        {name}
                    </MenuItem>
                ))}
            </Select>

        </FormControl>
        </>

}

const Builder = () => {

    const [ selectedResource, setSelectedResource ] = useState<string | null>(null);
    const [ selectedTemplate, setSelectedTemplate ] = useState<string>("Raw");
    
    return <>
        <ResourceEditor setSelectedResource={setSelectedResource} setSelectedTemplate={setSelectedTemplate} />
        <hr/>
        {
            selectedResource && <GenericSection resourceName={selectedResource} templateName={selectedTemplate} />
        }
        <hr/>
        <Button variant="outlined" onClick={() => alert('TBD')}>Save Section</Button>
        </>
}

const BuilderRouter = () => {
    if(document.location.hash.includes("prompt=true")){
        return <PromptBuilder/>
    }
    if(document.location.hash.includes("test=true")){
        return <Test/>
    }
    // if(document.location.hash.includes("openai=true")){
    //     return <OpenAIComponent />
    // }
    return <Builder />
}

export default BuilderRouter;
