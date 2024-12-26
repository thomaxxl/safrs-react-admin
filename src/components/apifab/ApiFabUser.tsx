import React, { useState } from 'react';
import { useGetIdentity } from 'react-admin';
import { Show, SimpleShowLayout, TextField, DateField, RichTextField, Link } from 'react-admin';
import { useUpdate, useRecordContext } from 'react-admin';
import { Checkbox, FormControlLabel, FormGroup, Button } from '@mui/material';
import { parseJwt } from '../../util.tsx';
import { DynRelationshipMany, DynRelationshipOne } from '../DynInstance.tsx';
import { TabbedShowLayout, Tab, TabbedShowLayoutTabs, } from "react-admin";

interface UserSettingsProps {
    accepted_eula: boolean;
    accepted_marketing: boolean;
    accepted_privacy: boolean;
}

export const UserSettings = ({settings}:{settings:UserSettingsProps}) => {
    const [checked, setChecked] = useState(settings?.accepted_marketing);

    const record = useRecordContext();
    const [update, { data, isPending, error }] = useUpdate(
        'User',
        { id: record?.id, data: { settings: settings }, previousData: record }
      );


    const handleClick = () => {
        update();
    };

    //if (error) return <p>Error: {error.message}</p>;
    console.log(record)
    return <>
    
        {/* {JSON.stringify(settings)} */}
        
        <MarketingCheckbox settings={settings} checked={checked} setChecked={setChecked}/>
        
        <Button onClick={handleClick} variant="outlined">
        {isPending ? 'Updating...' : 'Save Changes'}
        </Button>
        {error?.message || ''}
    </>
}

const MarketingCheckbox = ({settings, checked, setChecked}:{settings:UserSettingsProps, checked: boolean, setChecked:any}) => {
    
    const handleChange = (event:any) => {
        setChecked(event.target.checked);
    };

    return (
        <FormGroup>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={checked}
                        onChange={handleChange}
                        name="checked"
                        color="primary"
                    />
                }
                label="Receive e-mail notifications"
            />
        </FormGroup>
    );
};

export const SecuritySettings = ({identity}:{identity:any}) => {

    return <>
        <Link to="https://apifabric.ai/static2/privacy-policy.html" target="_blank">Privacy Policy</Link>
        <br/>
        <Link to="https://kc.apifabric.ai/realms/kcals/account">Manage Security Settings</Link>
        <br/>
        <Link to={`https://apifabric.ai/deleteUser?id=${identity.id}`} >Delete Account</Link>
            
    </>
}

export const ApiFabUser = (props:any) => {

    console.log("afprop",props)
    const { identity, isLoading } = useGetIdentity();
    const record = useRecordContext();
    const authToken = parseJwt(localStorage.getItem('authToken')||"");
    if (!record) return null;

    if (isLoading) return <div>Loading...</div>;

    if (!identity || !authToken || !record.id) return <div>No user found</div>;

    const tabs = props?.tab_groups?.map((tab: any) => {
        const basePath = `/${props?.resource_name}`;
        if (tab.direction === "tomany") {
          // <> "toone"
          return DynRelationshipMany(props.resource_name, record.id, tab, basePath);
        }
        if (tab.direction === "toone") {
          return DynRelationshipOne(props.resource_name, `${record.id}`, tab);
        }
      });
    
    const selectedIdentity = identity.id === record.id ? identity : {id:record.id};
    
    return <>
    
        {/* Identity:
        <pre>{JSON.stringify(identity, null, 4)}</pre>
        SSO info:
        <pre>{JSON.stringify(authToken, null, 4)}</pre> */}
        
        <Show actions={false}>
            <SimpleShowLayout>
                {/* <TextField source="id" /> */}
                <TextField source="username" />
                <br/>
                
                <SecuritySettings identity={selectedIdentity}/>
                <UserSettings settings={record.settings || {}} />
                <hr style={{ margin: "30px 0px 30px" }} />
                <TabbedShowLayout
                    tabs={
                    <TabbedShowLayoutTabs variant="scrollable" scrollButtons="auto" />
                    }
                >
                    {tabs}
                </TabbedShowLayout>
            </SimpleShowLayout>
        </Show>

        
        
        
        </>
}

export const UserMenu = () => {

    return <>Menu</>

}