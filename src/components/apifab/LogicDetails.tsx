import React, { useEffect, useState } from "react";
import { Box, Typography, List, Divider, Button, CircularProgress, LinearProgress  } from "@mui/material";
import { Select, MenuItem, InputLabel } from "@mui/material";
import { useDataProvider, useRefresh, Confirm, useGetManyReference, useNotify } from 'react-admin';
import { GenAILogicDialog } from './GenAILogicDialog';
import RuleList from './RuleList';
import RuleStatusSelect from './RuleStatusSelect';
import { useTranslate } from 'react-admin';

const LogicDetails = ({ record, appLinkStyle }: { record: any; appLinkStyle?: any }) => {
    const translate = useTranslate();
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [expandedIndices, setExpandedIndices] = useState<number[]>([]);
    const [detailsDialogOpen, setDetailsDialogOpen] = useState<boolean>(false);
    const dataProvider = useDataProvider();
    const [fetchedRules, setFetchedRules] = useState<any[]>([]);
    const [rulesPage, setRulesPage] = useState<number>(1);
    const [rulesTotal, setRulesTotal] = useState<number>(0);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
    const [selectedRule, setSelectedRule] = useState<any>(null);
    const [requiresRefresh, setRequiresRefresh ] = useState<number>(0);
    const [selectedRuleStatus, setSelectedRuleStatus] = useState<string[]>(["active","suggested","accepted"]);
    const refresh = useRefresh();
    const notify = useNotify();
    const projectId = record.id;

    const { data, isLoading, error, total } = useGetManyReference('Rule',
        {
            target: 'project_id',
            id: projectId,
            pagination: { page: rulesPage, perPage: 100 },
            sort: { field: 'id', order: 'DESC' },
            filter: selectedRuleStatus?.length ? {status: selectedRuleStatus.join(",")} : "none"
        }
    )

    const fetchMoreRules = () => {
        setRulesPage(rulesPage => rulesPage + 1);
    };

    const handleOpenPrompt = (rule: any) => {
        setDetailsDialogOpen(true);
    };

    const handleDelete = async (index: number) => {
        //setConfirmDialogOpen(true);
        await handleConfirmDelete(index);
    };

    const handleCreateRulesDialog = () => {
        setDialogOpen(true);
    };

    const closeDialog = () => {
        setRequiresRefresh(requiresRefresh => requiresRefresh + 1);
        setDialogOpen(false);
        refresh();
        window.scrollTo(0, 0);
    };

    const closeConfirmDialog = () => {
        setConfirmDialogOpen(false);
        setRequiresRefresh(requiresRefresh => requiresRefresh + 1);        
    };

    const handleSelectStatus = (event: React.ChangeEvent<{ value: unknown }>) => {
        setSelectedRuleStatus(event.target.value as string[]);
        console.log('selectedRuleStatus', selectedRuleStatus);
        setFetchedRules([]);
        setRequiresRefresh(requiresRefresh => requiresRefresh + 1);
    };

    const handleAcceptRule = async (index: number) => {
        if(!record) {
            console.error('No project record found');
            return;
        }
        if(loading){
            notify('Please wait for the current operation to complete', { type: 'warning' });
            return;
        }
        const selectedRule = fetchedRules[index];
        console.log(`Activate rule at index ${index}`, selectedRule);
        setLoading(true);
        try {
            const acceptResponse = await dataProvider.update('Rule', { id: selectedRule.id, data: { status: "accepted" }, previousData: selectedRule });
            console.log('Rule activated:', acceptResponse);
            notify(translate('wg.logic.rule_accepted'), { type: 'info' });
            await dataProvider.execute(`Project`, 'verify_rules', { id: projectId});
            selectedRule.description += '..';
            setSelectedRule(selectedRule);
            // Refresh rules
            const intervalId = setInterval(() => {
                selectedRule.description += '..';
                setSelectedRule(selectedRule);
                
                dataProvider.getOne('Rule', { id: selectedRule.id }).then(async (response: any) => {
                    console.log('Rule status:', response.data.status);
                    if(response.data.status === 'active') {
                        clearInterval(intervalId);
                        setRequiresRefresh(requiresRefresh => requiresRefresh + 1);
                        notify(translate('wg.logic.rule_activated'), { type: 'success' });
                        await dataProvider.execute(`Project`, 'restart', { id: projectId });
                    }
                    if(response.data.error) {
                        clearInterval(intervalId);
                        setRequiresRefresh(requiresRefresh => requiresRefresh + 1);
                        if(response.data.error.includes('Missing Attributes') || response.data.error.includes('AttributeError')) {
                            notify(translate('wg.logic.rule_activation_model_update'), { type: 'warning' });
                        } else {
                            notify(translate('wg.logic.rule_activated_errors'), { type: 'warning' });
                        }
                    }
                    setSelectedRule(response.data);
                });
            }, 500);
        
            for(let i=0; i<3; i++) {
                setTimeout(() => {
                    setRequiresRefresh(requiresRefresh => requiresRefresh + 1);
                    clearInterval(intervalId);
                }, 6000 + i*1200);
            }

        } catch (error) {
            console.error('Failed to create rule:', error);
        } 
    };

    const handleConfirmDelete = async (index: number) => {
        // Rejected status is used to deactivate a rule
        const selectedRule = fetchedRules[index];
        console.log('Recjecting rule:', selectedRule);
        setLoading(true);
        try {
            //await dataProvider.delete('Rule', { id: selectedRule.id });
            const response = await dataProvider.update('Rule', { id: selectedRule.id, data: { status: "rejected" }, previousData: selectedRule });
            console.log('Rule rejected:', response);
            setConfirmDialogOpen(false);
            setRulesTotal(rulesTotal => rulesTotal - 1);
            setRequiresRefresh(requiresRefresh => requiresRefresh + 1);
        } catch (error) {
            console.error('Failed to delete rule:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMoreRuleSuggestions = () => {
        setLoading(true);
        
        dataProvider.execute('Project', 'suggest_rules', { id: record.id })
            .then((response: { data: any; }) => {
                console.log('Fetched more rules:', response);
                const newRules = response.data.map((rule:any) => ({id: rule.id, ...rule.attributes}));
                setFetchedRules(prevRules => [ ...newRules, ...prevRules]);
                setRulesTotal(rulesTotal + response.data.length);
                setLoading(false);
            })
            .catch((error: any) => {
                console.error('Failed to fetch more rules:', error);
                setLoading(false);
            });
    };

    const handleIterateProject = () => {
        const projectId = record.id;
        const iterateUrl = `${window.location.origin}/admin-app/#/Home/iterate?project_id=${projectId}&prompt=update model&token=xxx`;
        // TODO: CSRF token
        document.location.href = iterateUrl;
        if(document.location.hash.startsWith('#/Home/')) {
            // force reload when in home screen, not necessary when in iterate screen
            window.location.reload();
        }
    }

    useEffect(() => { 
        console.log('Fetching rules for project:', record, selectedRuleStatus, rulesPage, requiresRefresh);
        dataProvider.getManyReference(
            'Rule',
            {
                target: 'project_id',
                id: record.id,
                pagination: { page: rulesPage, perPage: 100 },
                sort: { field: 'id', order: 'DESC' },
                filter: selectedRuleStatus?.length ? {status: selectedRuleStatus.join(",")} : "none"
            }
        ).then((response: any) => {
            setRulesTotal(response.total);
            setFetchedRules(response.data);
            setLoading(false);
        }).catch((error: any) => {
            console.error('Failed to fetch rules:', error);
            setLoading(false);
        });
        console.log('data', data);
    }, [rulesPage, requiresRefresh]);

    useEffect(() => {
        console.log('Cached rules for project:', record);
        if (!record) {
            return;
        }
        if(isLoading || error){
            return
        }
        setRulesTotal(total || 0);
        setFetchedRules(data || []);
    },[isLoading, data]);

    const hasRules = fetchedRules.length > 0;
    const ruleCountLabel = hasRules ? `Rules (${fetchedRules.length}/${rulesTotal})` : `No ${selectedRuleStatus} rules found`;

    console.log('record', record);
    console.log('fetchedRules', fetchedRules);
    let requiresModelUpdate = false;
    if(fetchedRules.length > 0){
        requiresModelUpdate = fetchedRules.some((rule) => rule.status == "accepted" && (rule.error?.includes('Missing Attributes') || rule.error?.includes('AttributeError')));
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" component="div">
                <RuleStatusSelect selectedRuleStatus={selectedRuleStatus} handleSelectStatus={handleSelectStatus} />
                { loading ? <Typography variant="body2" component="span" sx={{ color: 'primary.main', display: "inline-block", verticalAlign:"bottom", width : "calc(7ch)" }}>
                    Loading<LinearProgress  />
                </Typography> : <span style={{width : "calc(7ch)", display: "inline-block"}}></span>
                }

                
                <span style={{ verticalAlign:"bottom", textAlign: "right"}}>
                {
                    requiresModelUpdate && <Typography variant="body2" component="span" 
                                sx={{ color: 'error.main', display: "inline-block",  verticalAlign:"bottom", textAlign: "right", paddingLeft: "2em" }}>
                        Model update required to activate rules
                    </Typography>
                }
                </span>

                </Typography>
                <div> 
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCreateRulesDialog}
                    sx={{
                        '&:hover': {
                            backgroundColor: 'primary.main',
                            color: "#eee"
                        },
                    }}
                >
                {translate('wg.logic.rule_prompt')}
                </Button>
                &nbsp;
                <Button
                    variant="contained"
                    color="primary"
                    onClick={fetchMoreRuleSuggestions}
                    sx={{
                        '&:hover': {
                            backgroundColor: 'primary.main',
                            color: "#eee"
                        },
                    }}
                >
                {translate('wg.logic.suggest_rules')}
                </Button>
                &nbsp;
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleIterateProject}
                    sx={{
                        backgroundColor: requiresModelUpdate ? '#4682B4' : 'primary.main',
                        '&:hover': {
                            backgroundColor: 'primary.main',
                            color: "#eee"
                        },
                    }}
                >
                {translate('wg.logic.update_model')}
                </Button>
                </div>
            </Box>
            {hasRules &&
                <List>
                    <Divider />
                    <RuleList
                        rules={fetchedRules.sort((a, b) => a.id.localeCompare(b.id))}
                        handleEnable={handleAcceptRule}
                        handleDelete={handleDelete}
                        fetchMoreRules={rulesTotal > fetchedRules.length ? fetchMoreRules : undefined}
                        setRequiresRefresh={setRequiresRefresh}
                        selectedRule={selectedRule}
                        setSelectedRule={setSelectedRule}
                        handleOpenPrompt={handleOpenPrompt}
                        scroll={false} />
                </List>}
                <Typography variant="body2" sx={{width:"100%", textAlign:"right"}}> {ruleCountLabel} </Typography>
            <GenAILogicDialog open={dialogOpen} onClose={() => closeDialog()} autoSuggest={!hasRules} record={record}/>
            <Confirm
                isOpen={confirmDialogOpen}
                //loading={isPending}
                title={`Delete rule "${selectedRule?.description}"`}
                content="Are you sure you want to deactivate this rule?"
                onConfirm={async () => {}}
                onClose={closeConfirmDialog}
            />
        </Box>
    );
};

export default LogicDetails;