import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, List, ListItem, ListItemText, Divider, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Link, Icon } from '@mui/material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ChatIcon from '@mui/icons-material/Chat';
import EditIcon from '@mui/icons-material/Edit';
import CodeSnippet from './CodeSnippet';
import AIPromptSuggest from './AIPromptSuggest';
import { Check, CheckCircleOutlineRounded } from '@mui/icons-material';
import RuleListItemActions from './RuleListItemActions';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import InfoIcon from '@mui/icons-material/Info';
import { error } from 'console';
import { useTheme } from '@mui/material/styles';

const RuleDetailsDialog = ({ open, onClose, rule: selectedRule }: { open: boolean, onClose: () => void, rule: any }) => {
    const [inputText, setInputText] = useState<string>('');

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(event.target.value);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth scroll="paper">
            <DialogTitle>GenAI-Logic Prompt</DialogTitle>
            <DialogContent>
            <AIPromptSuggest selectedRule={selectedRule} open={open}/>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary" variant="outlined">Apply</Button>
                <Button onClick={onClose} color="primary" variant="outlined">Close</Button>
            </DialogActions>
        </Dialog>
    );
};

const RuleError = ({rule}: {rule:any}) => {
    let message = rule.error;
    if(message?.startsWith("Missing Attributes") || message?.startsWith("AttributeError: ")){
        message = <>{message} &nbsp;
        <br/>
        <span style={{display: "inline-block", width:"10ch"}}><strong></strong></span>
        <Typography variant="caption" color="primary" fontSize={10} sx={{ fontWeight: 'bold', color: '#22d' }}>
            
            Update the model to add the missing attribute
            </Typography>
            </>;
    }
    return (
        
            <>
            <br/>
            
            <Typography variant="body2" color="error">
                <span style={{display: "inline-block", width:"10ch"}}><strong>Error</strong></span>    
                {message}
            </Typography>
            </>
        
    );
}

const RuleListItemDetails = ({ rule, handleToggle, handleOpenPrompt }: { rule: any, handleToggle: (evt: any) => void, handleOpenPrompt?: any }) => {
    return (
        <Box>
            <CodeSnippet code={rule.code} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography
                    variant="body2"
                    onClick={handleToggle}
                    sx={{ cursor: 'pointer' }}
                >
                    
                    <span style={{display: "inline-block", width:"10ch"}}><strong>Rule Name</strong></span>{rule.name}
                    <br/>
                    <span style={{display: "inline-block", width:"10ch"}}><strong>Use Case</strong></span>{rule.use_case}
                    
                    {rule.error && <RuleError rule={rule}/>}
                </Typography>
                {handleOpenPrompt && <>
                        <IconButton onClick={() => handleOpenPrompt(rule)} color="default">
                            <Tooltip title={"Rule Prompt"}><ChatIcon /></Tooltip>
                        </IconButton>
                        
                    </>
                }
            </Box>
        </Box>
    );
};

const RuleListItem = ({ rule, index, expandedIndices, setExpandedIndices, handleEnable, handleDelete, handleOpenPrompt, ruleListItemActions }: 
    { rule: any, index: number, expandedIndices: number[], setExpandedIndices: (indices: number[]) => void, handleEnable?: (index: number) => void, ruleListItemActions?: any,
      handleDelete?: (index: number) => void, handleOpenPrompt: (rule: any) => void }) => {
    const expanded = expandedIndices.includes(index);
    const theme = useTheme();

    const handleToggle = () => {
        setExpandedIndices(prevIndices =>
            prevIndices.includes(index)
                ? prevIndices.filter(i => i !== index)
                : [...prevIndices, index]
        );
    };

    let ruleStatusIcon = <AddCircleOutlineIcon />;
    if (rule.status == "active") {
        ruleStatusIcon = <Check />;
    }
    let tooltipTitle = rule.status == "active" ? "Active" : "Click to Activate";
    const textDecoration = rule.status == "rejected" ? "line-through" : "none"
    const fontWeight = rule.status == "activeXXX" ? "bold" : "none";
    const fontStyle = rule.status == "suggested" ? "italic" : "none";
    let fontColor = rule.status == "suggested" ? "#444" : "black";
    if(rule.error){
        fontColor =  theme.palette.error.main; // Use theme error color
    }
    return (
        <>
            <ListItem 
                key={index} 
                alignItems="flex-start" 
                sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }, position: 'relative' }}>

                <ListItemText
                    primary={
                        <Typography
                            variant="body2"
                            component="div"
                            onClick={handleToggle}
                            sx={{ cursor: 'pointer', wordWrap: 'break-word' }}
                        >
                            {/* <span style={{ width: "4ch", display: 'inline-block', textAlign: 'left' }}>{index + 1}.</span> */}
                            <span style={{ verticalAlign:"middle", display: 'inline-block', transform: expanded ? 'rotate(0deg)' : 'rotate(270deg)' }} > <ExpandMoreIcon sx={{fontSize:"1em"}}/> </span>
                            <span style={{textDecoration: textDecoration, 
                                fontWeight: fontWeight,
                                fontStyle: fontStyle,
                                color: fontColor,
                                wordWrap:"break-word"}}> {rule.description}</span>
                            
                        </Typography>
                    }
                    secondary={expanded && <RuleListItemDetails rule={rule} handleToggle={handleToggle} handleOpenPrompt={handleOpenPrompt}/>} 
                />
                
                { ruleListItemActions ?? <RuleListItemActions
                    index={index}
                    rule={rule}
                    handleEnable={handleEnable}
                    expanded={expanded}
                    handleDelete={handleDelete}
                    handleOpenPrompt={handleOpenPrompt}
                />}
            </ListItem>
            <Divider />
        </>
    );
};

