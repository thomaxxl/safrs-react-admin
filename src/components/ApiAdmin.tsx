import * as React from "react";
import { Modal, Box, Grid, TextField } from "@mui/material";
import Typography from "@mui/material/Typography";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import Button from "@mui/material/Button";
import { useConf } from "../Config";
import { Loading, TextInput, useRecordContext, useGetList } from "react-admin";
import { useForm } from "react-final-form";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";

const boxStyle = {
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
};

const modalStyle = {
  position: "absolute",
  top: "10%",
  left: "10%",
  overflow: "scroll",
  height: "100%",
  fontWeight: 600,
  display: "flex",
};

const joinedFieldStyle = { cursor: "pointer", color: "#3f51b5" };

const dbBtnStyle = {
  height: "80%",
  position: "relative",
  top: "50%",
  transform: "translateY(-50%)",
};

const dbGridStyle = {
  "& .MuiTextField-root": {
    borderBottom: "4px solid white",
    paddingBottom: "1em",
    paddingRight: "1em",
  },
};

const actionsStyle = {
  textAlign: "center",
  "& button": {
    width: "99%",
  },
};

const connStrStyle = { backgroundColor: "#ccc", fontFamily: "Consolas" };

const C2Rpc = (url: any, data: any, options: any) => {
  const defaultOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
    },
    body: JSON.stringify(data || {}),
  };
  const requestOptions = Object.assign(defaultOptions, options || {});
  return fetch(url, requestOptions);
};

