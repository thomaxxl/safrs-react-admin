import React, { useState } from 'react';
import { Modal, Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%', // Increased width
  maxHeight: '90%', // Increased maxHeight
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  overflow: 'auto', // Add overflow to handle scrolling if needed
};

interface ImageModalProps {
  thumbnailSrc: string;
  fullSizeSrc: string;
  alt: string;
}

const ImageModal: React.FC<ImageModalProps> = ({ thumbnailSrc, fullSizeSrc, alt }) => {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(false);
  const [isFullSize, setIsFullSize] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const toggleSize = () => setIsFullSize(!isFullSize);

  if(error){
    return <></>
  }
  return (
    <div>
      <img src={thumbnailSrc} alt={alt} style={{ cursor: 'pointer', width: '150px' }} onClick={handleOpen} onError={()=>setError(true)}/>
      <Modal open={open} onClose={handleClose} aria-labelledby="modal-title" aria-describedby="modal-description">
        <Box sx={style}>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
          <Typography id="modal-title" variant="h6" component="h2">
            Data Model
          </Typography>
          <img
            src={fullSizeSrc}
            alt={alt}
            onClick={toggleSize}
            style={{
              cursor: 'pointer',
              width: isFullSize ? '100%' : '80%',
            //   maxHeight: 'calc(100vh - 64px)',
              objectFit: 'contain',
              marginTop: '12px',
            }}
          />
        </Box>
      </Modal>
    </div>
  );
};

export default ImageModal;