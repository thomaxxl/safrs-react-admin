/* eslint-disable no-eval */
/* eslint-disable no-throw-literal */
import React, { useEffect, useRef, useState } from "react";
import DynInput from "../DynInput";
import {
  SimpleForm,
  useDataProvider,
  useCreate
} from "react-admin";
import { useRedirect, useRefresh, useNotify, TextInput, Link } from "react-admin";
import Grid from "@mui/material/Grid";
import { redirect, useLocation } from "react-router";
import { useFormContext } from "react-hook-form";
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import { Card, CardContent, IconButton, Container, Box, Checkbox } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { attributes } from "../types/SraTypes"
import { ProjectCreateToolbar } from "./ApiFabCreate";
import {IterateProjectWGAI} from "./WebGenIterate";
import { UnthemedCollapsAccordion } from "../util/Accordion";

const helpTextStyle = {
    fontStyle: 'italic',
    fontSize: '0.8em',
    color: '#444'
}

interface DiscreteSliderProps {
    complexity: number;
    setComplexity: (value: number) => void;
}
  
const DiscreteSlider: React.FC<DiscreteSliderProps> = ({ complexity, setComplexity }) => {
    const { getValues, setValue } = useFormContext();
    const [value, setComplexityValue] = useState<number>(complexity);
    const valuetext = (value: number) => {
      //setComplexity(value);
      setValue('complexity', value);
      return `${value}`;
    };

    useEffect(() => { setComplexity(value); },[value]);
  
    return (
      <Box sx={{ width: 300 }}>
        <Slider
          onChange={(_, newValue) => setComplexityValue(newValue as number)}
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


export const CreateProjectWGAI = ({
  attributes,
  fetchCount,
  toolBar,
  recordRef,
  handleCreate,
  iterate = false,  
  ...props
}: {
  attributes: [any];
  [key: string]: any;
  iterate?: boolean;
  handleCreate? : any;
}) => {
  
  const focusRef = useRef("");
  const [complexity, setComplexity] = useState<number>(12);
  const [promptVal, setPromptVal] = useState<string>('');
  const [nameVal, setNameVal] = useState<string>('');
  const [complexityHelpVal, setComplexityHelpVal] = useState<string>('');
  const [promptHelpVal, setPromptHelpVal] = useState<any>('');
  const defaultPromptLabel = 'Describe your app, for example "car dealership"';
  const [promptLabel, setPromptLabel] = useState<any>(defaultPromptLabel);
  const [renderSwitch, setRenderSwitch] = useState([]);
  
  const setPromptRef = (value: string) => {
    const name = "prompt"
    setPromptVal(value)
    focusRef.current = name;
    recordRef.current = { data: { ...recordRef.current.data, [name]: value.toString() } };
    recordRef.current.data.connection_string = ""
    recordRef.current.data.parent_id = null
    const recordsArray = attributes.map((attr: attributes) => attr.name);
    if(value){
      setPromptLabel("Prompt")
    }
    else{
      setPromptLabel(defaultPromptLabel)
    }
    // setRenderSwitch((previousState: any) => {
    //   if (recordsArray.length === previousState.length) {
    //     return previousState;
    //   }
    //   return recordsArray;
    // });
  };

  const setComplexityRef = (value: number) => {
    const name = "complexity"
    setComplexity(value)
    focusRef.current = name;
    recordRef.current = { data: { ...recordRef.current.data, [name]: value.toString() } };
    const recordsArray = attributes.map((attr: attributes) => attr.name);
    // setRenderSwitch((previousState: any) => {
    //   if (recordsArray.length === previousState.length) {
    //     return previousState;
    //   }
    //   return recordsArray;
    // });
  };

  const setNameRef = (value: string) => {
        const name = "name"
        setNameVal(value)
        focusRef.current = name;
        recordRef.current = { data: { ...recordRef.current.data, [name]: value.toString() } };
        const recordsArray = attributes.map((attr: attributes) => attr.name);
        // setRenderSwitch((previousState: any) => {
        //   if (recordsArray.length === previousState.length) {
        //     return previousState;
        //   }
        //   return recordsArray;
        // });
      };

  const showComplexityHelp = () => {
    if(complexityHelpVal){
        setComplexityHelpVal("")
    }
    else{
        setComplexityHelpVal('Number of data tables and corresponding API resource endpoints generated for the app.')
    }
  }
  
  const showPromptHelp = () => {
    if(promptHelpVal){
        setPromptHelpVal("")
    }
    else{
        const promptHelpValTxt = <>
        Example: "todo list", or "holiday planner". &nbsp;
        <Link to="https://apilogicserver.github.io/Docs/WebGenAI/" target="_blank">Documentation</Link>
        </>
        setPromptHelpVal(promptHelpValTxt)
    }
  }

  
  if(iterate){
    
    return <SimpleForm toolbar={toolBar}>
            <IterateProjectWGAI recordRef={recordRef} handleCreate={handleCreate} {...props} />
          </SimpleForm>
  }
  return <>
      <SimpleForm toolbar={toolBar}>
          <TextInput source="name" label="Project name" sx={{width: "9em"}} onChange={(e) => setNameRef(e.target.value)} />

          <Typography>Create your system by describing it in the prompt.
            <IconButton onClick={showPromptHelp} ><HelpOutlineIcon sx={{
                width: '0.85rem',
                height: '0.85rem' }}
            /></IconButton>
            <span style={helpTextStyle}>{promptHelpVal}</span>
          </Typography>
          
          <TextInput source="prompt" label={promptLabel} multiline  rows={3} fullWidth value={promptVal} onClick={()=>setPromptLabel("Prompt")} onChange={(e) => setPromptRef(e.target.value)} />
          
          <Box sx={{width: "100%", textAlign:"left", fontSize: "200px"}}>
          <Typography>
            <UnthemedCollapsAccordion title="Advanced Settings" defaultExpanded={false} sx={{backgroundColor: "transparent", fontSize: "1.08rem"}}>
                Data Model Size
                <IconButton  onClick={showComplexityHelp} ><HelpOutlineIcon sx={{
                    width: '0.85rem',
                    height: '0.85rem' }}/></IconButton> 
                <span style={helpTextStyle}>{complexityHelpVal}</span>
                
                <DiscreteSlider setComplexity={setComplexityRef} complexity={complexity} />
                <br/>
                <Checkbox defaultChecked /> Push to Github
                <br/>
                <Checkbox /> Create & update timestamping
                <br/>
                <Checkbox /> Optimistic locking
              
            </UnthemedCollapsAccordion>
          </Typography>
          </Box>

      </SimpleForm>
  </>
};


interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export const WebGenAICreatePanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  const dataProvider = useDataProvider();

  useEffect(() => {
    // fetch /Project to verify the user is authenticated, if this fails the user will be redirected to the login page
    dataProvider.getList('Project', { pagination: { page: 1, perPage: 1 }, sort: { field: 'id', order: 'DESC' }, filter: {} })
  }, [dataProvider]);
    
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}