const ApiModal = (props: any) => {
  const [output, setOutput] = React.useState<JSX.Element | null>(null);
  const [open, setOpen] = React.useState(false);
  const [box_style, setBoxStyle] = React.useState(boxStyle);

  const conf = useConf();
  const create_api = (record: any) => {
    const create_url = `${conf.api_root}/Apis/${record.id}/generate`;
    setOutput(<Loading />);
    box_style.top = "90%";
    setBoxStyle(box_style);
    C2Rpc(create_url, {}, {})
      .then((response) => response.json())
      .then((data) => {
        setOutput(<pre>{data}</pre>);
      });
  };

  const handleOpen = (e: any) => {
    setOpen(true);
    e.stopPropagation();
  };
  const handleClose = (e: any) => {
    e.stopPropagation();
    setOpen(false);
  };
  const record = props.record;

  return (
    <span>
      <span
        onClick={handleOpen}
        style={joinedFieldStyle}
        title={` Relationship`}
      >
        <PlayCircleOutlineIcon />
      </span>
      <Modal
        sx={modalStyle}
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={box_style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Create API
          </Typography>
          Pressing the button will generate an API with the following
          properties:
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
          <Button variant="outlined" onClick={() => create_api(record)}>
            {" "}
            Start <PlayCircleOutlineIcon />{" "}
          </Button>
          <hr />
          {output}
        </Box>
      </Modal>
    </span>
  );
};

export const ApiGenerateField = (props: any) => {
  if (props.mode === "list") {
    return <ApiModal {...props} />;
  }
  return <></>;
};

export const ApiShow = (props: any) => {
  return (
    <>
      <div>xxxx</div>
      <ApiModal />
      {props.show}
    </>
  );
};

const DBConnectionEdit = (props: any) => {
  const form = useForm();
  const record = useRecordContext();
  let value = record ? record["connection_string"] : "";
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [box_style] = React.useState(boxStyle);
  const [other, setOther] = React.useState(value);
  const [username, setUsername] = React.useState("user");
  const [password, setPassword] = React.useState("pass");
  const [dbhost, setDbhost] = React.useState("dbhost");
  const [dbname, setDbname] = React.useState("dbname");
  const [dialect, setDialect] = React.useState("Other");
  const [logdata, setLogData] = React.useState<React.ReactNode>(null);
  const conf = useConf();

  const selectDialect = (e: any) => {
    const dialect = e.target.value;
    setDialect(dialect);
    if (dialect === "sqlite") {
      setUsername("");
      setPassword("");
      setDbhost("");
    }
  };

  const create_conn = () => {
    let result = `${dialect}://`;
    if (dialect === "Other") {
      result = other;
    } else if (dialect === "sqlite") {
      result += `/${dbname}`;
    } else {
      result += `${username}:${password}@${dbhost}/${dbname}`;
    }
    return result;
  };

  const test_conn = (connection_string: any) => {
    const create_url = `${conf.api_root}/Apis/test_conn`;
    const req_data = { connection_string: connection_string };
    C2Rpc(create_url, req_data, {})
      .then((response) => response.json())
      .then((data) => {
        setLogData(
          <>
            <Typography variant="h6" component="h2">
              Result:
            </Typography>
            <pre>{data}</pre>
          </>
        );
      })
      .catch((err) => alert());
  };

  const create_api = () => {
    if (record.id === undefined) {
      const msg = "you must first save the api";
      alert(msg);
      setLogData(msg);
      return;
    }
    const create_url = `${conf.api_root}/Apis/${record.id}/generate`;
    setLogData(<Loading />);
    box_style.top = "90%";
    C2Rpc(create_url, {}, {})
      .then((response) => response.json())
      .then((data) => {
        setLogData(<pre>{data}</pre>);
      });
  };

  return (
    <>
      <Grid item xs={12} spacing={4}></Grid>
      <Grid item xs={4} spacing={4}>
        <TextInput
          source={"connection_string"}
          defaultValue={create_conn()}
          helperText="SQLAlchemy connection string syntax"
          fullWidth
        />
      </Grid>
      <Grid item xs={4} spacing={4}>
        <Button
          variant="outlined"
          onClick={handleOpen}
          color="primary"
          size="large"
          sx={dbBtnStyle}
        >
          Configure Connection
        </Button>
      </Grid>
      <Grid item xs={12} spacing={4}></Grid>
      <Modal
        open={open}
        onClose={handleClose}
        sx={modalStyle}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={box_style}>
          <Grid container sx={dbGridStyle}>
            <Grid item xs={12} spacing={4}>
              <Typography id="modal-modal-title" variant="h6" component="h2">
                Database Configuration
              </Typography>
              <hr />
            </Grid>
            <Grid item xs={6} spacing={4}>
              <FormControl>
                <FormLabel id="demo-radio-buttons-group-label">
                  DB Dialect
                </FormLabel>
                <RadioGroup
                  aria-labelledby="demo-radio-buttons-group-label"
                  defaultValue="Other"
                  name="radio-buttons-group"
                  onChange={selectDialect}
                >
                  <FormControlLabel
                    value="mysql+pymysql"
                    control={<Radio />}
                    label="MySQL"
                  />
                  <FormControlLabel
                    value="oracle"
                    control={<Radio />}
                    label="Oracle"
                  />
                  <FormControlLabel
                    value="postgresql"
                    control={<Radio />}
                    label="Postgres"
                  />
                  <FormControlLabel
                    value="sqlite"
                    control={<Radio />}
                    label="SQLite"
                  />
                  <FormControlLabel
                    value="mssql+pyodbc"
                    control={<Radio />}
                    label="SQLServer"
                  />
                  <FormControlLabel
                    value="Other"
                    control={<Radio />}
                    label="Manual:"
                  />
                </RadioGroup>
                <TextField
                  id="outlined-basic"
                  label="Manual"
                  variant="outlined"
                  fullWidth
                  value={other}
                  onChange={(e) => setOther(e.target.value)}
                  helperText="Manual connection string configuration"
                />
              </FormControl>
            </Grid>

            <Grid item xs={6} spacing={4}>
              <TextField
                label="Username"
                variant="outlined"
                onChange={(e) => setUsername(e.target.value)}
                value={username}
              />
              <TextField
                label="Password"
                variant="outlined"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
              />
              <TextField
                label="Database host"
                variant="outlined"
                onChange={(e) => setDbhost(e.target.value)}
                value={dbhost}
              />
              <TextField
                label="Database name"
                variant="outlined"
                onChange={(e) => setDbname(e.target.value)}
                value={dbname}
              />
            </Grid>
            <Grid item xs={6} spacing={4}>
              <Typography>
                Connection String:{" "}
                <span style={connStrStyle}>{create_conn()}</span>
              </Typography>
            </Grid>
            <Grid item xs={12} spacing={4} sx={actionsStyle}>
              <hr />
            </Grid>
            <Grid item xs={12} spacing={4} />
            <Grid item xs={2} spacing={4} sx={actionsStyle}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => test_conn(create_conn())}
              >
                {" "}
                Test Connection
              </Button>
            </Grid>
            <Grid item xs={2} spacing={4} sx={actionsStyle}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => {
                  setOpen(false);
                  form.change("connection_string", create_conn());
                }}
              >
                Save &amp; Close
              </Button>
            </Grid>
            <Grid item xs={2} spacing={4} sx={actionsStyle}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => create_api()}
                disabled={record.id ? false : true}
                title={record.id ? "" : "you must first save the api"}
              >
                Generate API
              </Button>
            </Grid>
            <Grid item xs={2} spacing={4} sx={actionsStyle}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setOpen(false)}
              >
                Close
              </Button>
            </Grid>

            <Grid item xs={12} spacing={4} className={classes.logdata}>
              {logdata}
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </>
  );
};

export const DBConnection = (props: any) => {
  console.log("props: ", props);
  const record = useRecordContext();
  let value = record ? record["connection_string"] : "";

  if (props.mode !== "edit" && props.mode !== "create") {
    return <Typography>{value}</Typography>;
  }
  return <DBConnectionEdit {...props} />;
};

const api_url = (props: any) => {
  const url = `/${props.name}/api`;
  return (
    <Typography>
      <a href={url}>{url}</a>
    </Typography>
  );
};

export const ApiURL = () => {
  const record = useRecordContext();
  if (!record.id) {
    return null;
  }
  return api_url(record);
};

export const ApiAdminHome = () => {
  const { data } = useGetList("Apis", {
    pagination: { page: 0, perPage: 100 },
  });

  const apis = data?.map((api) => <li>{api_url(api)}</li>);

  return (
    <>
      <Typography variant="h6" component="h2">
        {" "}
        APIs
      </Typography>
      <Typography>
        <ul>{apis}</ul>
      </Typography>
    </>
  );
};
