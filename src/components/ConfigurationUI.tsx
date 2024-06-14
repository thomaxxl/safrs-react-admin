import * as React from "react";
import { Suspense, useMemo } from "react";
import { useRef } from "react";
import { TextareaAutosize, TextField } from "@material-ui/core";
import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";
import { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import ClearIcon from "@material-ui/icons/Clear";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { default_configs } from "../Config";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Modal from "@material-ui/core/Modal";
import Typography from "@material-ui/core/Typography";
import { useNotify } from "react-admin";
import { Loading } from "react-admin";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { Confirm } from "react-admin";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
} from "@mui/material";
import { IMonacoEditor } from "@uiw/react-monacoeditor";

const yaml = require("js-yaml");

const str = window.location.href;
console.log("str: ", str);
const arr = str.split("/");
console.log("arr: ", arr);
const index = arr.findIndex((e) => e === "admin");
console.log("index: ", index);
let yamlName;
console.log("yamlName: ", yamlName);
if (index === -1) {
  yamlName = "admin";
} else {
  yamlName = arr[index + 1] ?? "admin";
}
const yarm = yamlName.split(".");
console.log("yarm: ", yarm);
console.log(yamlName);
let als_yaml_url = `/ui/admin/${yarm[0]}.yaml`;
if (
  window.location.href.includes(":3000") &&
  !window.location.href.includes("load=")
) {
  // only for dev purposes
  als_yaml_url = `http://localhost:5656/ui/admin/${yamlName}.yaml`;
}

const useStyles = makeStyles((theme) => ({
  widget: {
    border: "1px solid #3f51b5",
    marginRight: "1em",
    marginTop: "1em",
    marginBottom: "1em",
  },
  textInput: {
    width: "80%",
  },
  modal: {
    position: "absolute",
    top: "15%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "75%",
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: "24px",
    p: 4,
    textAlign: "left",
  },
}));

const LoadingModal = () => (
  <Dialog open={true}>
    <DialogTitle>Loading</DialogTitle>
    <DialogContent>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </div>
    </DialogContent>
  </Dialog>
);

const DeleteConf = (conf_name: any) => {
  console.log(" DeleteConf conf_name: ", conf_name);
  if (!window.confirm(`Delete configuration "${conf_name}" ?`)) {
    return;
  }
  try {
    let configs = JSON.parse(localStorage.getItem("raconfigs") || "{}");
    delete configs[conf_name];
    localStorage.setItem("raconfigs", JSON.stringify(configs));

    let url = new URL(window.location.href);
    let hashParts = url.hash.split("?");

    if (hashParts.length > 1) {
      let params = new URLSearchParams(hashParts[1]);
      if (params.has("load")) {
        params.delete("load");
        url.hash = hashParts[0] + "?" + params.toString();
        window.location.href = url.toString();
      }
    }
    window.location.reload();
  } catch (e) {
    alert("Localstorage error");
  }
};

const addConf = (conf: any) => {
  console.log("addConf conf: ", conf);
  const configs = JSON.parse(localStorage.getItem("raconfigs") || "{}");
  if (!conf.api_root) {
    console.warn("Config has no api_root", conf);
    return false;
  }
  configs[conf.api_root] = conf;
  localStorage.setItem("raconf", JSON.stringify(conf));
  console.log("conf: ", conf);
  localStorage.setItem("raconfigs", JSON.stringify(configs));
  return true;
};

