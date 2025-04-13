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
import { set, useFormContext } from "react-hook-form";
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import { Card, CardContent, IconButton, Container, Box, Checkbox } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { attributes } from "../types/SraTypes"
import { ProjectCreateToolbar } from "./ApiFabCreate";
import { IterateProjectWGAI } from "./WebGenIterate";
import { UnthemedCollapsAccordion } from "../util/Accordion";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { useTranslate } from 'react-admin';


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

const demoPrompt = `Create a system with customers, orders, items and products.
Include a notes field for orders.
Use LogicBank to enforce business logic.
Use case: Check Credit
 1. The Customer's balance is less than the credit limit
 2. The Customer's balance is the sum of the Order amount_total where date_shipped is null
 3. The Order's amount_total is the sum of the Item amount
 4. The Item amount is the quantity * unit_price
 5. The Item unit_price is copied from the Product unit_price unit_price`

const DemoPrompt = ({setPromptVal, setDefaultPrompt, setName}: {setPromptVal: any, setDefaultPrompt: any, setName: any}) => {
    
    const [open, setOpen] = useState(document.location.hash.includes('demo=genai_demo'));
    const translate = useTranslate();
    

    const handleAgree = () => {
        setPromptVal(demoPrompt);
        setDefaultPrompt(demoPrompt);
        setName("genai_demo")
        setOpen(false);
    };

    const handleClose = () => {
        setOpen(false);
        setDefaultPrompt(' ');
    };

    return (
        <div>
            
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{"Demo Prompt"}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                    {translate('wg.demo.msg')}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                    {translate('wg.demo.start_new')}
                    </Button>
                    <Button onClick={handleAgree} color="primary" autoFocus>
                    {translate('wg.demo.start_demo')}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

interface TextInputPromptProps {
    source: string;
    label: string;
    rows?: number;
    defaultValue?: string;
    value?: string;
    onLabelClick?: () => void;
    onChange?: (value: string) => void;
    handleCreate: () => void;
}

const TextInputPrompt: React.FC<TextInputPromptProps> = ({
    source,
    label,
    rows = 4,
    defaultValue,
    value,
    onLabelClick,
    onChange,
    handleCreate
}) => {
    const [ defaultVal2, setDefaultVal2 ] = useState<string>(defaultValue||'');
    
    React.useEffect(() => {
        if(value === demoPrompt){
            handleCreate();
        }
    },[]);
    return (
        <TextInput
            source={source}
            label={label}
            multiline
            rows={rows}
            fullWidth
            defaultValue={defaultVal2}
            value={value}
            onClick={onLabelClick}
            onChange={(e) => onChange?.(e.target.value)}
        />
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
    handleCreate: () => void;
}) => {

    const translate = useTranslate();
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
    const defaultPromptLabel = translate('wg.create.prompt_label');
    const [promptLabel, setPromptLabel] = useState<any>(defaultPromptLabel);
    const [defaultPrompt, setDefaultPrompt] = useState<string>('');
    const [enableSecurity, setEnableSecurity] = useState(false);
    const [ enableSpa, setEnableSpa ] = useState(true);
    const [ enableDefaults, setEnableDefaults ] = useState(true);
    const [ buildOntimize, setBuildOntimize ] = useState(false);
    const [ expandSettings, setExpandSettings ] = useState(false);
    

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
                <Link to="https://apilogicserver.github.io/Docs/WebGenAI/" target="_blank">{translate('wg.create.documentation_link_text')}</Link>
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
                {translate("wg.create.example_prompt")} &nbsp;
                <Link to="https://apilogicserver.github.io/Docs/Logic/" target="_blank">{translate('wg.create.documentation_link_text')}</Link>
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

    const doBuildOntimize = (e: any) => {
        const name = "build_ontimize"
        const checked = e.target.checked
        setBuildOntimize(checked)
        recordRef.current = { data: { ...recordRef.current.data, [name]: checked } };
    }

    const doEnableDefaults = (e: any) => {
        const name = "enable_defaults"
        const checked = e.target.checked
        setEnableDefaults(checked)
        recordRef.current = { data: { ...recordRef.current.data, [name]: checked } };
    }


    if (iterate) {
        return <SimpleForm toolbar={toolBar}>
            <IterateProjectWGAI recordRef={recordRef} handleCreate={handleCreate} {...props} />
        </SimpleForm>
    }

    const settingsTitle = <><strong>{translate('wg.create.advanced_title')}</strong>&nbsp;<span style={helpTextStyle}>
        {translate('wg.create.domain_logic_help')}
        </span></>
    if(!defaultPrompt && document.location.hash.includes('demo=genai_demo')){
        return <DemoPrompt setPromptVal={setPromptRef} setDefaultPrompt={setDefaultPrompt} setName={setNameRef}/>
    }
    return <>
        <SimpleForm toolbar={toolBar}>
            <TextInput source="name" label="Project name" sx={{ width: "9em", display: "none" }} onChange={(e) => setNameRef(e.target.value)} />

            <Typography>{translate('wg.create.desc')}
                <IconButton onClick={showPromptHelp} ><HelpOutlineIcon sx={{
                    width: '0.85rem',
                    height: '0.85rem'
                }}
                /></IconButton>
                <span style={helpTextStyle}>{promptHelpVal}</span>
            </Typography>

            <TextInputPrompt
                source="prompt"
                label={promptLabel}
                rows={rows}
                defaultValue={defaultPrompt}
                value={promptVal}
                onLabelClick={() => setPromptLabel("Prompt")}
                onChange={setPromptRef}
                handleCreate={handleCreate}
            />

            <Box sx={{ width: "100%", textAlign: "left", fontSize: "200px" }}>

                <Typography>
                    <UnthemedCollapsAccordion title={settingsTitle} defaultExpanded={expandSettings} sx={{ backgroundColor: "transparent", fontSize: "1.08rem" }} >
                        {translate('wg.create.business_logic')}
                        <IconButton onClick={showLogicHelp} ><HelpOutlineIcon sx={{
                            width: '0.85rem',
                            height: '0.85rem'
                        }} /></IconButton>
                        <span style={helpTextStyle}>{logicHelpVal}</span> 
                        <TextInput source="logicPrompt" label={"wg.create.logic_prompt"} multiline rows={logicRows} value={logicPromptVal} onChange={(e) => setLogicPromptRef(e.target.value)} />
                        {translate('wg.create.data_model_size')}
                        <IconButton onClick={showComplexityHelp} ><HelpOutlineIcon sx={{
                            width: '0.85rem',
                            height: '0.85rem'
                        }} /></IconButton>
                        <span style={helpTextStyle}>{complexityHelpVal}</span>

                        <DiscreteSlider setComplexity={setComplexityRef} complexity={complexity} />
                        <br />
                        <Checkbox checked={enableSpa} onChange={e => doEnableSpa(e)}/> {translate('wg.create.create_landing')} 
                        <br />
                        <Checkbox defaultChecked /> {translate('wg.create.push_github')}
                        <br />
                        <Checkbox /> {translate('wg.create.timestamping')} 
                        <br />
                        <Checkbox /> Optimistic locking
                        <br />
                        <Checkbox checked={buildOntimize} onChange={e => doBuildOntimize(e)} /> {translate('wg.create.build_ontimize')}
                        <br />
                        <Checkbox checked={enableSecurity} onChange={e => doEnableSecurity(e)}/> Authentication & authorization
                        <br />
                        <Checkbox checked={enableDefaults} onChange={e => doEnableDefaults(e)}/> {translate('wg.create.enable_defaults')}
                        
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