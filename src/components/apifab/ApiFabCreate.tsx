import React, { useRef, useState, useEffect } from "react";
import DynInput from "../DynInput";
import {
  DeleteButton,
  Loading,
  SaveButton,
  SimpleForm,
  Toolbar,
  useCreate
} from "react-admin";
import { useRefresh, useNotify, useUpdate } from "react-admin";
import { redirect, useLocation } from "react-router";
import Typography from '@mui/material/Typography';
import { Card, CardContent, IconButton, Container, Box } from '@mui/material';
import { Tab, Tabs } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { CircularProgress } from '@mui/material';
import { useGetOne} from "react-admin";
import { ApiDetails } from "./ApiFabShow"
import { DBConnection } from "./DBCreate"
import { attributes } from "../types/SraTypes"
import { WebGenAICreatePanel, CreateProjectWGAI } from "./WebGenAICreate";
import { Padding } from "@mui/icons-material";
import AddIcon from '@mui/icons-material/Add';
import { jaRpc } from "../../rav4-jsonapi-client/ra-jsonapi-client";
import { set } from "react-hook-form";
import { useTranslate } from 'react-admin';


const a11yProps = (index: number) => {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

const createStatusStyle = {
    fontStyle: 'italic',
    fontSize: '0.5em',
    color: 'black',
    'text-align': 'left'
}


const detailsStyle = {
    width: "100%",
    p: 4,
    textAlign: "left",
    backgroundColor: "white",
    marginTop: "0.5em"
}
// const createProjectHeader = {
//     textAlign: "left",
//     marginTop: "1em",
//     fontVariant: "small-caps",
//     marginLeft: "40px"
// }

export const ProjectCreateToolbar = ({createStatus, setCreateStatus, attributes, handleCreate, recordRef, ...props}: any) => {
    const translate = useTranslate();
    const location = useLocation();
    const notify = useNotify();
    const [ disabled, setDisabled ] = useState(false);
    
    const onSuccess = (data: any) => {
      notify("Element updated");

      let redirect_loc = location.pathname.replace("/create", "");

      redirect_loc += `/${data.id || ""}/show`;

      console.log("redirect to", redirect_loc, data);
      redirect(redirect_loc);
    };

    const handleCreateProject = async (event?:React.SyntheticEvent) => {
      if(event){
        event.preventDefault();
      }
      handleCreate(event);
      setDisabled(true);
      setTimeout(() => {
        setDisabled(false);
      }, 15000);
    }

    return (
      <Toolbar {...props}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <SaveButton
            disabled={disabled}
            type="button"
            label={"wg.create.create_project"}
            variant="contained"
            onClick={handleCreateProject}
            mutationOptions={{ onSuccess }}
            sx={{backgroundColor: '#4682B4', color: 'white', width : '14em'}}
            icon= {<AddIcon />}
          />
        </div>
      </Toolbar>
    );
  };


interface CreateStatusProps {
    createStatus: any;
}


const CreateStatusGenning: React.FC<CreateStatusProps> = ({ createStatus }) => {
    
    const [data, setData] = useState(createStatus);
    const [error, setError ] = useState<string>("");
    const [countdown, setCountdown] = useState(5);
    const [finished, setFinished] = useState(false);
    const [cdInterval, setCdInterval] = useState<any>(null);
    
    /*
    The backend is expected to return a log of the process.
    We send the current log to the backend, and the backend returns the updated log.
    If there are no updates, the backend will wait until there's a new log entry.
    cfr. project.py http patch method
    */
    const getLog = async () => {
      if(createStatus === null){
        console.log('createStatus is null')
        setData({log: "..."})
        return
      }
      const endpoint = 'Project/' + createStatus.id + '/get_log';
      return jaRpc(endpoint, {log: data?.log}).then((response) => {
        console.log('getLog:', response)
        if(response === undefined){
            setError('No data from backend')
        }
        else{
            const data = response.attributes
            data.id = response.id
            if(data.log.includes("Error:")){
              setError(data?.log.split("Error:")[1])
            }
            setData(data);
        }
      }).catch((error) => {
        console.error("getLog Error:", error)
        setError('Fetch Error')
      })
    }

    useEffect(() => {
      if(data?.log?.includes("Project Running!") || data?.log?.includes("Project Stopped")){
          setFinished(true);
          setCountdown(0);
      }
    }, [data]); 

    useEffect(() => {
        if (finished || error !== "") {
            setCountdown(0);
            return;
        }
        const timeOut = data?.log?.includes("Starting") ? 1000 : 1000;
        
        const countdownInterval = setInterval(() => {
          console.log('timeOut:', timeOut, 'countdownInterval:', countdownInterval)
          countdown && setCountdown((prevCountdown) => prevCountdown - 1);
        }, timeOut);
        setCdInterval(countdownInterval);
        return () => clearInterval(countdownInterval);
      }, []);
    
    useEffect(() => {
        if(finished || error !== ""){
          setCountdown(0);
          clearInterval(cdInterval);
          return
        }
        if (!finished && !error && countdown === 0) {
            setTimeout(() => {
              getLog().then(() => {
                setCountdown(5);
              })
            }, 400);
        }
      }, [countdown]);
    
    if(error !== ""){
        return <Box sx={detailsStyle}>
                <pre style={{fontSize: "16px"}}>{data?.log}</pre>
                <Typography variant="h5">Error</Typography>
                <Typography sx={{color: "red"}}>{error}</Typography>
              </Box>
    }

    if(finished){
        console.log('finished', createStatus, data)
        return <Box sx={detailsStyle}>
                <ApiDetails record={data} appLinkStyle="h5"/>
                </Box>
    }

    return <Box sx={detailsStyle}>
            <Typography variant="h5">Generating Application &nbsp;<CircularProgress size={14} /></Typography>
            <pre style={{fontSize: "16px"}}>{data?.log || "Initializing.."}</pre>
          </Box>
};


export const ApiFabCreate = ({
    attributes,
    ...props
  }: {
    attributes: [any];
    [key: string]: any;
  }) => {
    const [value, setValue] = React.useState(0);
    const [createStatus, setCreateStatus] = useState<any>(false);
    const [initializing, setInitializing] = useState<any>(false);
    const iterate = window.location.hash.includes('/iterate');
    const notify = useNotify();
    const recordRef = useRef({ data: {build_ontimize: false, enable_defaults: true} });
    const [create] = useCreate(
      "Project",
      { data: recordRef }
    );
    const bottomRef = useRef(null);

    const handleCreate = async (event?:React.SyntheticEvent) => {
      if(event){
        event.preventDefault();
      }      

      // Set initializing immediately
      setInitializing(true);
      bottomRef?.current.scrollIntoView({ behavior: 'smooth' });
      // Defer API call to next tick to allow UI update
      setTimeout(async () => {
        try {
          setCreateStatus(null);
          await create(
            attributes[0].resource.name,
            { data: recordRef },
            {
              onSuccess: (data : {}) => {
                console.log("onSuccess data:", data);
                setCreateStatus(data);
                notify("Started Application Generation...",{ 
                  autoHideDuration: 2000
                });
              },
              onError: (error: any) => {
                console.log("error: ", error);
                notify(`Error: ${error?.message}`, { type: "warning" });
              },
            }
          );
        } catch (error: any) {
          console.log("error: ", error);
          notify(`Error: ${error.message}`, { type: "warning" });
        } 
        setInitializing(false);
        setCreateStatus("Creating Project, Please Wait");
      }, 0);
    };

    useEffect(() => {
      if(iterate){
          setValue(2);
      }
    },[])

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
      setValue(newValue);
    }
    
    let createDiv = null;
    if(createStatus?.id || createStatus === null){
        createDiv = <><CreateStatusGenning createStatus={createStatus}/></>
    }

    const ToolBar = <ProjectCreateToolbar createStatus={createStatus} setCreateStatus={setCreateStatus} handleCreate={handleCreate} attributes={attributes} recordRef={recordRef} />

    return (
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} >
            <Tab label="WebGenAI" {...a11yProps(0)} />
            <Tab label="Connect DB" {...a11yProps(1)} />
            { iterate ? <Tab label="Iterate" {...a11yProps(1)} /> : null }
          </Tabs>
          </Box>
        <Box>
        {/*<Typography variant="h5" sx={createProjectHeader}> Create Project </Typography>*/}
        </Box>
        <Box>
        <WebGenAICreatePanel value={value} index={0}>
          <CreateProjectWGAI attributes={attributes} toolBar={ToolBar} recordRef={recordRef} setCreateStatus={setCreateStatus} handleCreate={handleCreate} {...props}/>
        </WebGenAICreatePanel>
        <WebGenAICreatePanel value={value} index={1}>
          <DBConnection mode="edit" attributes={attributes} toolBar={ToolBar} recordRef={recordRef} setCreateStatus={setCreateStatus} />
        </WebGenAICreatePanel>
        <WebGenAICreatePanel value={value} index={2} >
          <CreateProjectWGAI  attributes={attributes} toolBar={ToolBar} createStatus={createStatus} setCreateStatus={setCreateStatus} handleCreate={handleCreate} recordRef={recordRef} iterate={true} {...props}/>
        </WebGenAICreatePanel>
        </Box>
        {createDiv}
        <div ref={bottomRef} />
      </Box>
    );
  }
  