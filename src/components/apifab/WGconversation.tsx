import * as React from 'react';
import { useRef, useEffect } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Paper, { PaperProps } from '@mui/material/Paper';
import Draggable from 'react-draggable';
import { getProjectId } from '../../Config';
import { Link } from "react-admin";
import { TextField } from '@mui/material'
import '@flaticon/flaticon-uicons/css/all/all.css';
import ListAltIcon from '@mui/icons-material/ListAlt';
import DeveloperModeIcon from '@mui/icons-material/DeveloperMode';


function PaperComponent(props: PaperProps) {
  return (
    <Draggable
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper {...props} />
    </Draggable>
  );
}

export default function DraggableDialog() {
    const [open, setOpen] = React.useState(false);

    const [promptVal, setPromptVal] = React.useState("");
    const projectId = getProjectId();
    const textFieldRef = React.useRef(null);
    const [iterateSx, setIterateSx] = React.useState<any>({border: '1px solid white'});
    
    React.useEffect(() => {      
        const timeout = setTimeout(() => {
          //setIterateSx({border: '1px solid white', backgroundColor: 'white', color: '#f467a1'})
        }, 1000);

        const timeout2 = setTimeout(() => {
          //setIterateSx({padding: '1px solid transparent'})
        }, 4000);
  
        return () => {
          clearTimeout(timeout);
          clearTimeout(timeout2);
        };
      }, []);
    
      React.useEffect(() => {
        const timeout = setTimeout(() => {
            textFieldRef.current?.focus();
        }, 100);
    
        return () => {
          clearTimeout(timeout);
        };
      }, [open]);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const refresh = () => {
      if(!window.location.href.endsWith('/develop')) {
        window.location.href = window.location.href.split('#')[0] + '#/Home/develop'
        window.location.reload();
      }
    }

    const handleIterate = () => {
        
        let iterateOrigin = window.location.origin;
        if(origin.includes('g.apifabric')){
          iterateOrigin = origin.replace('g.apifabric','apifabric');
        }
        console.log("Iterating with prompt: ", promptVal);
        const iterateUrl = `${iterateOrigin}/admin-app/#/Home/iterate?project_id=${projectId}&prompt=${encodeURIComponent(promptVal)}&token=xxx`;
        // TODO: CSRF token
        document.location.href = iterateUrl;
        setOpen(false);
    };

    if(! projectId){
        return <></>
    }
    
    return (
            <React.Fragment>
            
            <a href={document.location.origin.replace('g.apifabric','apifabric') + `/admin-app/index.html#/Project/${projectId}/show?tab=logic`} target="_blank">
              <Button sx={{marginRight: "1em", width: "11em", ...iterateSx }} variant="contained" >
                <i className="fi fi-ss-microchip"></i>
                &nbsp; Logic
                <br/>
                <span style={{color: '#ccc', fontSize:"9px"}}></span>
              </Button>
            </a>

            

            <Button sx={{marginRight: "1em", ...iterateSx, width:"11em" }} variant="contained" onClick={handleClickOpen} >
              <i className="fi fi-rs-flask-gear"></i>
              &nbsp; Iterate
            </Button>
            
            <Link to="/Home/develop" onClick={()=>refresh()}>
              <Button variant="contained" sx={{marginRight: "1em", width: "11em"}} >
              <DeveloperModeIcon/>
              &nbsp; Develop
              </Button>
            </Link>
            
            <a href={document.location.origin.replace('g.apifabric','apifabric') + '/admin-app/index.html#/Project'}>
              <Button sx={{marginRight: "1em", width: "11em"}} variant="contained">
              <ListAltIcon/>
              &nbsp; Projects
              </Button>
            </a>
            {/* <MyDialog disableRestoreFocus open={open} handleClose={handleClose} /> */}
            <Dialog
                open={open}
                onClose={handleClose}
                PaperComponent={PaperComponent}
                aria-labelledby="draggable-dialog-title"
                disableRestoreFocus 
            >
                <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
                Iterate
                </DialogTitle>
                <DialogContent>
                <DialogContentText>
                    Describe what you want to change in this project.
                    <TextField inputRef={textFieldRef} autoFocus multiline fullWidth value={promptVal} onChange={(e) => setPromptVal(e.target.value)}  />
                </DialogContentText>
                </DialogContent>
                <DialogActions>
                <Button autoFocus onClick={handleClose}>
                    Cancel
                </Button>
                <Button onClick={handleIterate}>Iterate</Button>
                </DialogActions>
            </Dialog>
            </React.Fragment>
        );
}


export const WGConversation = () => {
    return <DraggableDialog />;
}
