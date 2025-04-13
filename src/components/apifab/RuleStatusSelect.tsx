import React from 'react';
import { Select, MenuItem, Checkbox, ListItemText, FormControl, InputLabel, Typography } from '@mui/material';

const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

const RuleStatusSelect = ({ selectedRuleStatus, handleSelectStatus }) => {
    //const options = ["active", "suggested", "inactive", "rejected", "all"];
    const options = ["active", "accepted", "suggested", "rejected"];

    return (
        <FormControl size="small" sx={{ marginRight: 1, width: "12em" }}>
            <InputLabel id="rule-status-select-label">Status</InputLabel>
            <Select
                labelId="rule-status-select-label"
                id="rule-status-select"
                multiple
                value={selectedRuleStatus}
                onChange={handleSelectStatus}
                renderValue={(selected) => (selected?.length ? (selected as string[])[0] : "")}
            >
                {options.map((option) => (
                    <MenuItem key={option} value={option}>
                        <Checkbox checked={selectedRuleStatus.indexOf(option) > -1} />
                        <ListItemText primary={<Typography variant="body2">{capitalizeFirstLetter(option)}</Typography>} />
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default RuleStatusSelect;