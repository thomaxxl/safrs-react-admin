import * as React from "react";
import { Modal, Box, Grid, TextField, Button, Typography, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from "@mui/material";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import { useConf } from "../Config";
import { Loading, TextInput, useRecordContext, useGetList } from "react-admin";
import { useForm } from "react-final-form";

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
    top: "10%",
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
    textAlign: "center",
    "& button": { width: "99%" },
  },
  connStr: { backgroundColor: "#ccc", fontFamily: "Consolas" },
};

const C2Rpc = async (url: string, data?: any, options?: RequestInit) => {
  const defaultOptions: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
    },
    body: JSON.stringify(data || {}),
  };
  const requestOptions = { ...defaultOptions, ...options };
  const response = await fetch(url, requestOptions);
  return response.json();
};

const ApiModal = ({ record }: { record: any }) => {
  const [output, setOutput] = React.useState<JSX.Element | null>(null);
  const [open, setOpen] = React.useState(false);
  const [boxStyle, setBoxStyle] = React.useState(styles.box);

  const conf = useConf();

  const createApi = async (record: any) => {
    const createUrl = `${conf.api_root}/Apis/${record.id}/generate`;
    setOutput(<Loading />);
    setBoxStyle(prev => ({ ...prev, top: "90%" }));
    const data = await C2Rpc(createUrl);
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
            Create API
          </Typography>
          Pressing the button will generate an API with the following properties:
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

const DBConnectionEdit = (props: any) => {
  const form = useForm();
  const record = useRecordContext();
  const [open, setOpen] = React.useState(false);
  const [other, setOther] = React.useState(record?.connection_string || "");
  const [username, setUsername] = React.useState("user");
  const [password, setPassword] = React.useState("pass");
  const [dbhost, setDbhost] = React.useState("dbhost");
  const [dbname, setDbname] = React.useState("dbname");
  const [dialect, setDialect] = React.useState("Other");
  const [logData, setLogData] = React.useState<React.ReactNode>(null);
  const conf = useConf();

  const selectDialect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dialect = e.target.value;
    setDialect(dialect);
    if (dialect === "sqlite") {
      setUsername("");
      setPassword("");
      setDbhost("");
    }
  };

  const createConn = () => {
    if (dialect === "Other") return other;
    return dialect === "sqlite"
      ? `${dialect}://${dbname}`
      : `${dialect}://${username}:${password}@${dbhost}/${dbname}`;
  };

  const testConn = async (connectionString: string) => {
    const createUrl = `${conf.api_root}/Apis/test_conn`;
    const data = { connection_string: connectionString };
    try {
      const responseData = await C2Rpc(createUrl, data);
      setLogData(
        <>
          <Typography variant="h6">Result:</Typography>
          <pre>{JSON.stringify(responseData, null, 2)}</pre>
        </>
      );
    } catch (err) {
      alert("Connection test failed");
    }
  };

  const createApi = async () => {
    if (!record.id) {
      alert("You must first save the API");
      setLogData("You must first save the API");
      return;
    }
    const createUrl = `${conf.api_root}/Apis/${record.id}/generate`;
    setLogData(<Loading />);
    try {
      const responseData = await C2Rpc(createUrl);
      setLogData(<pre>{JSON.stringify(responseData, null, 2)}</pre>);
    } catch (err) {
      alert("API generation failed");
    }
  };

  return (
    <>
      <Grid container spacing={4}>
        <Grid item xs={4}>
          <TextInput
            source="connection_string"
            defaultValue={createConn()}
            helperText="SQLAlchemy connection string syntax"
            fullWidth
          />
        </Grid>
        <Grid item xs={4}>
          <Button
            variant="outlined"
            onClick={() => setOpen(true)}
            color="primary"
            size="large"
            sx={styles.dbBtn}
          >
            Configure Connection
          </Button>
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
                >
                  <FormControlLabel value="mysql+pymysql" control={<Radio />} label="MySQL" />
                  <FormControlLabel value="oracle" control={<Radio />} label="Oracle" />
                  <FormControlLabel value="postgresql" control={<Radio />} label="Postgres" />
                  <FormControlLabel value="sqlite" control={<Radio />} label="SQLite" />
                  <FormControlLabel value="mssql+pyodbc" control={<Radio />} label="SQLServer" />
                  <FormControlLabel value="Other" control={<Radio />} label="Manual:" />
                </RadioGroup>
                <TextField
                  label="Manual"
                  variant="outlined"
                  fullWidth
                  value={other}
                  onChange={(e) => setOther(e.target.value)}
                  helperText="Manual connection string configuration"
                />
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField label="Username" variant="outlined" value={username} onChange={(e) => setUsername(e.target.value)} />
              <TextField label="Password" variant="outlined" value={password} onChange={(e) => setPassword(e.target.value)} />
              <TextField label="Database host" variant="outlined" value={dbhost} onChange={(e) => setDbhost(e.target.value)} />
              <TextField label="Database name" variant="outlined" value={dbname} onChange={(e) => setDbname(e.target.value)} />
            </Grid>
            <Grid item xs={6}>
              <Typography>
                Connection String: <span style={styles.connStr}>{createConn()}</span>
              </Typography>
            </Grid>
            <Grid item xs={12} sx={styles.actions}>
              <hr />
              <Button variant="outlined" color="primary" onClick={() => testConn(createConn())}>
                Test Connection
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => {
                  setOpen(false);
                  form.change("connection_string", createConn());
                }}
              >
                Save & Close
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={createApi}
                disabled={!record.id}
                title={record.id ? "" : "You must first save the API"}
              >
                Generate API
              </Button>
              <Button variant="outlined" color="primary" onClick={() => setOpen(false)}>
                Close
              </Button>
            </Grid>
            <Grid item xs={12}>
              {logData}
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </>
  );
};

export const DBConnection = (props: any) => {
  const record = useRecordContext();
  const value = record?.connection_string || "";

  return props.mode !== "edit" && props.mode !== "create"
    ? <Typography>{value}</Typography>
    : <DBConnectionEdit {...props} />;
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