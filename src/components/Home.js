import * as React from "react";
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { Title } from 'react-admin';
import { useState} from 'react';
import Script from "react-load-script";
import {get_Conf} from '../Config.js'
import { withStyles } from '@material-ui/core/styles';

const styles = {
    home: {fontFamily : '"Roboto", "Helvetica", "Arial", sans-serif'},
};
//import universal from 'react-universal-component'

//const UniversalComponent = universal(props => import(`https://automat-c2.rccu-brussels.lan/imager/comp.js`))

const Content = () => <div >
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

const Demo = ({ready, config}) => {

    const [content, setContent] = useState(false);
    if (ready && content === false && window.getContent) {
        setContent(window.getContent(config))
    }
    return content ? <div dangerouslySetInnerHTML={{__html: content }} /> : <Content/>
}

const Home = (props) => {
    document.title = ""
    const { classes } = props;
    const config = get_Conf()
    const [scriptLoaded, setScriptLoaded] = useState(false);
    
    return <Card>
            <Title title="Home" />
            <CardContent>
                    <Script
                        url={config.settings?.HomeJS}
                        onError={(e) => {setScriptLoaded(true);console.error(e)}}
                        onLoad={()=>setScriptLoaded(true)}
                    />
                    <span className={classes.home}>
                        <Demo  ready={scriptLoaded} config={config}/>
                    </span>
            </CardContent>
            </Card>
}

export default withStyles(styles)(Home);
