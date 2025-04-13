import React, { useState } from 'react';
import { Box, IconButton, Tooltip, Menu, MenuItem, Typography } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CheckCircleOutlineRounded from '@mui/icons-material/CheckCircleOutlineRounded';
import Check from '@mui/icons-material/Check';
import ChatIcon from '@mui/icons-material/Chat';
import DeleteIcon from '@mui/icons-material/Delete';
import { Button } from 'react-admin';

const RuleListItemActions = ({ index, rule, handleEnable, handleDelete, handleOpenPrompt, expanded }: { index: number, rule: any, handleEnable?: (index: number) => void, handleDelete?: (index: number) => void, handleOpenPrompt: (rule: any) => void, expanded?: boolean }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleAccept = () => {
        handleEnable && handleEnable(index);
        handleClose();
    }

    const handleReject = () => {
        handleDelete && handleDelete(index);
        handleClose();
    }

    let ruleStatusIcon = <AddCircleOutlineIcon />;
    if (rule.status == "active") {
        ruleStatusIcon = <CheckCircleOutlineRounded sx={{ color: "#b4d3b2", verticalAlign: "middle" }} />;
    }
    if (rule.status == "accepted") {
        ruleStatusIcon = <Check sx={{ color: "#444", verticalAlign: "middle" }} />;
    }
    let tooltipTitle = rule.status == "active" ? "Active" : "Click to Accept";
    tooltipTitle = rule.status == "accepted" ? "Accepted" : tooltipTitle;

    return (
        <Box sx={{ position: 'absolute', right: 0, top: 0, display: 'flex', gap: 1 }}>
            <Typography variant="body2" component="div">
            <Button variant="outlined" 
                    sx={{cursor: "pointer", width:"8em", textTransform:"none", 
                        marginTop:"0.8em", 
                        
                        fontSize:"0.8em", 
                        textAlign: "left", 
                        display: 'flex',
                        justifyContent: 'space-between' }} onClick={handleClick}>
                <>
                {rule.status}&nbsp;{ruleStatusIcon}</>
            </Button>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                MenuListProps={{
                    "aria-labelledby": "basic-button"
                }}
                style={{ // Add here you negative margin
                    marginLeft: "0px",
                    width: "8em",
                }}
            >
                { rule.status == "suggested" || rule.status == "rejected" ? <MenuItem sx={{fontSize:"0.8em", marginLeft: "0px", width: "8em"}} onClick={handleAccept}>accept</MenuItem> : null }
                { rule.status == "suggested" || rule.status == "accepted" || rule.status == "active" ?<MenuItem sx={{fontSize:"0.8em", marginLeft: "0px", width: "8em"}} onClick={handleReject}>reject</MenuItem> : null }
                
            </Menu>
            </Typography>
        </Box>
    );
};

export default RuleListItemActions;