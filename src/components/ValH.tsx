import { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import MuiAccordion from "@mui/material/Accordion";
import MuiAccordionSummary from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import { AccordionProps as MuiAccordionProps, AccordionSummaryProps as MuiAccordionSummaryProps, Box } from "@mui/material";
import { useConf } from "../Config";
import { Link } from "react-admin";
import CodeSnippet from './util/CodeSnippet';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { UnthemedCollapsAccordion } from "./util/Accordion";
import { useHash } from "../util";
//import LogicDetails from "./apifab/LogicDetails";
import LogicInfo from "./LogicInfo";

/*
ApiLogicProject Home Page
*/
export default function ALPHome() {
  const conf = useConf();
  const hash = useHash();
  const [showDevelop, setShowDevelop] = useState(document.location.hash.includes('/develop'));
  let uiUrl = {pathname: ""};
  sessionStorage.setItem('sidebarOpen', "true");
  try{
    uiUrl = new URL(conf.api_root);
  }
  catch(e){
    console.log('api_root not set')
  }
  uiUrl.pathname = uiUrl.pathname.replace('/api', '/') + '/ui/';
  const dberUrl = uiUrl + 'dber.svg';
  let projData0 = {name: "", description: "", prompt: "", download: ""};
  const [projData, setProjData] = useState(projData0);
  const projUrl = uiUrl + 'project.json';
      
  useEffect(() => {
    setShowDevelop(window.location.hash.includes('/develop'));
  }, [hash]);

  useEffect(() => {
    const fetchData = async () => {
      const gptRespUrl = uiUrl + 'response.json';
      let projData = projData0;

      try {
        const projResponse = await fetch(projUrl);
        projData = await projResponse.json();
      }
      catch (error) {
        console.error('Error fetching data:', error);
      }
      try{
        const gptResponse = await fetch(gptRespUrl);
        const gptData = await gptResponse.json();
        projData.rules = gptData.rules;
      }
      catch (error) {
        console.error('Error fetching data:', error);
      }
      setProjData(projData);
      
    };

    fetchData();
    
  }, [projUrl]);

  const dber = dberUrl.toString();
  const code = `docker run -p5656:5656 -it apilogicserver/api_logic_server bash -c \\
"curl ${document.location.origin}${projData?.download} | tar xvfz - ; ${projData?.name}/run.sh"`;

  if(!uiUrl.pathname){
    return <>Invalid api_root in Config</>;
  }
  return (
    <>
      <Typography variant="h6" align="left">
        Project Info
      </Typography>
      <ProjectInfo projData={projData} conf={conf}/>
      <br/>
      <Typography variant="body2" color="textSecondary" component="p"></Typography>
      <LogicInfo projData={projData}/>
      { projData?.name ? 
      <UnthemedCollapsAccordion title="Develop" defaultExpanded={showDevelop} >
        <Typography variant="body2">
          <ul>
            <li>
              A standard multi-table JSON:API - explore Open API <Link to={`${conf.api_root}/index.html`} target="_blank">Explore OpenAPI</Link>
            </li>
            <li>
              <Link to={`${document.location.origin}${projData?.download}`} target="_blank">Project Download</Link> (Open in your IDE to add customizations such as logic & security)
            </li>
            <li>
              Run in container
              <CodeSnippet code={code} />
            </li>
            <li>
              <Link to={"https://github.com/apifabric/" + projData?.name} target="_blank">Github Repository</Link>
            </li>
          </ul>
        </Typography>
      </UnthemedCollapsAccordion> : null }
      
      <About />
      <br/>
      <DBER dber={dber} />

    </>
  );
}

const ProjectInfo = ({ projData, conf }: { projData: { name: string, description: string, prompt: string, download: string }, conf: any }) => {
  
  if(!projData.name) {
    return <></>
  }
  return (
    <Typography variant="body2" color="textSecondary" component="p">
      <Box component="dl" sx={{ display: 'grid', gridTemplateColumns: 'max-content auto', gap: '0.5em' }}>
        <Box component="dt" sx={{ fontWeight: 'bold' }}>Name</Box>
        <Box component="dd">{projData?.name?.replace("_", " ")}</Box>
        {projData?.description && (
          <>
            <Box component="dt" sx={{ fontWeight: 'bold' }}>Description</Box>
            <Box component="dd">{projData?.description}</Box>
          </>
        )}
        {projData?.prompt && (
          <>
            <Box component="dt" sx={{ fontWeight: 'bold' }}>Prompt</Box>
            <Box component="dd">{projData?.prompt?.split('\n').map(line => <>{line}<br/></>) }</Box>
            <Box component="dt" sx={{ fontWeight: 'bold' }}>Landing Page</Box>
            <Box component="dd">
              <Link to="/raSpa" target="_blank">Landing Page</Link>
              <br/>
              <Link to="/SPASection">Landing Page Admin</Link>
            </Box>
          </>
        )}
        
      </Box>
    </Typography>
  );
};

const About = () => {

  const showAboutCount = JSON.parse(localStorage.getItem('showAboutCount') || "10") // default 10 because of all the rerenndering
  const showAbout =  showAboutCount > 0 
  localStorage.setItem('showAboutCount', ( showAboutCount - 1 ).toString());
  const conf = useConf();

  return (
    <UnthemedCollapsAccordion title="About WebGenAI" sx={{ borderBottom: '1px solid #ccc' }} defaultExpanded={showAbout} >
      <Typography variant="body2">
        API Logic Server / GenAI Microservice Automation has turned your prompt into a microservice:
        <ul>
          <li>
            A multi-table application - explore the links in the left-hand menu
          </li>
          <li>
            A standard multi-table JSON:API - explore Open API <Link to={`${conf.api_root}/index.html`} target="_blank">here</Link>
          </li>
        </ul>
        
        <br />

        <b>Instant Microservice</b>, Customize with Declarative Rules and Python in your IDE from a simple Natural Language Prompt (or existing database), you get: <br/>
          <br/>
          <span style={{verticalAlign: 'top'}}>
            1. </span><details style={{display : "inline"}}>
            <summary>Instant Working Software - Get the requirements right</summary>
            Automation has turned your prompt into a microservice: a working <b>application</b>, and a <b>standard API</b>.
            <br/>
            It simply cannot be faster or simpler.
            <ul>
              <li>Eliminate weeks to months of complex framework coding, db design, or screen painting.</li>
              <li>Iterate 15 times... before lunch.</li>
            </ul>
            </details>
          <br/><br/>
          <span style={{verticalAlign: 'top'}}>
            2. </span><details style={{display : "inline"}}>
            <summary>Customize - Declarative Rules and Python in your IDE</summary>
            The speed and simplicity, plus all the flexibility of a framework.
            <ul>
              <li>Download the generated project, and <Link target="_blank" to="https://apilogicserver.github.io/Docs/Tutorial/#3-customize-and-debug-in-your-ide">customize in your IDE</Link>              </li>
              <li><Link target="_blank" to="https://apilogicserver.github.io/Docs/Security-Overview/">Declarative security</Link>: configure keycloak authentication, declare role-based row authorization</li>
              <li><Link target="_blank" to="https://apilogicserver.github.io/Docs/Logic-Why/">Declarative business logic</Link>: multi-table constraints and derivations using unique rules that are 40X more concise than code, extensible with Python.</li>
              <li>Use standard Python: e.g. provide <Link target="_blank" to="https://apilogicserver.github.io/Docs/Sample-Integration/">Application integration</Link> (e.g., custom APIs and kafka messaging).</li>
            </ul>
            </details>
          <br/><br/>
          <span style={{verticalAlign: 'top'}}>
            
            3. </span><details style={{display : "inline"}}>
            <summary>Deploy - Standard container, no fees, no lock-in</summary>
            
            <ul>
              <li>Created projects include scripts to automate docker creation, so you can deploy anywhere. 
              </li>

              <li>There are no runtime fees, no lock-in.
              </li>
            </ul>
            </details>
            <br/>
            <br/>
          To create unlimited projects in your environment, contact <Link to="mailto:apilogicserver@gmail.com" sx={{color: "#bf2222", fontWeight: "bold", textDecoration: "none"}}>apilogicserver@gmail.com</Link> for a free docker image, and project support.
        
          
      </Typography>
    </UnthemedCollapsAccordion>
  );
};

const DBER = ({ dber }: { dber: string }) => {
  const defaultStyle = { height: `600px`, width: "auto" };
  const [style, setStyle] = useState(defaultStyle);
  const [show, setShow] = useState(true);

  const handleClick = () => {
    setStyle(style.width === '100%' ? defaultStyle : { width: '100%', height: 'auto' });
  };

  if (!show) {
    return null;
  }

  return (
    <>
      <Typography variant="h6" align="left">
        Automatically Generated Database - Diagram
      </Typography>
      <img src={dber} alt="dber" style={style} onClick={handleClick} onError={() => setShow(false)} />
    </>
  );
};