export const LoadYaml = (
  config_url: any,
  notify: any,
  state: any,
  handleLoader: any = null
) => {
  if (state) {
    console.log("LoadYaml config_url: ", config_url);
    if (config_url == null) {
      config_url = als_yaml_url;
    }

    const saveConf = (conf_str: any) => {
      console.log("conf_str: ", conf_str);
      // first try to parse as json, if this doesn't work, try yaml
      try {
        const conf = JSON.parse(conf_str);
        console.log("conf: ", conf);
        if (typeof conf !== "object") {
          saveYaml(conf_str);
          return;
        }
        if (!addConf(conf) && notify) {
          let url = new URL(window.location.href);
          let params = new URLSearchParams(url.search);
          params.delete("load");
          url.search = params.toString();
          window.location.href = url.toString();
          notify("Failed to load config", "warning");
        }
      } catch (e) {
        saveYaml(conf_str);
      }
    };

    const saveYaml = (ystr: any) => {
      console.log("ystr: ", ystr);
      try {
        const conf = yaml.load(ystr);
        if (!addConf(conf) && notify) {
          notify("Failed to load config", "warning");
        }
      } catch (e) {
        console.warn(`Failed to load yaml`, ystr);
        console.error(e);
      }
    };

    fetch(config_url, { cache: "no-store" })
      .then((response) => {
        console.log("response", response);
        return response.text();
      })
      .then((conf_str) => {
        if (conf_str.includes("api_root")) {
          localStorage.setItem("conf_cache1", conf_str);
          saveConf(conf_str);
          notify("Loaded configuration");
          window.location.reload();
        } else {
          notify("cannot load configuration ");
          // window.location.href = "/#/Configuration";
          handleLoader();
        }
      })
      .catch((err) => {
        if (notify) {
          notify("Failed to load yaml", { type: "warning" });
        }
        console.error(`Failed to load yaml from ${config_url}: ${err}`);
      });
  }
};

