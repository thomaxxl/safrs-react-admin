import * as React from "react";
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { Title } from 'react-admin';
import { useNotify, useRedirect } from 'react-admin';
import { useState} from 'react';
import Script from "react-load-script";
import {get_Conf} from '../Config.js'


//import universal from 'react-universal-component'

//const UniversalComponent = universal(props => import(`https://automat-c2.rccu-brussels.lan/imager/comp.js`))

const Demo = ({ready}) => {
    const [content, setContent] = useState(false);
    if (ready && !content && window.getContent) {
        setContent(window.getContent())
    }
    return content ? <div dangerouslySetInnerHTML={{__html: content }} /> : <span>No Content</span>
}

const Home = () => {
    const config = get_Conf()
    const redirect = useRedirect();
    const [scriptLoaded, setScriptLoaded] = useState(false);
	
    return <Card>
            <Title title="Home" />
            <CardContent>
                    <Script
                        url={config.settings?.HomeJS}
                        onError={(e) => {setScriptLoaded(false);console.error(e)}}
                        onLoad={()=>setScriptLoaded(true)}
                    />
                    <Demo ready={scriptLoaded} />
            </CardContent>
            </Card>
}

export default Home;
