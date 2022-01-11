import * as React from 'react';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Modal from '@material-ui/core/Modal';
import { makeStyles } from '@material-ui/core/styles';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import Button from '@material-ui/core/Button';
import { get_Conf } from '../Config';
import {Loading} from 'react-admin'

const boxStyle = {
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
};

const useStyles = makeStyles({
  joined_field : {cursor: "pointer", color: "#3f51b5"},
  modalStyle:{
    position:'absolute',
    top:'10%',
    left:'10%',
    overflow:'scroll',
    height:'100%',
    display:'block',
    fontWeight : "0.6em"
  }
});


const conf = get_Conf()

export default function ApiModal(props) {

    const create_api = (record) =>{
        const create_url = `${conf.api_root}/Apis/${record.id}/generate`
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 
                        'Authorization' : `Bearer ${localStorage.getItem('auth_token')}` },
            body: '{}'
        };
        setOutput(<Loading/>)
        fetch(create_url, requestOptions)
            .then(response => response.json())
            .then(data => setOutput(<pre>{data}</pre>))
    }
    
    const [open, setOpen] = React.useState(false);
    const [output, setOutput] = React.useState("");
    const handleOpen = (e) => {setOpen(true); e.stopPropagation();}
    const handleClose = (e) => {e.stopPropagation();setOpen(false);}
    const record = props.record
    
    const classes = useStyles()
    
    return (
        <span>
        <span onClick={handleOpen} className={classes.joined_field} title={` Relationship` }><PlayCircleOutlineIcon/></span>
        <Modal
            className={classes.modalStyle}
            open={open}
            onClose={handleClose}
            onClick={(e)=>e.stopPropagation()}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={boxStyle}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
                Create API 
            </Typography>
                Pressing the button will generate an API with the following properties:
                <dl>
                <dt>Name:</dt>
                <dd>{record?.name}</dd>
                <dt>Database URL:</dt>
                <dd>{record?.connection_string}</dd>
                <dt>Port:</dt>
                <dd>{record?.port}</dd>
                <dt>Hostname:</dt>
                <dd>{record?.hostname}</dd>
                </dl>
                <Button variant="outlined" onClick={()=>create_api(record)}> Start <PlayCircleOutlineIcon/> </Button>
                <hr/>
                
                {output}
                
            </Box>
        </Modal>
        </span>
    );
}

export const ApiManageField = (props) => {

  if(props.mode === "list"){
      return <ApiModal {...props}/>
  }
  return <></>
}