import { useState, useEffect, Fragment } from "react";
import {
  useNotify,
  useRedirect,
  useDeleteMany as useManyDelete,
  useCreatePath,
} from "react-admin";
import Grid from "@mui/material/Grid";
import { Tabs, Tab, Box, Paper } from "@mui/material";
import {
  TabbedShowLayout,
  TabbedShowLayoutTabs,
  useDataProvider,
  SimpleShowLayout,
  useRecordContext,
  Link,
  useGetOne,
  List,
  Datagrid,
  TextField,
  useGetMany,
} from "react-admin";
import { Typography, Stack, Divider } from "@mui/material";
import { useRefresh } from "react-admin";
import { ShowAttrField } from "../DynFields";
import { DynRelationshipOne, DynRelationshipMany } from "../DynInstance";
import { useConf } from "../../Config";
import { on } from "events";
import { StartStopModal } from "./StartStopModal.tsx";
import Button from "@mui/material/Button";
import CodeSnippet from "../util/CodeSnippet";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DownloadIcon from "@mui/icons-material/Download";
import LogicDetails from "./LogicDetails.tsx";
import DataModelModal from "./DataModelModal.tsx";
import ProjectLog from "./ProjectLog.tsx"
import { useTranslate } from 'react-admin';

const IterationEntry = ({ record, current }: { record: any; current: boolean }) => {
  const createPath = useCreatePath();
  let entry = current ? (
    <b>{record.prompt}</b>
  ) : (
    <Link to={createPath({ resource: "Project", type: "show", id: record.id })}>
      {record.prompt}
    </Link>
  );
  entry = (
    <>
      {record.created_at?.split(" ")[0] || " - "} {entry}
    </>
  );

  return (
    <Typography variant="body2" color="textSecondary" component="p">
      {entry}
    </Typography>
  );
};

const NewLines = ({ text }: { text: string }) => {
  const lines = text.split("\n");

  return (
    <>
      {lines.map((line, index) => (
        <Fragment key={index}>
          {line}
          <br />
        </Fragment>
      ))}
    </>
  );
};

const Ancestor = ({ record, current = false }: { record: any; current?: boolean }) => {
  const parentId = record.parent?.data?.id;
  const dataProvider = useDataProvider();
  const [ancestor, setAncestor] = useState({ id: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!parentId) {
      return;
    }
    dataProvider
      .getOne("Project", { id: parentId })
      .then(({ data }) => {
        setAncestor(data);
        setLoading(false);
      })
      .catch((error) => {
        console.warn("Ancestor", error.message, error, loading);
        setLoading(false);
      });
  }, []);

  if (!record?.id) {
    return <></>;
  }

  return (
    <div>
      {ancestor?.id && <Ancestor record={ancestor} />}
      <IterationEntry record={record} current={current} />
    </div>
  );
};

const Children = ({ record, current }: { record: any; current: boolean }) => {
  const childIds = record.iterations?.data?.map((child: any) => child.id);
  const { data, isLoading, error } = useGetMany("Project", {
    ids: childIds,
    meta: { include: ["iterations"] },
  });

  if (isLoading || !data) return <></>;
  if (error) return <p>ERROR: {error.message}</p>;

  return (
    <div>
      {data?.map((child: any) => {
        console.log("child", child);
        return (
          <span key={child.id}>
            <IterationEntry record={child} current={false} />
            <Children record={child} current={false} />
          </span>
        );
      })}
    </div>
  );
};