const ManageModal = () => {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const handleOpen = (e?: any) => {
    setOpen(true);
  };
  const handleClose = (e: any) => {
    setOpen(false);
  };

  let configs = [];

  try {
    configs = JSON.parse(localStorage.getItem("raconfigs") || "{}");
  } catch (e) {
    alert("Localstorage error");
  }

  const classes = useStyles();
  const modal_style = {
    position: "absolute",
    top: "25%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "75%",
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
    textAlign: "left",
  };

  const config_list = configs ? (
    Object.entries(configs).map(([name, conf]) => (
      <li key={name}>
        {name} <ClearIcon key={name} onClick={() => DeleteConf(name)} />
      </li>
    ))
  ) : (
    <span />
  );
  const textFieldRef: any = useRef();
  const notify = useNotify();
  return (
    <>
      <Button
        className={classes.widget}
        onClick={() => handleOpen()}
        color="primary"
      >
        Manage
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        {/* Add the necessary JSX elements inside the children prop */}
        <Box sx={modal_style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Manage Configurations
          </Typography>
          <Typography id="modal-modal-description" component="div">
            <ul>{config_list}</ul>
          </Typography>

          <Typography id="modal-modal-title" variant="h6" component="h2">
            Load Configuration from URL
          </Typography>
          <Typography id="modal-modal-description" component="div">
            <TextField
              label="Config URL"
              style={{ margin: 16, width: "100%" }}
              inputRef={textFieldRef}
            />
            <Button
              className={classes.widget}
              onClick={(evt) => {
                setOpen(false);
                navigate(
                  `?load=${encodeURIComponent(
                    textFieldRef?.current?.value || ""
                  )}`
                );
              }}
              color="primary"
            >
              Load
            </Button>
          </Typography>
        </Box>
      </Modal>
    </>
  );
};

const ExternalConf = () => {
  const qpStr = window.location.hash.substr(window.location.hash.indexOf("?"));
  console.log("qpStr: ", qpStr);
  const queryParams = new URLSearchParams(qpStr);
  console.log("queryParams: ", queryParams);
  let loadURI = queryParams.get("load");
  console.log("loadURI: ", loadURI);
  const [open, setOpen] = useState(false);
  const [loader, setLoader] = useState(false);

  let url,
    hostname,
    local_data,
    api_root_hostname,
    api_root_hostname_1 = [];

  const notify = useNotify();

  React.useEffect(() => {
    try {
      if (loadURI) {
        url = new URL(decodeURIComponent(loadURI));
        hostname = url;
      }
    } catch (e) {
      notify("cannot load configuration from: " + loadURI);
      setOpen(false);
      loadURI = null;
      let url = new URL(window.location.href);
      let hashParts = url.hash.split("?");

      if (hashParts.length > 1) {
        let params = new URLSearchParams(hashParts[1]);
        params.delete("load");
        url.hash = hashParts[0] + "?" + params.toString();
      }

      window.location.href = url.toString();
    }
  }, [loadURI]);

  try {
    let raconf = localStorage.getItem("raconf");
    let raconfigs = localStorage.getItem("raconfigs");
    if (raconf) {
      let parsedData = JSON.parse(raconf);
      if (parsedData && parsedData.api_root) {
        api_root_hostname = new URL(parsedData.api_root).hostname;
      }
    }
    if (raconfigs) {
      let parsedData = JSON.parse(raconfigs);
      if (parsedData) {
        for (let key in parsedData) {
          if (parsedData[key] && parsedData[key].api_root) {
            try {
              let hostname = new URL(parsedData[key].api_root).href;
              api_root_hostname_1.push(hostname);
            } catch (_) {
              // Ignore the error if the URL is invalid
            }
          }
        }
      }
    }
  } catch (e) {}

  if (
    (api_root_hostname && loadURI?.includes(api_root_hostname)) ||
    (loadURI &&
      api_root_hostname_1.some((hostname) => loadURI?.includes(hostname)))
  ) {
    local_data = true;
  } else {
    local_data = false;
  }

  React.useEffect(() => {
    if (loadURI) {
      setOpen(true);
    }
    if (local_data) {
      setOpen(false);
    }
  }, [loadURI]);

  console.log("url: ", url);
  console.log("open: ", open);
  const handleDialogClose = () => {
    setOpen(false);
    window.location.href = "/";
    LoadYaml("/ui/admin/admin.yaml", notify);
  };
  const handleConfirm = () => {
    setLoader(true);
    setOpen(false);
    LoadYaml(loadURI, notify, true, handleLoader);
    const conf_str = localStorage.getItem("conf_cache1");
    console.log("conf_str: ", conf_str);
    saveConfig(conf_str);
    console.log(document.location);

    // console.log("nl", document.location.substr(document.location.indexOf("#")));
  };

  const handleLoader = () => {
    console.log("@@@@@@@@@@@@@@@@@@@@");
    setLoader(false);
  };

  return (
    <div>
      <Confirm
        isOpen={open}
        content={`Do you want to load the external configuration from ${loadURI}`}
        onConfirm={handleConfirm}
        onClose={handleDialogClose}
        title={"Load external configuration"}
      />
      {!loader ? null : (
        <Dialog
          open={loader}
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)", // semi-transparent black background
            color: "white", // white text color
            borderRadius: "10px", // rounded corners
          }}
        >
          <Loading />
        </Dialog>
      )}
    </div>
  );
};

const ConfSelect = () => {
  let configs = [];
  const notify = useNotify();
  try {
    const storedConfigs = localStorage.getItem("raconfigs");
    configs = storedConfigs ? JSON.parse(storedConfigs) : {};
  } catch (e) {
    alert("Localstorage error");
  }
  const current_conf = JSON.parse(localStorage.getItem("raconf") || "");
  const [current, setCurrent] = React.useState(current_conf.api_root);

  const handleChange = (event: any) => {
    setCurrent(event.target.value);
    const new_conf = configs[event?.target?.value];
    if (!new_conf) {
      return;
    }
    console.log("new_conf: ", new_conf);
    localStorage.setItem("raconf", JSON.stringify(new_conf));
    window.location.reload();

    window.location.href = "/";
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      <ExternalConf />
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">
          Saved Configurations
        </InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={current}
          label="Configs"
          size="small"
          onChange={handleChange}
          defaultValue={current}
        >
          {configs
            ? Object.entries(configs).map(([name, config]) => (
                <MenuItem value={name} key={name}>
                  {name}
                </MenuItem>
              ))
            : null}
        </Select>
      </FormControl>
    </Box>
  );
};

