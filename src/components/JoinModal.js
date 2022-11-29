import * as React from 'react';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Modal from '@material-ui/core/Modal';
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
};

const useStyles = makeStyles({
  joined_field : {cursor: "pointer", color: "#3f51b5"}
});



export default function JoinModal({label, content, resource_name}) {
  const [open, setOpen] = React.useState(false);
  const handleOpen = (e) => {setOpen(true); e.stopPropagation();}
  const handleClose = (e) => {e.stopPropagation();setOpen(false);}
  
  const classes = useStyles()

  return (
    <span>
      <span onClick={handleOpen} className={classes.joined_field} title={`${resource_name} Relationship` }>{label} </span>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {label}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {content}
          </Typography>
        </Box>
      </Modal>
    </span>
  );
}