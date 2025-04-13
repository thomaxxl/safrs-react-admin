import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, Backdrop, CircularProgress, Typography, RadioGroup, FormControlLabel, Radio, Button, Divider, IconButton, Tooltip, Popover } from '@mui/material';
import CodeSnippet from './CodeSnippet';
import { IRule } from './interfaces';
import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import { useDataProvider, useRecordContext, useNotify } from 'react-admin';
import ReactMarkdown from 'react-markdown';

const RuleDetails = ({ rule, onClear }: { rule: IRule, onClear?: () => void }) => {
    
    return (
        <Box>
            {onClear && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" color="primary">Selected Rule</Typography>
                    <Box>
                        <Tooltip title="Edit rule">
                            <IconButton color="primary" component="a" href={`#/Rule/${rule.id}/edit`} sx={{color: "#ccc"}}>
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Remove selected rule">
                            <IconButton
                                onClick={onClear}
                                color="secondary"
                            >
                                <ClearIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            )}
            <Box sx={{ backgroundColor: 'rgba(0, 0, 0, 0.05)', borderRadius: '4px', padding: '16px', marginBottom: '16px' }}>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>Name</Typography>
                <Typography variant="body2">{rule.name}</Typography>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>Description</Typography>
                <Typography variant="body2">{rule.description}</Typography>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>Use case</Typography>
                <Typography variant="body2">{rule.use_case}</Typography>
                <CodeSnippet code={rule.code} />
                {rule.error && (
                    <>
                        <Typography variant="body2" sx={{ fontWeight: "bold" }} color="error">Error</Typography>
                        <Typography variant="body2" color="error">{rule.error}</Typography>
                    </>
                )}
            </Box>
        </Box>
    );
};

const AIPromptTab = ({ selectedRule, open }: { selectedRule: IRule | null, open?: boolean }) => {
    const [currentRule, setCurrentRule] = useState<IRule | null>(selectedRule);
    const [suggestedRules, setSuggestedRules] = useState<IRule[]>([]);
    const [selectedOption, setSelectedOption] = useState('generate');
    const [aiResponse, setAiResponse] = useState<string>('');
    const [aiPromptValue, setAIPromptValue] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const textFieldRef = useRef<HTMLInputElement>(null);
    const dataProvider = useDataProvider();
    const record = useRecordContext();

    const fetchRule = () => {
        setLoading(true);
        if (!record) {
            console.error('No record found');
            return;
        }

        dataProvider.execute('Project',
            'suggest_rule',
            {
                id: record.id,
                args: { prompt: aiPromptValue, type: selectedOption, current_rule: currentRule }
            })
            .then((response: { data: any; }) => {
                console.log('response:', response);
                if (selectedOption === 'generate') {
                    setSuggestedRules(response.data);
                }
                else {
                    setAiResponse(response.data);
                }
                setLoading(false);
            })
            .catch((error: any) => {
                console.error('Failed to fetch more rules:', error);
                setLoading(false);
            });
    };

    const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedOption(event.target.value);
        handleOptionChange(event);
    };

    const handlePromptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAIPromptValue(event.target.value);
    };

    const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log('Option changed:', event.target.value);
        // Add your option change logic here
    };

    const handlePromptSubmit = () => {
        console.log('Prompt submitted:', aiPromptValue);
        fetchRule()
        // Add your prompt submit logic here
    };

    const handleClearSelectedRule = () => {
        setCurrentRule(null);
    };

    useEffect(() => {
        if (textFieldRef.current) {
            setTimeout(() => textFieldRef?.current?.focus(), 120);
        }
    }, []);

    console.log('selectedRule:', selectedRule);
    console.log('suggestedRules:', suggestedRules);

    let radioText = selectedOption === 'generate' ? 'Suggest a new rule based on the prompt' : 'Ask a question based on the prompt';
    if (currentRule) {
        radioText += ', the current rule'
    }
    radioText += ' and the backend data model';
    return (
        <>
            <span ref={textFieldRef} style={{ position: "absolute", top: "-4em" }} />
            {currentRule && <RuleDetails rule={currentRule} onClear={handleClearSelectedRule} />}
            <Box position="relative" sx={{ height: "100%" }}>
                <TextField
                    value={aiPromptValue}
                    onChange={handlePromptChange}
                    label="Prompt"
                    multiline
                    rows={5}
                    variant="outlined"
                    fullWidth
                    InputProps={{ style: { minHeight: '100px' } }}
                    inputRef={textFieldRef}
                />
                {loading && (
                    <Backdrop sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: (theme) => theme.zIndex.drawer + 1, color: '#fff' }} open={loading}>
                        <CircularProgress color="inherit" />
                    </Backdrop>
                )}
                <Typography variant="body2" color="textSecondary" style={{ marginTop: '8px' }}>
                    {radioText}
                </Typography>
                <RadioGroup aria-label="options" name="options" value={selectedOption} onChange={handleRadioChange} row sx={{ marginTop: '8px' }}>
                    <FormControlLabel value="generate" control={<Radio />} label="New Rule" />
                    <FormControlLabel value="question" control={<Radio />} label="Question" />
                </RadioGroup>
                <Button onClick={handlePromptSubmit} color="primary" variant="outlined" disabled={loading || !aiPromptValue} sx={{ '&:focus, &:active': { borderColor: 'white', outline: 'none' }, width: "8em" }}>
                    Submit
                </Button>
                <Box sx={{ marginTop: '1em' }} >
                    {(selectedOption == "generate" && suggestedRules.length) ? suggestedRules.map((rule: IRule) => <SuggestedRule rule={rule} key={rule.code} />) : null}

                    {selectedOption == "question" && aiResponse && <AiResponse response={aiResponse} />}
                </Box>
            </Box>
        </>
    );
};

const SuggestedRule = ({ rule }: { rule: IRule }) => {

    const notify = useNotify();
    const dataProvider = useDataProvider();

    const handleActivateRule = async () => {
        notify('Activating rule');
        try {
            const response = await dataProvider.update('Rule', { id: rule.id, data: { status: "accepted" }, previousData: rule });
            console.log('Rule activated:', response);
            notify('Rule activated');
        } catch (error) {
            console.error('Failed to create rule:', error);
            notify('Failed to create rule', { type: 'error' });
        }
    };

    return <Box sx={{ marginTop: '1em' }} >
        <RuleDetails rule={rule} />
        <Button color="primary" variant="outlined" sx={{ width: "8em" }} onClick={async () => { await handleActivateRule() }}>
            Accept
        </Button>&nbsp;
        {rule && <Button color="primary" variant="outlined" sx={{ width: "8em" }} onClick={async () => { await alert('tbd') }}>
            Replace
        </Button>
        }
    </Box>
}

const AiResponse = ({ response }: { response: any }) => {
    const markdown = response?.markdown
    const rules = response?.rules
    return <Box sx={{ marginTop: '1em' }} >
        <Typography variant="h6" color="primary">AI Response</Typography>
        <Typography variant="body2" component="div"><ReactMarkdown>{markdown}</ReactMarkdown></Typography>
        {rules && rules.map((rule: IRule) => <SuggestedRule rule={rule} />)}
    </Box>
}


export default AIPromptTab;