import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Button, Tabs, Tab } from "@mui/material";
import { useDataProvider, useRecordContext } from 'react-admin';
import RuleList from './RuleList';
import AIPromptSuggest from './AIPromptSuggest';
import { IRule } from './interfaces';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export const GenAILogicDialog = ({ open, onClose, autoSuggest, record }: { open: boolean, onClose: () => void, autoSuggest: boolean, record?: any }) => {
    const [fetchedRules, setFetchedRules] = useState<IRule[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [tabValue, setTabValue] = useState<number>(0);
    const [selectedRule, setSelectedRule] = useState<any>(null);
    const [rulesTotal, setRulesTotal] = useState<number>(0);
    const [requiresRefresh, setRequiresRefresh ] = useState<number>(0);
    const dataProvider = useDataProvider();
    const projectRecord = useRecordContext() || record;

    const dialogContentRef = useRef<HTMLDivElement>(null);
    const aiPromptContentRef = useRef<HTMLDivElement>(null);

    console.log('GenAI Logic Dialog', record, projectRecord);
    
    const fetchMoreRuleSuggestions = () => {
        setLoading(true);
        if (!projectRecord) {
            console.error('No record found');
            return;
        }
        dataProvider.execute('Project', 'suggest_rules', { id: projectRecord.id })
            .then((response: { data: any; }) => {
                console.log('Fetched more rules:', response);
                const newRules = response.data.map((rule:any) => ({id: rule.id, ...rule.attributes}));
                setFetchedRules(prevRules => [...prevRules, ...newRules]);
                setRulesTotal(rulesTotal + response.data.length);
                setLoading(false);
            })
            .catch((error: any) => {
                console.error('Failed to fetch more rules:', error);
                setLoading(false);
            });
    };

    useEffect(() => {
        if(!autoSuggest || !projectRecord || !open) {
            return;
        }
        dataProvider.getManyReference(
            'Rule',
            {
                target: 'project_id',
                id: projectRecord.id,
                pagination: { page: 1, perPage: 100 },
                sort: { field: 'id', order: 'DESC' },
                filter: {status: "suggested"}
            }
        ).then((response: any) => {
            setRulesTotal(response.total);
            setFetchedRules(response.data);
            if(!response.data.length) {
                fetchMoreRuleSuggestions();
            }
            setLoading(false);
        }).catch((error: any) => {
            console.error('Failed to fetch rules:', error);
            setLoading(false);
        });

        
    }, [open, requiresRefresh]);

    
    const handleActivateRule = async (index: number) => {
        if(!projectRecord) {
            console.error('No project record found');
            return;
        }
        const selectedRule = fetchedRules[index];
        console.log(`Activate rule at index ${index}`, selectedRule);
        setLoading(true);
        try {
            //const response = await dataProvider.create('Rule', { data: { ...rule, project_id: projectRecord.id }});
            const response = await dataProvider.update('Rule', { id: selectedRule.id, data: { status: "active" }, previousData: selectedRule });
            console.log('Rule activated:', response);
            setRulesTotal(rulesTotal => rulesTotal - 1);
            // Optionally, you can update the rules state with the newly created rule
            setFetchedRules(prevRules => prevRules.filter(rule => rule.id !== selectedRule.id));
        } catch (error) {
            console.error('Failed to create rule:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (index: number) => {
        const selectedRule = fetchedRules[index];
        console.log(`Delete rule at index ${index}`, selectedRule);
        if (selectedRule) {
            try {
                //await dataProvider.delete('Rule', { id: selectedRule.id });
                await dataProvider.update('Rule', { id: selectedRule.id, data: { status: "rejected" }, previousData: selectedRule });
                setRulesTotal(rulesTotal => rulesTotal - 1);
                // Optionally, you can update the rules state with the newly created rule
                setFetchedRules(prevRules => prevRules.filter(rule => rule.id !== selectedRule.id));
            } catch (error) {
                console.error('Failed to delete rule:', error);
            }
        }
    };

    const handleOpenPrompt = (rule: any) => {
        console.log(`Open details for rule`, rule);
        // Add your open details logic here
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
        if(tabValue === 1) {
            aiPromptContentRef.current?.scrollIntoView({ behavior: 'auto' });
        }
    };

    if (!projectRecord) {
        return <Typography variant="body1"> No record</Typography>
    }
    return (
        <Dialog open={open} onClose={onClose} scroll="paper" maxWidth="lg" fullWidth sx={{ top: '1%', border: "0px solid red", height: "100vh" }}>
            <DialogTitle>
                GenAI - Logic &nbsp;{loading && <CircularProgress size={14} />}
            </DialogTitle>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="tabs">
                <Tab label="Prompt" />
                <Tab label="Suggestions" />
            </Tabs>
            <DialogContent ref={dialogContentRef} sx={{height : "100vh"}}>
            <Box position="relative" sx={{minHeight : "75vh"}}>
                <TabPanel value={tabValue} index={1} >
                    <Typography>{loading ? <>Requesting rule suggestions.. </> : ""}</Typography>
                    {loading && !fetchedRules?.length ? (
                        <></>
                    ) : (
                        <RuleList
                            rules={fetchedRules}
                            fetchMoreRules={fetchMoreRuleSuggestions}
                            handleEnable={handleActivateRule}
                            handleDelete={handleDelete}
                            handleOpenPrompt={handleOpenPrompt}
                            setSelectedRule={setSelectedRule}
                            selectedRule={selectedRule}
                            setTabValue={setTabValue}
                            scroll={true}
                            setRequiresRefresh={setRequiresRefresh}
                        />
                    )}
                </TabPanel>
                <TabPanel value={tabValue} index={0}>
                    <span ref={aiPromptContentRef} style={{position: "absolute", top:"0px"}}></span>
                    <AIPromptSuggest
                        selectedRule={selectedRule}
                    />
                </TabPanel>
            </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary" id="closeBtn">Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default GenAILogicDialog;