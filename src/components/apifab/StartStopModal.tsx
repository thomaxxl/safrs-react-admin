import React, { useEffect, useState } from 'react';
import { Modal, Box, Typography, IconButton, Button, Tooltip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useEditController, useUpdate, SimpleForm, TextInput, SelectInput, useRecordContext, useRefresh, useDataProvider, useNotify } from 'react-admin';
import { Card } from '@mui/material';
import { log } from 'console';

const style = {
  position: 'absolute' as 'absolute',
  top: '40%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 'fit-content',
  bgcolor: 'background.paper',
  borderRadius: '4px',
  boxShadow: 24,
  p: 4,
  textAlign: 'center',
};

const buttonStyle = {
  color: 'primary.main', // Text color
  border: '0px solid red',
  borderColor: 'primary.main', // Border color
  backgroundColor: 'transparent', // Transparent background
};

const PROJECT_FAILED = "Project Failed"

export const StartStopModal = ({ record, buttonVal, sx }: { record: any; buttonVal?: string; sx?: any }) => {
  const running = record.running;
  const failed = record.status === PROJECT_FAILED;
  const [open, setOpen] = React.useState(false);
  const handleOpen = (e: any) => {
    setOpen(true);
    e.stopPropagation();
  };
  const handleClose = (e: any) => {
    e.stopPropagation();
    setOpen(false);
  };

  let runningIcon = running ? (
    <CheckCircleIcon sx={{ color: '#39b38a', fontSize: '1.4em' }} />
  ) : (
    <CancelIcon sx={{ color: '#444', fontSize: '1.4em' }} />
  );

  if(failed){
      return <Tooltip title={PROJECT_FAILED}><Button variant="text" sx={sx || buttonStyle} >
              <CancelIcon sx={{ color: '#bb2222', fontSize: '1.4em' }} />
              </Button>
            </Tooltip>
  }

  return (
    <div>
      <Tooltip title={record.running ? "Stop App" : "Start App"}>
      <Button variant="text" sx={sx || buttonStyle} onClick={handleOpen}>
        {buttonVal || runningIcon}
      </Button>
      </Tooltip>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <Box sx={style}>
          <StartStopBox />
          <Button onClick={handleClose} sx={{ mt: 2 }} variant="outlined">
            Close Window
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

const StartStopBox = () => {
  const record = useRecordContext();
  const notify = useNotify();
  const refresh = useRefresh();
  const [ log, setLog ] = useState<any>(null);
  const action = record?.running ? 'Stop' : 'Start';
  const [update, { data, isPending, error }] = useUpdate('Project', {
    id: record?.id,
    data: { running: !record?.running },
    previousData: record,
  });
  const projectId = record?.id;
  const dataProvider = useDataProvider();

  const startStopApp = (e: any) => {
    e.stopPropagation();
    update();
    const msg = action === "Start" ? `Starting application, please wait...` : `Stopping application, please wait...`;
    notify(msg);
    setTimeout(() => {
      dataProvider.getOne('Project', { id: record?.id });
      if (error) {
        console.error('startstop r:', error);
      }
    }, 2000);
  };

  const stopApp = async () => {
    await dataProvider.update('Project', { id: record?.id, data: { running: false }, previousData: record });
  };

  const startApp = async () => {
    await dataProvider.update('Project', { id: record?.id, data: { running: true }, previousData: record });
  };

  const restartApp = async (e: any) => {
    e.stopPropagation();
    const restartResponse = await dataProvider.execute(`Project`, 'restart', { id: projectId });
    setLog(JSON.stringify(restartResponse));
  };

  useEffect(() => {
    if (error) {
      console.warn('StartStopBox', error.message, error, data, isPending);
      notify(`${error?.message}`, { type: 'error' });
    }
  }, [error]);

  return (
    <>
      <Typography sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <Button variant="outlined" onClick={startStopApp} sx={{ mb: 2, width: '100%' }}>
          {action} the application
        </Button>
        <Button variant="outlined" onClick={restartApp} sx={{ width: '100%' }}>
          Restart the application
        </Button>
      </Typography>
    </>
  );
};