const saveConfig = (conf: any) => {
  /*
    Save the current config in raconf to raconfigs
    */
  let current_conf = JSON.parse(localStorage.getItem("raconf") || "");
  console.log("current_conf: ", current_conf);
  const api_root = current_conf.api_root;
  console.log("api_root: ", api_root);
  if (!api_root) {
    alert("Can't save: no 'api_root' set in config");
    //console.log(current_conf)
    return;
  }
  let configs = JSON.parse(localStorage.getItem("raconfigs") || "{}");
  console.log("configs: ", configs);
  if (!configs) {
    configs = {};
  }
  configs[api_root] = current_conf;
  localStorage.setItem("raconfigs", JSON.stringify(configs));

  // window.location.reload();
};

export const resetConf = (notify: any) => {
  const configs: any = {};
  let defconf: any =
    default_configs.length > 0 ? default_configs[0] : { api_root: "" };

  for (defconf of default_configs) {
    localStorage.setItem("raconf", JSON.stringify(defconf));
    configs[defconf.api_root] = defconf;
  }
  localStorage.setItem("raconf", JSON.stringify({}));
  localStorage.setItem("raconfigs", JSON.stringify(configs));
  let value = window.location.href.split("/");
  let check_load = window.location.href.includes("load");
  if (!check_load) {
    LoadYaml(als_yaml_url, notify, true);
  } else {
    LoadYaml(als_yaml_url, notify, false);
  }
  return defconf;
};