const RuleList = ({ rules, fetchMoreRules, handleEnable, handleDelete, handleOpenPrompt, selectedRule, setSelectedRule, setTabValue, scroll, ruleListItemActions, setRequiresRefresh }: 
    { rules: any[], fetchMoreRules?: (() => void) | null | undefined, handleEnable?: (index: number) => void, handleDelete?: (index: number) => void, handleOpenPrompt?: (rule: any) => void, selectedRule?: any, setSelectedRule?: (value: number) => void, setTabValue?: (value: number) => void, scroll?: boolean, ruleListItemActions?: any, setRequiresRefresh?: (value: number) => void }) => {
    
    const [expandedIndices, setExpandedIndices] = useState<number[]>([]);
    const [detailsDialogOpen, setDetailsDialogOpen] = useState<boolean>(false);
    const moreRulesButtonRef = useRef<HTMLButtonElement>(null);
    const dialogContentRef = useRef<HTMLDivElement>(null);
    
    const handleOpenPromptDialog = (rule: any) => {
        setDetailsDialogOpen(true);
        setSelectedRule && setSelectedRule(rule);
        setTabValue && setTabValue(1); // Switch to the prompt tab
    };

    const isElementInViewport = (el: HTMLElement) => {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    };

    useEffect(() => {
        if (scroll && moreRulesButtonRef.current && dialogContentRef.current) {
            const hasScrollbar = dialogContentRef.current.scrollHeight > dialogContentRef.current.clientHeight;
            const isButtonVisible = isElementInViewport(moreRulesButtonRef.current);
            if (!isButtonVisible) {
                moreRulesButtonRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [rules]);

    return (
        <>
            <span ref={dialogContentRef}/>
            <List >
                {rules?.map((rule, index) => (
                    <RuleListItem
                        key={index}
                        rule={rule}
                        index={index}
                        expandedIndices={expandedIndices}
                        setExpandedIndices={setExpandedIndices}
                        handleEnable={handleEnable}
                        handleDelete={handleDelete}
                        handleOpenPrompt={handleOpenPromptDialog}
                        ruleListItemActions={ruleListItemActions}
                    />
                ))}
                
                {fetchMoreRules &&  <ListItem sx={{ textAlign: 'center' }}>
                    <ListItemText
                        primary={
                            <Typography
                                variant="body1"
                                component="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    fetchMoreRules();
                                }}
                                sx={{ cursor: 'pointer', textDecoration: 'none', border: "none", width: '100%' }}
                            >
                                {rules.length == 0 ? "Suggest" : "More"} Rules
                            </Typography>
                        }
                    />
                </ListItem>}
                <span  ref={moreRulesButtonRef}></span>
            </List>
            {selectedRule && (
                <RuleDetailsDialog
                    open={detailsDialogOpen}
                    onClose={() => {setDetailsDialogOpen(false); setRequiresRefresh && setRequiresRefresh(Math.random())} }
                    rule={selectedRule}
                />
            )}
        </>
    );
};

export default RuleList;