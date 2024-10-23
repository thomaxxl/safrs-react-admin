import { useRef } from "react";
import { ChangeEvent, useState } from 'react';
import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useConf } from '../../Config';
import Typography from "@mui/material/Typography";
import { MuiFileInput } from 'mui-file-input'


const MuiFileInputStyled = styled(MuiFileInput)`
  & input + span {
    color: black;
    border: 1px solid #black;
  }
`

export const FileUpload = ({setUploadedFile}:{setUploadedFile: any}) => {
  
  const conf = useConf();
  const hiddenFileInputRef = useRef(null);
  const [file, setFile] = useState<File>();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        console.log('file', e.target.files[0])
        setFile(e.target.files[0]);
    }
  };

  const [value, setValue] = useState(null)

  const handleChange = (newValue) => {
    setValue(newValue)
    setFile(newValue)
  }

  const handleUploadClick = () => {
        if (!file) {
            return;
    }

    const formData = new FormData();
    formData.append('file', file);
    
    const url = new URL(conf.api_root);
    url.pathname = url.pathname.replace('/api', '/upload');
    const destination = url.toString();
    const headers = new Headers();
    headers.append('Authorization', 'Bearer ' + localStorage.getItem('auth_token'));

    fetch(`${destination}?name=${file.name}`, {
      method: 'POST',
      body: formData,
      headers: headers,
    })
      .then((res) => res.json())
      .then((data) => setUploadedFile(data))
      .catch((err) => console.error(err));
  };

  return (
    <div>
        <input type="file" name="file" ref={hiddenFileInputRef} onChange={handleFileChange} style={{display: 'none'}}/>
        <Typography style={{ fontStyle: 'italic', color: '#666', fontSize: '10px' }}></Typography>
        
        <MuiFileInputStyled
          value={value} 
          onChange={handleChange}
          size="medium"
          label={file ? "" : "Drop a file to upload, or click to select it."} />
        
        { file ? <Button
            variant="contained"
            color="primary"
            component="span"
            startIcon={<CloudUploadIcon />}
            onClick={handleUploadClick}
          >
           Upload {file.name}
          </Button> : null }
        
      

    </div>
  );
}
