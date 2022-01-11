import React from "react";
import { Typography } from '@material-ui/core';
import { Modal, Box  } from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: "75%",
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    textAlign: "left"
} 
const useStyles = makeStyles({
    info_modal : style
});


const InfoModal = ({label, resource}) => {
    const [open, setOpen] = React.useState(false);
    const handleOpen = (e) => {setOpen(true); e.stopPropagation();}
    const handleClose = (e) => {e.stopPropagation();setOpen(false);}
    const classes = useStyles()
  
    return <>
        <span onClick={handleOpen} title={`${resource.name} Info`}>{label} </span>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style} className={classes.info_modal}>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                <div dangerouslySetInnerHTML={{ __html: resource.info}} />
            </Typography>
          </Box>
        </Modal>
      </>
}

export default InfoModal