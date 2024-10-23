/*
Form used to create a new API definition from an existing database connection.
*/
import * as React from "react";
import { useState } from "react";
import { Modal, Box, Grid, TextField, Button, Typography, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from "@mui/material";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import { useConf } from "../../Config";
import { Loading, TextInput, useRecordContext, useGetList, Form, SimpleForm, useDataProvider, Link, useNotify } from "react-admin";
import { attributes } from "../types/SraTypes"
import { FileUpload } from "./FileUpload";
import { jaRpc } from "../../rav4-jsonapi-client/ra-jsonapi-client";
import { red } from "@mui/material/colors";

const styles = {
  box: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "75%",
    bgcolor: "background.paper",
    border: "0px solid #000",
    boxShadow: 24,
    p: 4,
    textAlign: "left",
  },
  modal: {
    position: "absolute",
    top: "5%",
    left: "10%",
    overflow: "scroll",
    height: "100%",
    fontWeight: 600,
    display: "flex",
  },
  joinedField: { cursor: "pointer", color: "#3f51b5" },
  dbBtn: {
    height: "80%",
    position: "relative",
    top: "50%",
    transform: "translateY(-50%)",
  },
  dbGrid: {
    "& .MuiTextField-root": {
      borderBottom: "4px solid white",
      paddingBottom: "1em",
      paddingRight: "1em",
    },
  },
  actions: {
    textAlign: "left",
    "& button": { width: "99%" },
  },
  connStr: { backgroundColor: "#ccc", fontFamily: "Consolas" },
};

const editStyle = {
  fontSize: "0.8em"
}

const redactConnstr = (connstr: string) => {
  let redacted = null
  if(connstr){
    const groups = connstr.match(/(.*):(.*)@(.*)/)
    redacted = groups ? `${groups[1]}:********@${groups[3]}` : connstr; 
  }
  return <>{redacted}</>;
}

const RedactedConnstr = ({connStrVal, setConnStrRef}: {connStrVal: string, setConnStrRef: any}) => {
  
  const [edit, setEdit] = useState(false)
  let result = redactConnstr(connStrVal);

  if(edit){
    result = <TextInput source="connection_string" 
                        label="Connection String"
                        //sx={{width: "9em", display:"none" }} 
                        value={connStrVal} 
                        defaultValue={connStrVal}
                        onChange={(e) => setConnStrRef(e.target.value)} />
  }

  return <>Connection String &nbsp;<Link to="#" onClick={(e)=>{e.preventDefault();setEdit(!edit);}} sx={editStyle}>{edit? "Hide" : "Edit"}</Link><br/>{result}</>
}


const ApiModal = ({ record }: { record: any }) => {
  const [output, setOutput] = React.useState<JSX.Element | null>(null);
  const [open, setOpen] = React.useState(false);
  const [boxStyle, setBoxStyle] = React.useState(styles.box);
  const dataProvider = useDataProvider();

  const conf = useConf();

  const createApi = async (record: any) => {
    const createUrl = `${conf.api_root}/Apis/${record?.id}/generate`;
    setOutput(<Loading />);
    setBoxStyle(prev => ({ ...prev, top: "90%" }));
    const data = await jaRpc(createUrl);
    setOutput(<pre>{JSON.stringify(data, null, 2)}</pre>);
  };

  const handleOpen = (e: React.MouseEvent) => {
    setOpen(true);
    e.stopPropagation();
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(false);
  };

  return (
    <>
      <span onClick={handleOpen} style={styles.joinedField} title="Relationship">
        <PlayCircleOutlineIcon />
      </span>
      <Modal
        sx={styles.modal}
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box sx={boxStyle}>
          <Typography id="modal-title" variant="h6">
            Create app
          </Typography>
          Pressing the button will generate an app with the following properties:
          <dl>
            <dt>Name:</dt>
            <dd>{record?.name}</dd>
            <dt>Database URL:</dt>
            <dd>{record?.connection_string}</dd>
            <dt>Port:</dt>
            <dd>{record?.port}</dd>
            <dt>Hostname:</dt>
            <dd>{record?.hostname}</dd>
          </dl>
          <Button variant="outlined" onClick={() => createApi(record)}>
            Start <PlayCircleOutlineIcon />
          </Button>
          <hr />
          {output}
        </Box>
      </Modal>
    </>
  );
};

export const ApiGenerateField = (props: any) => {
  return props.mode === "list" ? <ApiModal {...props} /> : null;
};

