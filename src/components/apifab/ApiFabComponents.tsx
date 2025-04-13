import React from 'react';
import { Box, Link, IconButton } from '@mui/material';
import { useRecordContext } from 'react-admin';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { StartStopModal } from './StartStopModal.tsx';
import DownloadIcon from '@mui/icons-material/Download';
import SvgIcon from '@mui/material/SvgIcon';
import {Button} from "react-admin";
import { List, Datagrid, TextField, EmailField } from 'react-admin';
import {TileList} from '../custom/TileList.tsx';
export { ApiFabUser, UserSettings } from './ApiFabUser.tsx';
export {TileList} from '../custom/TileList.tsx';

// Remove the unused destructured elements
export const Running = ({attribute, mode, label, record}: {attribute: any, mode: string, label: string, record: any}) => {
  record = useRecordContext() || record;

  if (!record) {
    return <></>;
  }

  if(mode === 'show' && !document.location.pathname.includes(record.id)){
    // hide in list details
    return <></>
  }

  return (
    <Box sx={{ textAlign: 'center' }}>
      
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <StartStopModal record={record} />
        </Box>
      
    </Box>
  );
};


export const DownloadProject = ({attribute, mode, label, record}: {attribute: any, mode: string, label: string, record: any}) => {
  record = useRecordContext() || record;
  
  if (!record) {
    return <></>;
  }
 
  return (
    <Link title="Download" href={record.download} target="_blank" onClick={(e) => e.stopPropagation()} >
      <Button color="primary">
        <DownloadIcon />
      </Button>
    </Link>
  );
};


export const ProjectLink = ({attribute, mode, label, record}: {attribute: any, mode: string, label: string, record: any}) => {

  record = useRecordContext() || record

  if(mode === 'show' && !document.location.pathname.includes(record.id)){
    // hide in list details
    return <></>
  }
  if (!record || !record.running) {
    return <Button label=" ">
             <SvgIcon ><path d="  " /></SvgIcon>
          </Button>
  }

  return (
    <Link href={record.link} target="_blank" onClick={(e) => e.stopPropagation()} >
      <Button color="primary">
        <OpenInNewIcon  />
      </Button>
    </Link>
  );
};


export const SlackIcon = () => {
  const icon = <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M6 15a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2h2zm1 0a2 2 0 0 1 2-2a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2a2 2 0 0 1-2-2zm2-8a2 2 0 0 1-2-2a2 2 0 0 1 2-2a2 2 0 0 1 2 2v2zm0 1a2 2 0 0 1 2 2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2a2 2 0 0 1 2-2zm8 2a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2h-2zm-1 0a2 2 0 0 1-2 2a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2a2 2 0 0 1 2 2zm-2 8a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2v-2zm0-1a2 2 0 0 1-2-2a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2a2 2 0 0 1-2 2z"></path></svg>

  return (
    <IconButton sx={{color:'background.paper'}} href="https://apilogicserver.slack.com" target="_blank" onClick={(e) => e.stopPropagation()} title={"Contact us on slack"}>
      {icon}
    </IconButton>
  );
}


export const NewlineText = ({attribute, mode, label, record}: {attribute: any, mode: string, label: string, record: any} ) => {
  
  record = useRecordContext() || record;

  if (!record) {
    return null;
  }

  let lines = record[attribute?.name]?.split('\n') || [];
  if(mode === "list" && lines.length > 3){
    lines = lines.slice(0, 3);
    lines.push("...");
  }


  return (

      <div>
          {lines.map((line, index) => (
              <React.Fragment key={index}>
                  {line}
                  <br />
              </React.Fragment>
          ))}
      </div>
  );
};


export const UserList = TileList

