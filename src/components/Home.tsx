import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { Title } from "react-admin";
import { useState } from "react";
import Script from "react-load-script";
import { useConf } from "../Config";
import Button from "@mui/material/Button";
import { resetConf } from "./ConfigurationUI";
import ALSDesc from "./ValH";
import get_Component from "../get_Component";
// import {GApiFab, ApiFab} from './ApiFab'

import { Link } from "react-router-dom";

const Demo = ({ ready, config }: { ready: any; config: any }) => {
  const [content, setContent] = useState(false);
  if (ready && content === false && (window as any)?.getContent) {
    setContent((window as any).getContent(config));
  }
  return content ? (
    <div
      dangerouslySetInnerHTML={{ __html: content }}
      style={{ fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' }}
    />
  ) : (
    <ALSDesc />
  );
};

const Home = (props: any) => {
  document.title = "";
  const config = useConf();
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [initialized, setInitialized] = useState(false);
  /* for(let [resource_name, resource] of Object.entries(config.resources)){
        console.log(`prefetch ${resource_name}`)
        dataProvider.getList(resource.name, 
            {
                pagination: { page: 1, perPage: resource.perPage || 25 },
                sort: { field: resource.sort?.field , order: resource.sort?.order || 'ASC' },
                filter : {}
            })
            .then(()=>{
            resourcesLoaded.push(resource.name)
            setResourcesLoaded(resourcesLoaded)
        })
    } */
  if (!initialized && !config.settings) {
    alert();
    resetConf({});
    setInitialized(true);
  }

  
  // if(document.location.origin.includes('g.apifabric.ai')){
  //   return <GApiFab/>
  // }
  // else if(document.location.origin.includes('apifabric.ai')){
  //   return <ApiFab/>
  // }
  

  const init = config.settings ? null : (
    <Link to={{ pathname: "/configuration" }}>
      <Button
        variant="contained"
        color="primary"
        style={{ fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' }}
      >
        {" "}
        Initialize Configuration
      </Button>
    </Link>
  );
  let content = (
    <>
      <Script
        url={config.settings?.HomeJS}
        onError={(e: any) => {
          setScriptLoaded(true);
          console.error(e);
        }}
        onLoad={() => setScriptLoaded(true)}
      />
      <Demo ready={scriptLoaded} config={config} />
      {init}
    </>
  );
  if (config?.settings?.Home) {
    const HomeComp = get_Component(config.settings.Home);
    if (HomeComp !== null) {
      content = <HomeComp />;
    }
  }

  return (
    <Card>
      <Title title="Home" />
      <CardContent style={{ fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' }}>{content}</CardContent>
    </Card>
  );
};

export default Home;
