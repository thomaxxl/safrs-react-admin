import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { Title, useRedirect } from "react-admin";
import { useState } from "react";
import Script from "react-load-script";
import { useConf } from "../Config";
import Button from "@mui/material/Button";
import { resetConf } from "./ConfigurationUI";
import ALSDesc from "./ValH";
import get_Component from "../get_Component";
import { Link } from "react-router-dom";
import { ApiFab, GApiFab } from "./apifab/ApiFab";

const Demo = ({ ready, config }: { ready: any, config: any }) => {
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
  const redirect = useRedirect();

  if (!initialized && !config.settings) {
    alert();
    resetConf({});
    setInitialized(true);
  }
  
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
  let content = <></>

  if(Object.keys(config).length === 0 || config?.about?.default_config){
    redirect("/Configuration")
  }

  if (config?.settings?.Home) {
    if(config?.settings?.Home === "ApiFab" || config?.settings?.Home === "WebGenie"){
      content = <ApiFab/>
    }
    else if(config?.settings?.Home === "GApiFab"){
      content = <GApiFab/>
    }
    else {
      const HomeComp = get_Component(config.settings.Home);
      if (HomeComp !== null) {
        content = <>Invalid Home Comp {config?.settings?.Home}</>;
      }
    }
  }
  else {
    content = (
      <>
        {/* <Script
          url={config.settings?.HomeJS || "#"}
          onError={(e: any) => {
            setScriptLoaded(true);
            console.error('Script Load error', e);
          }}
          onLoad={() => setScriptLoaded(true)}
        /> */}
        <Demo ready={scriptLoaded} config={config} />
        {init}
      </>
    );
  }

  // if(document.location.href.includes('host:3000')) {
  //   return <GApiFab/>
  // }
  
  // if(document.location.origin.includes('g.apifabric.ai')){
  //   content =  get_Component("GApiFab")
  // }
  // if(['http://localhost:3000','http://localhost:5657','https://apifabric.ai'].includes(document.location.origin)){
  //   document.title = "ApiFabric - AI driven API";
  //   content = <ApiFab/>
  // }
 

  return (
    <Card>
      <Title title="Home" />
      <CardContent style={{ fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' }}  id="home">{content}</CardContent>
    </Card>
  );
};

export default Home;