export const ApiShow = (props: any) => (
  <>
    <div>xxxx</div>
    <ApiModal {...props} />
    {props.show}
  </>
);

const DBConnectionEdit = ({
  attributes,
  fetchCount,
  toolBar,
  recordRef,
  ...props
}: {
  attributes: [any];
  [key: string]: any;}) => {
  
  const record = useRecordContext();
  const [open, setOpen] = React.useState(false);
  const [nameVal, setNameVal] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [dbHost, setDbHost] = React.useState("");
  const [dbName, setDbName] = React.useState("");
  const [dbArgs, setDbArgs] = React.useState("");
  const [showConnParams, setShowConnParams] = React.useState(true);
  const [dialect, setDialect] = React.useState("Other");
  const [logData, setLogData] = React.useState<React.ReactNode>(null);
  const [connStrVal, setConnStrVal] = React.useState("");
  const focusRef = React.useRef("");
  //const recordRef = React.useRef({ data: {} });
  const notify = useNotify();
  const [renderSwitch, setRenderSwitch] = React.useState([]);
  
  
  const conf = useConf();

  const selectDialect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dialect = e.target.value;
    
    setDialect(dialect);
    console.log("dialect", dialect);
    refreshConnStr(dialect);
  };

  const refreshConnStr = (sDialect?: string) => {
    console.log("refreshConnStr", sDialect);
    const cDialect = sDialect || dialect;
    if (cDialect === "sqlite" || cDialect === "excel"){
      setShowConnParams(false);
    }
    else{
      setShowConnParams(true);
    }
    let result = ""
    if (cDialect === "Other"){
      result = "";
    }
    else{
      result = cDialect === "sqlite" || cDialect === "excel"
        ? `${cDialect}://${dbName}`
        : `${cDialect}://${username}:${password}@${dbHost}/${dbName}` + (dbArgs ? "?" + dbArgs : "");
    }
    setConnStrRef(result);
  }

  const testConn = async (connectionString: string) => {
    const createUrl = `Project/test_conn`;
    const data = { connection_string: connectionString };
    setLogData("Testing connection...");
    try {
      const {msg, success} = await jaRpc(createUrl, data);
      setLogData(
        <>
          <Typography variant="h6">Result:</Typography>
          <Typography>{msg}</Typography>
        </>
      );
    } catch (err) {
      setLogData(`Connection test failed ${err}`);
    }
  };

  const setConnStrRef = (value: string) => {
    const name = "connection_string";
    setConnStrVal(value)
    focusRef.current = name;
    recordRef.current = { data: { ...recordRef.current.data, [name]: value.toString() } };
    recordRef.current.data.prompt = ""
    const recordsArray = attributes.map((attr: attributes) => attr.name);
    setRenderSwitch((previousState: any) => {
      if (recordsArray.length === previousState.length) {
        return previousState;
      }
      return recordsArray;
    });
  };

  const setNameStrRef = (value: string) => {
    const name = "name";
    setNameVal(value)
    focusRef.current = name;
    recordRef.current = { data: { ...recordRef.current.data, [name]: value.toString() } };
    recordRef.current.data.prompt = ""
    const recordsArray = attributes.map((attr: attributes) => attr.name);
    setRenderSwitch((previousState: any) => {
      if (recordsArray.length === previousState.length) {
        return previousState;
      }
      return recordsArray;
    });
  };

  const handleClose = () => {

    if (connStrVal.endsWith("//")) {
      notify("No database selected", { type: "warning" });
    }
    setOpen(false);
  };

  

  return (
    <span style={{textAlign:"left"}}>
      <SimpleForm {...props} toolbar={toolBar}>
      
      <Typography>Create your API-driven system using an existing DB</Typography>
      <Grid container spacing={4} sx={styles.dbGrid}>
        <Grid item xs={6}>
            <TextInput source="name" label="Project name" sx={{width: "9em"}} onChange={(e) => setNameStrRef(e.target.value)} />
            
            <Button
              variant="outlined"
              onClick={() => setOpen(true)}
              color="primary"
            >
              Configure Database
            </Button>
            
            <Typography> <RedactedConnstr connStrVal={connStrVal} setConnStrRef={setConnStrRef}/> </Typography>
            
          </Grid>
        </Grid>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        sx={styles.modal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box sx={styles.box}>
          <Grid container spacing={4} sx={styles.dbGrid}>
            <Grid item xs={12}>
              <Typography id="modal-title" variant="h6">
                Database Configuration
              </Typography>
              <hr />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <FormLabel>DB Dialect</FormLabel>
                <RadioGroup
                  defaultValue="Other"
                  name="radio-buttons-group"
                  onChange={selectDialect}
                  value={dialect}
                >
                  <FormControlLabel value="mysql+pymysql" control={<Radio />} label="MySQL"/>
                  <FormControlLabel value="oracle" control={<Radio />} label="Oracle" />
                  <FormControlLabel value="postgresql" control={<Radio />} label="Postgres" />
                  <FormControlLabel value="mssql+pyodbc" control={<Radio />} label="SQLServer" />
                  <FormControlLabel value="sqlite" control={<Radio />} label="SQLite" />
                  <FormControlLabel value="excel" control={<Radio />} label="Excel" />
                  
                </RadioGroup>
                
              </FormControl>
            </Grid>
            <Grid item xs={6} sx={{ height: '400px' }}>
              {showConnParams ? (
                <>
                  <TextField
                    label="Username"
                    variant="outlined"
                    fullWidth
                    value={username}
                    onChange={(e) => {setUsername(e.target.value); refreshConnStr();}}
                  />
                  <TextField
                    label="Password"
                    variant="outlined"
                    fullWidth
                    value={password}
                    onChange={(e) => {setPassword(e.target.value); refreshConnStr();}}
                  />
                  <TextField
                    label="Host"
                    variant="outlined"
                    fullWidth
                    value={dbHost}
                    onChange={(e) => {setDbHost(e.target.value); refreshConnStr();}}
                  />
                  <TextField
                    label="Database"
                    variant="outlined"
                    fullWidth
                    value={dbName}
                    onChange={(e) => {setDbName(e.target.value); refreshConnStr();}}
                  />
                  <TextField
                    label="Query Args"
                    variant="outlined"
                    fullWidth
                    value={dbArgs}
                    onChange={(e) => {setDbArgs(e.target.value); refreshConnStr();}}
                  />
                </>
              ) : <div>
                    <Typography variant="h6">Upload {dialect} file<br/><br/></Typography>
                    <SchemaUpload setConnStrRef={setConnStrRef}/>
                  </div>
            }
            </Grid>
            <Grid item xs={6}>
              {/*<Typography>
                <TextField
                  label="Connection String"
                  variant="outlined"
                  fullWidth
                  value={connStrVal}
                  onChange={(e) => {setConnStrRef(e.target.value)}}
                  onClick={(e) => setDialect("Other") }
                  helperText="Connection string configuration"
                />
              </Typography>*/
              }
              <Typography>
                  <RedactedConnstr connStrVal={connStrVal} setConnStrRef={setConnStrRef}/>
              </Typography>
              <hr />
              <Button variant="outlined" color="primary" onClick={() => testConn(connStrVal)}>
                Test Connection
              </Button>&nbsp;
              <Button variant="outlined" color="primary" onClick={() => handleClose()}>
                Close
              </Button>
            </Grid>
            <Grid item xs={12}>
              {logData}
            </Grid>
          </Grid>
        </Box>
      </Modal>
      </SimpleForm>
    </span>
  );
};

export const DBConnection = (props: any) => {
  const record = useRecordContext();
  const value = record?.connection_string || "";

  return props.mode !== "edit" && props.mode !== "create"
    ? <Typography>{value}</Typography>
    : <DBConnectionEdit {...props} />
};

const ApiURL = ({ name }: { name: string }) => {
  const url = `/${name}/api`;
  return (
    <Typography>
      <a href={url}>{url}</a>
    </Typography>
  );
};

export const ApiAdminHome = () => {
  const { data } = useGetList("Apis", { pagination: { page: 0, perPage: 100 } });

  const apis = data?.map((api) => (
    <li key={api.id}>
      <ApiURL name={api.name} />
    </li>
  ));

  return (
    <>
      <Typography variant="h6">APIs</Typography>
      <ul>{apis}</ul>
    </>
  );
};


const SchemaUpload = ({setConnStrRef}: {setConnStrRef: (value: string) => void}) => {
  
  const [file, setFile] = useState<string>("");
  React.useEffect(() => {
    if(file){
      console.log('file', file)
      setConnStrRef(file.connection_string)
    }
  },[file])
  
  return (
      <FileUpload setUploadedFile={setFile}/>
    
  );
}