import * as React from "react";
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { Title } from 'react-admin';
import { useNotify, useRedirect } from 'react-admin';
import { useState} from 'react';
import Script from "react-load-script";
import {get_Conf} from '../Config.js'
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import {Link} from "react-router-dom";
import { resetConf } from "./ConfigurationUI";

//import universal from 'react-universal-component'

//const UniversalComponent = universal(props => import(`https://automat-c2.rccu-brussels.lan/imager/comp.js`))

const Content = () => <div>
        <h2>APILogicServer</h2>
        <p>
            Creates API endpoints exposing database tables and relationships.
            <br/>
            Provides a ReactJS frontend that connects to the API.
            <br/><br/>
            This stack is easily extendible:
            <br/>
            <ul>
            <li>Business logic can be implemented using</li>
            <ul>
                <li>Python database logic rule engine (constraint enforcement, triggers, multi-table derivations)</li>
                <li>Custom API hooks and endpoints</li>
            </ul>
            <li>Custom ReactJS components can be added to the webapp</li>
            </ul>
        </p>
    </div>

const Demo = ({ready}) => {
    const [content, setContent] = useState(false);
    if (ready && !content && window.getContent) {
        setContent(window.getContent())
    }
    return content ? <div dangerouslySetInnerHTML={{__html: content }} /> : <Content/>
}

const Home = () => {
    const config = get_Conf()
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [initialized, setInitialized] = useState(false)
	
    if(!initialized && !config.settings){
        resetConf()
        setInitialized(true)
    }
    const init = config.settings ? null : <Link to={{ pathname: "/configuration" }}>
                                            <Button variant="contained" color="link"> Initialize Configuration</Button>
                                        </Link>
    return <Card>
                <Title title="Home" />
                <CardContent>
                        <Script
                            url={config.settings?.HomeJS}
                            onError={(e) => {setScriptLoaded(false);console.error(e)}}
                            onLoad={()=>setScriptLoaded(true)}
                        />
                        <Demo ready={scriptLoaded} />
                        {init}
                </CardContent>
                
            </Card>
}

export default Home;
