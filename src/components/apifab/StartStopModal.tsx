import React, { useEffect, useState } from 'react';
import { Modal, Box, Typography } from '@mui/material';
//import {Button} from "react-admin";
import { Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useEditController, 
  useUpdate,
  SimpleForm, 
  TextInput, 
  SelectInput, 
  useRecordContext, 
  useRefresh,
  useNotify} from "react-admin";
import { Card } from "@mui/material";

const style = {
    position: "absolute",
    top: "40%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "fit-content",
    bgcolor: "background.paper",
    BorderRadius: "4px",
    boxShadow: 24,
    p: 4,
    textAlign: "center",
  };

const buttonStyle = {
    color: 'primary.main',  // Text color
    border: '0px solid red',
    borderColor: 'primary.main',  // Border color
    backgroundColor: 'transparent',  // Transparent background
    // '&:hover': {
    //   backgroundColor: 'rgba(0, 0, 0, 0.04)',  // Slightly opaque on hover
    //   borderColor: 'primary.dark',  // Darker border on hover
    // },
    // '&:active': {
    //   backgroundColor: 'rgba(0, 0, 0, 0.08)',  // More opaque when clicked
    // },
    // '&:focus': {
    //   boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.3)',  // Focus outline
    // }
  }

export const StartStopModal = ({record, buttonVal, sx} : {record:any , buttonVal? : string, sx?: any}) => {
  
    const running = record.running;
    const [open, setOpen] = React.useState(false);
    const handleOpen = (e: any) => {
        setOpen(true);
        e.stopPropagation();
    };
    const handleClose = (e: any) => {
        e.stopPropagation();
        setOpen(false);
    };

    let runningIcon = running ? 
      <CheckCircleIcon sx={{ color: '#39b38a', fontSize: "1.4em"}} /> : 
      <CancelIcon sx={{ color: '#444', fontSize: "1.4em" }} />

  return (
    <div>
      <Button variant="text" sx={sx || buttonStyle} onClick={handleOpen}>
        {buttonVal || runningIcon}
      </Button>
      
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        
        <Box sx={style}>
          <StartStopBox/>
          <Button onClick={handleClose} sx={{ mt: 2 }} variant="outlined">
            Close Window
          </Button>
        </Box>
      </Modal>
    </div>
  );
}

const startApp = (e : any) => {
  e.stopPropagation();
}

const StartStopBox = () => {
  
    const startStopApp = (e : any) => {
      e.stopPropagation();
      update()
      notify(`${action} app`)
      setTimeout(() => {
         refresh();
         if(error){
            console.error("startstop r:", error)
         }
      }, 2000);
    }
    
    const record = useRecordContext()
    const notify = useNotify();
    const refresh = useRefresh()
    const action = record?.running ? "Stop" : "Start"
    const [update, { data, isPending, error }] = useUpdate(
      'Project',
      { id: record?.id, data: {running: !record?.running}, previousData: record }
    );

    useEffect(() => {
      if(error){
        console.warn('StartStopBox', error.message, error, data, isPending)
        notify(`${error?.message}`,  { type: 'error' })
      }
    },[error])
    
    return <>
            <Typography sx={{ mt: 2 }}>     
                <Button variant='outlined' onClick={startStopApp}>{action} the application</Button>
            </Typography>
          </>
}
