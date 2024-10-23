import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useDataProvider, useGetOne} from "react-admin";
import { Card } from "@mui/material";
import { ApiDetails } from "./ApiFabShow"

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
    textAlign: "left",
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


export const PostCreateModal = ({createStatus, closed} : {createStatus : any, closed:boolean}) => {

    console.log('pcm', closed)
  
    const dataProvider = useDataProvider();
    const { data, error } = useGetOne("Project", { id: createStatus.id });
    const [open, setOpen] = useState(!closed);
    const [loading, setLoading] = useState(false);
    const [record, setRecord] = useState({});
    
    const handleClose = (e: any) => {
        e.stopPropagation();
        setOpen(false);
    };

    useEffect(() => {
        
        dataProvider
          .getOne("Project", { id: createStatus.id })
          .then(({ data }) => {
            if(data?.id && data?.running){
                setRecord(data)
                setLoading(false);
            }
          })
          .catch((error) => {
            setLoading(false);
          });
      }, [data]);

    console.log('useGetOne', data.running, data, error)
    if(loading){
        return <></>
    }

    return (
        <div>
        
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
        >
            
            <Box sx={style}>
                <ApiDetails record={record} />
            <Button onClick={() => document.location.href = record?.link} sx={{ mt: 2, marginRight : "1em" }} variant="outlined">
                Go to App
            </Button>
            <Button onClick={handleClose} sx={{ mt: 2 }} variant="outlined">
                Close Window
            </Button>
            </Box>
        </Modal>
        </div>
  );
}
