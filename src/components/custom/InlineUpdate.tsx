import Grid from "@mui/material/Grid";
import { TextField, PasswordInput } from "react-admin";
import * as React from "react";
import { useRecordContext, useRedirect } from "react-admin";
import { Create, SimpleForm } from 'react-admin';
import { TextInput } from 'react-admin';
import { Modal, Box, Typography, Button } from '@mui/material';
import { Select, MenuItem, FormControl, InputLabel, SelectChangeEvent } from "@mui/material";



const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '50%',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };
  

const UpdateModal = ({record, buttonVal, sx} : {record:any , buttonVal? : string, sx?: any}) => {
  
    const [open, setOpen] = React.useState(false);
    const handleOpen = (e: any) => {
        setOpen(true);
        e.stopPropagation();
    };

    const handleClose = (e: any) => {
        e.stopPropagation();
        setOpen(false);
    };


  return (
    <div>
      <Button variant="text" onClick={handleOpen}>
        {buttonVal}
      </Button>
      
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        
        <Box sx={style}>
          <pre>{JSON.stringify(record, null, 4)}</pre>
          <Button onClick={handleClose} variant="outlined">
            Close Window
          </Button>
        </Box>
      </Modal>
    </div>
  );
}

// Remove the unused destructured elements
export const InlineUpdateModal = () => {
    const record = useRecordContext();
  
    if (!record) {
      return null;
    }
  
    return (
      <Box sx={{ textAlign: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <UpdateModal record={record} buttonVal={"Update"}/>
        </Box>
      </Box>
    );
  };

export const InlineUpdateDropdown = () => {
    const record = useRecordContext();
    const [selectedValue, setSelectedValue] = React.useState("");
    const [selectedValueSx, setSelectedValueSx] = React.useState({});
  
    if (!record) {
        return null;
    }
  
    const handleChange = (event: SelectChangeEvent<string>) => {
        event.preventDefault();
        event.stopPropagation();

        setSelectedValue(event.target.value as string);
        const selectedOption = options.find(option => option.value === event.target.value);
        setSelectedValueSx(selectedOption?.sx || {});
        // Perform any action with the selected value
        console.log("Selected value:", event.target.value);
    };
  
    const options = [
        { value: "option1", label: "Option 1", sx: {backgroundColor : 'red' } },
        { value: "option2", label: "Option 2", sx: {backgroundColor : 'orange' } },
        { value: "option3", label: "Option 3", sx: {backgroundColor : 'yellow' }},
        { value: "option4", label: "Option 4", sx: {backgroundColor : 'green' }},
        { value: "option5", label: "Option 5", sx: {backgroundColor : 'blue' }},
    ];

    const label = selectedValue ? "" : "Select Option"
    return (
      <Box sx={{ textAlign: "center" }}>
        <FormControl variant="outlined" sx={{ minWidth: 120 }}>
          <InputLabel id="inline-update-dropdown-label">{label}</InputLabel>
          <Select
            labelId={selectedValue ? undefined : "inline-update-dropdown-label"}
            value={selectedValue}
            onChange={handleChange}
            onClick={(event)=>event.stopPropagation()}
            label={label}
            sx={selectedValueSx}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {options.map((option) => (
                <MenuItem key={option.value} value={option.value} sx={option.sx}>
                    {option.label}
                </MenuItem>))
                }
          </Select>
        </FormControl>
      </Box>
    );
  };

  export const InlineUpdateTest = InlineUpdateDropdown;