const ShowIterations = ({ record }: { record: any }) => {
  return (
    <div>
      <Ancestor record={record} current={true} />
      <Children record={record} current={true} />
    </div>
  );
};

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const ProjectTabs = ({ record, appLinkStyle }: { record: any; appLinkStyle: any }) => {
  const resource_name = "Project";
  const basePath = `/${resource_name}`;
  const conf = useConf();
  const tab_groups = conf.resources?.Project?.tab_groups;
  const [tabValue, setTabValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    if (window.location.hash.includes("tab=logic")) { // check ValH.tsx
      setTabValue(1);
    }
  }, []);


  console.log("show", tab_groups);
  const hasFamily = record.parent_id || record.iterations?.data?.length > 0;

  console.log("showrecord", record);
  if (!record) {
    return <>...</>;
  }
  console.log("confapi_root", conf.api_root);
  return (
    <Box sx={{ width: "100%", marginTop: "-2px" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tabValue} onChange={handleChange} aria-label="project tabs">
          <Tab label="Overview" {...a11yProps(0)} />
          <Tab
            label="Logic"
            {...a11yProps(1)}
            //sx={{ display: document.location.href.includes('logic') ? "inline-block" : "none" }}
          />
          <Tab
            label="Iterations"
            {...a11yProps(2)}
            sx={{ display: hasFamily ? "inline-block" : "none" }}
          />
        </Tabs>
      </Box>

      <AppDetailsPanel value={tabValue} index={0}>
        <ProjectDetails record={record} appLinkStyle={appLinkStyle} />
      </AppDetailsPanel>

      <AppDetailsPanel value={tabValue} index={1}>
        <LogicDetails record={record} appLinkStyle={appLinkStyle}  />
      </AppDetailsPanel>

      <AppDetailsPanel value={tabValue} index={2}>
        <ShowIterations record={record} />
      </AppDetailsPanel>
    </Box>
  );
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export const AppDetailsPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  const dataProvider = useDataProvider();
  useEffect(() => {
    // fetch /Project to verify the user is authenticated, if this fails the user will be redirected to the login page
    //dataProvider.getList('Project', { pagination: { page: 1, perPage: 1 }, sort: { field: 'id', order: 'DESC' }, filter: {} })
  }, [dataProvider]);

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const Xr = () => <div style={{ height: "0.5em" }}></div>;

const UserDetail = ({ id }: { id: string }) => {
  const { data, isLoading, error } = useGetOne("User", { id: id });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  console.log("UserDetail", data);
  return (
    <div>
      <p>User: {data?.username}</p>
    </div>
  );
};


const ProjectDetails = ({ record, appLinkStyle }: { record: any; appLinkStyle: any }) => {
  const translate = useTranslate();
  const name = record.display_name || record.name;
  const conf = useConf();
  const code = `docker run -p5656:5656 -it apilogicserver/api_logic_server bash -c \\
"curl ${document.location.origin}${record.download} | tar xvfz - ; ${name}/run.sh"`;
  const buttonStyle = {
    textTransform: "none",
    fontWeight: "bold",
    border: "1px solid #eee",
    width: "100%",
    display: "inline-block",
  };

  const appLink = record.link?.startsWith('http') ? record.link : `${document.location.origin}${record.link}`;
  const datamodelSvg = conf.api_root.replace(new RegExp("api$"),record.id + "/ui/dber.svg");

  const repository = record.repository ;
  console.log("datamodelSvg", datamodelSvg);

  return (
    <>
      
        <Grid container spacing={2}>
          <Grid item xs={2}>
            {record.running ? (
              <Button
                sx={buttonStyle}
                onClick={() => window.open(`${appLink}`, "_blank")}
              >
                {translate("wg.show.open_app")} <OpenInNewIcon style={{ height: "0.75em", verticalAlign: "middle" }} />
              </Button>
            ) : (
              <StartStopModal record={record} buttonVal={"Start App"} sx={buttonStyle} />
            )}
          </Grid>
          <Grid item xs={2}>
            <Button
              sx={{
                textTransform: "none",
                border: "1px solid #eee",
                width: "100%",
              }}
              onClick={() => window.open(`${document.location.origin}${record.download}`, "_blank")}
            >
               {translate("wg.show.download")} <DownloadIcon style={{ height: "0.75em", verticalAlign: "middle" }} />
            </Button>
          </Grid>
          <Grid item xs={2}>
            { document.location.hash.includes(record.id) ? null : <Button
              sx={{
                textTransform: "none",
                border: "1px solid #eee",
                width: "100%",
              }}
              onClick={() => document.location.href = `${document.location.pathname}#/Project/${record.id}/show`}
            >
               {translate("wg.show.manager")} 
            </Button>}
          </Grid>
        </Grid>
      

      <Xr />
      <Grid container spacing={2}>
        <Grid item xs={2}>
          <Typography variant="body2" color="textSecondary" component="p">
          {translate("wg.show.name")}
          </Typography>
          <Typography variant="body2" component="p" sx={{wordBreak: 'break-word', overflowWrap: 'break-word'}}>
            {name || "-"}
          </Typography>
          <Xr />
        </Grid>
        <Grid item xs={10}>
          <Typography variant="body2" color="textSecondary" component="p">
            {"Prompt"}
          </Typography>
          <Typography variant="body2" component="p">
            <NewLines text={record.prompt || "-"} />
          </Typography>
          <Xr />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={2}>
          <Typography variant="body2" color="textSecondary" component="p">
          {translate("wg.show.status")}
          </Typography>
          <Typography variant="body2" component="p">
            {record.running ? "Running" : "Stopped"}
          </Typography>
        </Grid>

        <Grid item xs={8}>
          <Typography variant="body2" color="textSecondary" component="p">
          {translate("wg.show.description")}
          </Typography>
          <Typography variant="body2">{record.description || "-"}</Typography>
        </Grid>
      </Grid>
      <Xr />

      <Grid container spacing={2}>
        <Grid item xs={12}>
        <Typography variant="body2" color="textSecondary" component="p">
            {translate("wg.show.github_repository")}
          </Typography>
          <Typography variant="body2">
            {repository && <Link to={repository} target="_blank" sx={{ fontWeight: "bold" }}>
              {repository}
            </Link>}
          </Typography>
        </Grid>
        <Grid item xs={12}>

          <Typography variant="body2" color="textSecondary" component="p">
          {translate("wg.show.run_project")}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="div">
            <CodeSnippet code={code} />
          </Typography>
          
        </Grid>
      </Grid>

      <Xr />
      <Grid container spacing={2}>
        <Grid item xs={2}>
          <Typography variant="body2" color="textSecondary" component="p">
          {translate("wg.show.created_at")}
          </Typography>
          <Typography variant="body2">{record.created_at.split(".")[0] || "-"}</Typography>
        </Grid>
        <Grid item xs={2}>
          <Typography variant="body2" color="textSecondary" component="p">
            {"ID"}
          </Typography>
          <Typography variant="body2">{record.id}</Typography>
        </Grid>
      </Grid>
      <Xr />

      <Grid container spacing={2}>
      <Grid item xs={4}>
      <Typography variant="body2" color="textSecondary" component="p">
        {translate("wg.show.data_model")}
      </Typography>
      <DataModelModal thumbnailSrc={datamodelSvg} 
                      fullSizeSrc={datamodelSvg} 
                      alt="Database ER Diagram" />
      </Grid>
      </Grid>
      <Xr />

        <Grid container spacing={2}>
        <Grid item xs={12}>
          <ProjectLog project={record} />
        </Grid>
      </Grid>
      <Xr />
      <span style={{ fontSize: "0.6em", color: "#fff" }}>
        <UserDetail id={record.user_id} />
      </span>
    </>
  );
};

export const ApiDetails = ({ record, appLinkStyle }: { record: any; appLinkStyle: any }) => {
  const tabs = <ProjectTabs record={record} appLinkStyle={appLinkStyle} />;

  return <>{tabs}</>;
};

export const ShowApiFab = () => {
  const record = useRecordContext();
  const redirect = useRedirect();

  useEffect(() => {
    // edit view
    if (!record) {
      console.log("no record");
      //redirect("/Home");
    }
  }, []);

  if (!record) {
    return <>...</>;
  }

  
  return (
    <>
      <SimpleShowLayout>
        <ApiDetails record={record} appLinkStyle={null} />
      </SimpleShowLayout>
    </>
  );
};

export const ShowRecordField = ({
  source,
  tabs,
  path,
  id,
}: {
  source: any;
  tabs: any;
  path: any;
  id: any;
}) => {
  const record = useRecordContext();
  const refresh = useRefresh();
  const redirect = useRedirect();
  const notify = useNotify();
  const attr_name = source.name;
  let value = record[attr_name];
  // eslint-disable-next-line no-unused-vars
  const isInserting = false;
  if (source.show_when) {
    try {
      const pattern1 = /record\["[a-zA-Z]+"] (==|!=) "[a-zA-Z]+"/;
      const pattern2 = /isInserting (==|!=) (true|false)/;
      const arr = source.show_when.split(/&&|\|\|/);
      let index = -1;
      for (let i = 0; i < arr.length; ++i) {
        if (arr[i].match(pattern1)) {
          index = i;
        }
        if (arr[i].match(pattern1) || arr[i].match(pattern2)) {
          continue;
        } else {
          throw "invalid expression";
        }
      }

      if (index === -1) {
        if (!eval(source.show_when)) {
          return <></>;
        }
      }
    } catch (e) {
      console.log(e);
      notify("Error occurred while evaluating 'show_when' : Invalid Expression", {
        type: "error",
      });
      redirect(path);
      refresh();
    }
  }

  return <ShowAttrField attr={source} value={value} id={id} />;
};