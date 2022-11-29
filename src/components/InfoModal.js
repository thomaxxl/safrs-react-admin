import React from "react";
import { Typography } from '@material-ui/core';
import { Modal, Box  } from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Button from '@material-ui/core/Button';

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
    info_modal : style,
    icon : {color: '#ccc',
            '&:hover' : {color: '#3f51b5'}
            },
});


const InfoModal = ({resource, mode}) => {
    const [open, setOpen] = React.useState(false);
    const handleOpen = (e) => {
        setOpen(true);
        e.stopPropagation(); 
        /*ReactDom.render(
        <ReactMarkdown children={"markdown"} remarkPlugins={[]} />,
        document.getElementById("info_content"))*/
    }
    const handleClose = (e) => {e.stopPropagation();setOpen(false);}
    const classes = useStyles()
    const label = <Button label="Info"><HelpOutlineIcon className={classes.icon}/></Button>
    const content = resource[`info_${mode}`] // modes: "show", "list", "edit"
    
    return content ? <>
        <span onClick={handleOpen} title={`${resource.name} Info`}>{label} </span>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style} className={classes.info_modal}>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                <div id="info_content" dangerouslySetInnerHTML={{ __html: content}} />
            </Typography>
          </Box>
        </Modal>
      </> : null
}

export default InfoModal