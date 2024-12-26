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
import { IterateProjectWGAI } from "./WebGenIterate";
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
        setValue('complexity', value);
        return `${value}`;
    };

    useEffect(() => { setComplexity(value); }, [value]);

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
    handleCreate?: any;
}) => {

    const focusRef = useRef("");
    const [complexity, setComplexity] = useState<number>(12);
    const [promptVal, setPromptVal] = useState<string>('');
    const [logicPromptVal, setLogicPromptVal] = useState<string>('');
    const [rows, setRows] = useState<number>(3);
    const [logicRows, setLogicRows] = useState<number>(3);
    const [nameVal, setNameVal] = useState<string>('');
    const [complexityHelpVal, setComplexityHelpVal] = useState<string>('');
    const [logicHelpVal, setLogicHelpVal] = useState<any>('');
    const [promptHelpVal, setPromptHelpVal] = useState<any>('');
    const defaultPromptLabel = 'Describe your app, for example "car dealership"';
    const [promptLabel, setPromptLabel] = useState<any>(defaultPromptLabel);
    const [enableSecurity, setEnableSecurity] = useState(false);
    const [ enableSpa, setEnableSpa ] = useState(true);

    const setPromptRef = (value: string) => {
        const name = "prompt"
        setPromptVal(value)
        focusRef.current = name;
        recordRef.current = { data: { ...recordRef.current.data, [name]: value } };
        recordRef.current.data.connection_string = ""
        recordRef.current.data.parent_id = null
        if (value) {
            setPromptLabel("Prompt")
        }
        else {
            setPromptLabel(defaultPromptLabel)
        }
        setRows(Math.max(value.split('\n').length, 2) + 1);
    };

    const setLogicPromptRef = (value: string) => {
        const name = "prompt"
        setLogicPromptVal(value)
        const newPrompt = promptVal + '\nUse LogicBank to: ' + value
        focusRef.current = name;
        recordRef.current = { data: { ...recordRef.current.data, [name]: newPrompt } };
        setLogicRows(Math.max(value.split('\n').length, 2) + 1);
    };

    const setComplexityRef = (value: number) => {
        const name = "complexity"
        setComplexity(value)
        focusRef.current = name;
        recordRef.current = { data: { ...recordRef.current.data, [name]: value.toString() } };
        const recordsArray = attributes.map((attr: attributes) => attr.name);
    };

    const setNameRef = (value: string) => {
        const name = "name"
        setNameVal(value)
        focusRef.current = name;
        recordRef.current = { data: { ...recordRef.current.data, [name]: value.toString() } };
        const recordsArray = attributes.map((attr: attributes) => attr.name);
    };

    const showComplexityHelp = () => {
        if (complexityHelpVal) {
            setComplexityHelpVal("")
        }
        else {
            setComplexityHelpVal('Number of data tables and corresponding API resource endpoints generated for the app.')
        }
    }

    const showLogicHelp = () => {
        if (complexityHelpVal) {
            setLogicHelpVal("")
        }
        else {
          const promptHelpValTxt = <>
                Describe the business logic for the app. &nbsp;
                <Link to="https://apilogicserver.github.io/Docs/WebGenAI/" target="_blank">Documentation</Link>
            </>
            setLogicHelpVal(promptHelpValTxt)
        }
    }

    const showPromptHelp = () => {
        if (promptHelpVal) {
            setPromptHelpVal("")
        }
        else {
            const promptHelpValTxt = <>
                Example: "todo list", or "holiday planner". &nbsp;
                <Link to="https://apilogicserver.github.io/Docs/Logic/" target="_blank">Documentation</Link>
            </>
            setPromptHelpVal(promptHelpValTxt)
        }
    }

    const doEnableSecurity = (e: any) => {
        const name = "security"
        const checked = e.target.checked
        setEnableSecurity(checked)
        recordRef.current = { data: { ...recordRef.current.data, [name]: checked } };
    }

    const doEnableSpa = (e: any) => {
        const name = "create_spa"
        const checked = e.target.checked
        setEnableSpa(checked)
        recordRef.current = { data: { ...recordRef.current.data, [name]: checked } };
    }

    if (iterate) {
        return <SimpleForm toolbar={toolBar}>
            <IterateProjectWGAI recordRef={recordRef} handleCreate={handleCreate} {...props} />
        </SimpleForm>
    }

    const settingsTitle = <><strong>Advanced Settings</strong><span style={helpTextStyle}> Logic, security, model size etc.</span></>
    return <>
        <SimpleForm toolbar={toolBar}>
            <TextInput source="name" label="Project name" sx={{ width: "9em", display: "none" }} onChange={(e) => setNameRef(e.target.value)} />

            <Typography>Create your system by describing it in the prompt.
                <IconButton onClick={showPromptHelp} ><HelpOutlineIcon sx={{
                    width: '0.85rem',
                    height: '0.85rem'
                }}
                /></IconButton>
                <span style={helpTextStyle}>{promptHelpVal}</span>
            </Typography>

            <TextInput source="prompt" label={promptLabel} multiline rows={rows} fullWidth value={promptVal} onClick={() => setPromptLabel("Prompt")} onChange={(e) => setPromptRef(e.target.value)} />

            <Box sx={{ width: "100%", textAlign: "left", fontSize: "200px" }}>

                <Typography>
                    <UnthemedCollapsAccordion title={settingsTitle} defaultExpanded={false} sx={{ backgroundColor: "transparent", fontSize: "1.08rem" }}>
                        Business Logic 
                        <IconButton onClick={showLogicHelp} ><HelpOutlineIcon sx={{
                            width: '0.85rem',
                            height: '0.85rem'
                        }} /></IconButton>
                        <span style={helpTextStyle}>{logicHelpVal}</span> 
                        <TextInput source="logicPrompt" label={"Logic Prompt"} multiline rows={logicRows} value={logicPromptVal} onChange={(e) => setLogicPromptRef(e.target.value)} />
                        Data Model Size
                        <IconButton onClick={showComplexityHelp} ><HelpOutlineIcon sx={{
                            width: '0.85rem',
                            height: '0.85rem'
                        }} /></IconButton>
                        <span style={helpTextStyle}>{complexityHelpVal}</span>

                        <DiscreteSlider setComplexity={setComplexityRef} complexity={complexity} />
                        <br />
                        <Checkbox checked={enableSpa} onChange={e => doEnableSpa(e)}/> Create Landing Page
                        <br />
                        <Checkbox defaultChecked /> Push to Github
                        <br />
                        <Checkbox /> Create & update timestamping
                        <br />
                        <Checkbox /> Optimistic locking
                        <br />
                        <Checkbox checked={enableSecurity} onChange={e => doEnableSecurity(e)}/> Authentication & authorization
                        
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