const ConfigurationUI = (props) => {
  const [data, setData] = useState(localStorage.getItem("raconf"));
  const [value, setValue] = useState(0);
  const cancelToken = useRef(null);
  const editorRef = useRef<IMonacoEditor | null>(null);

  const classes = useStyles();
  const notify = useNotify();

  const saveYaml = (ystr, ev) => {
    try {
      const jj = yaml.load(ystr);
      if (jj !== undefined) {
        saveEdit(JSON.stringify(jj));
      }
      setBgColor("black");
    } catch (e) {
      console.warn(`Failed to process`, ystr);
      setBgColor("red");
    }
  };

  const saveEdit = (text) => {
    try {
      if (text) {
        const parsed_conf = JSON.parse(text);
        setApiroot(parsed_conf.api_root);
      }
      setBgColor("#ddeedd");
      localStorage.setItem("raconf", text);
      if (!taConf) {
        window.location.reload();
      }
    } catch (e) {
      setBgColor("red");
    }
    setTaConf(text);
  };

  if (window.location.href.includes("load=")) {
    const qpStr = window.location.hash.substr(
      window.location.hash.indexOf("?")
    );
    const queryParams = new URLSearchParams(qpStr);
    const loadURI = queryParams.get("load");
    als_yaml_url = loadURI;
  }

  React.useEffect(() => {
    if (!data) {
      fetch(als_yaml_url, { cache: "no-store" })
        .then((response) => response.text())
        .then((conf_str) => {
          setData(conf_str);
          if (localStorage.getItem("conf_cache1") !== conf_str) {
            resetConf(() => {});
          }
        })
        .catch((err) => {
          console.log(err);
          notify("Can't Load configuration file");
          // window.location.href = "/#/Configuration";
        });
    }
  }, [data]);

  let conf =
    localStorage.getItem("raconf") || JSON.stringify(resetConf(() => {}));
  const [taConf, setTaConf] = useState(
    conf ? JSON.stringify(JSON.parse(conf), null, 4) : ""
  );
  console.log("taConf", taConf);
  const [bgColor, setBgColor] = useState("black");
  const [autosave, setAutosave] = useState(true);
  const [, setApiroot] = useState(JSON.parse(conf)?.api_root);

  const handleAutoSaveChange = (event) => {
    setAutosave(event.target.checked);
  };

  const Editor = React.memo(
    React.lazy(() => import("@uiw/react-monacoeditor")),
    (prevProps, nextProps) => {
      // Only re-render if the value prop has changed
      return prevProps.value === nextProps.value;
    }
  );

  const TabPanel = (props) => {
    const { children, value, index, ...other } = props;
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  };

  TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
  };

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const [showButton, setShowButton] = useState(false);
  const [currentYaml, setCurrentYaml] = useState(
    yaml.dump(JSON.parse(localStorage?.getItem("raconf")))
  );

  const handleEdit = (newtaConf: any, ev: any) => {
    // Store the edited configuration in the ref
    editorRef.current = newtaConf;
    console.log("newtaConf", newtaConf);
    const newContent = newtaConf;
    const currentContent = currentYaml;
    console.log("currentContent", currentContent);

    setShowButton(true);
  };

  const handleSave = (newContent: any, ev: any) => {
    // setEditedContent(true);
    // Use the edited configuration from the ref
    console.log("Edited configuration", editorRef.current);
    saveYaml(editorRef.current, ev);
    window.location.reload();
  };

  const handleReset = () => {
    console.log("handleReset");
    setShowButton(false);
    // Implement reset logic here
    saveYaml(currentYaml, "");
  };

  return (
    <div>
      <div>
        <ConfSelect />
        <ManageModal />
        <Button
          className={classes.widget}
          onClick={() => saveEdit("{}")}
          color="primary"
        >
          Clear
        </Button>
        <Button
          className={classes.widget}
          onClick={() => resetConf(notify)}
          color="primary"
        >
          Reset
        </Button>
        <Button
          className={classes.widget}
          onClick={() => window.location.reload()}
          color="primary"
        >
          Apply
        </Button>
        <Button
          className={classes.widget}
          onClick={() => saveConfig("")}
          color="primary"
        >
          Save
        </Button>
        <FormControlLabel
          control={
            <Checkbox
              checked={autosave}
              onChange={handleAutoSaveChange}
              color="primary"
            />
          }
          label="Auto Save Config"
        />
      </div>
      <div>
        <Box sx={{ width: "100%" }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="basic tabs example"
            >
              <Tab label="yaml" {...a11yProps(0)} />
              <Tab label="json" {...a11yProps(1)} />

              {showButton ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "end",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <Button
                    // className={classes.widget}
                    color="primary"
                    onClick={() => handleSave()}
                  >
                    Save
                  </Button>
                  <Button
                    // className={classes.widget}
                    color="primary"
                    onClick={() => handleReset()}
                  >
                    Reset
                  </Button>
                </div>
              ) : null}
            </Tabs>
          </Box>
          <TabPanel value={value} index={0}>
            <Suspense fallback={<Loading />}>
              <Editor
                language="yaml"
                value={yaml.dump(JSON.parse(taConf))}
                options={{
                  theme: "vs-dark",
                }}
                height="1000px"
                style={{ borderLeft: `8px solid ${bgColor}` }}
                editorDidMount={(editor, monaco) => {
                  const initialValue = editor.getValue();
                  console.log("initialValue", initialValue);
                }}
                onChange={(taConf, ev) => handleEdit(taConf, ev)}
              />
            </Suspense>
          </TabPanel>
          <TabPanel value={value} index={1}>
            <TextareaAutosize
              // variant="outlined"
              minRows={3}
              style={{ width: "80%", backgroundColor: "white" }}
              value={JSON.stringify(JSON.parse(taConf), null, 4)}
              onChange={(evt) => saveEdit(evt.target.value)}
            />
          </TabPanel>
        </Box>
      </div>
    </div>
  );
};

export default ConfigurationUI;
