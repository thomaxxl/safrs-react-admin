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
import {Confirm} from 'react-admin'

const yaml = require("js-yaml");

const str = window.location.href;
const arr = str.split("/");
const index = arr.findIndex((e) => e === "admin");
let yamlName;
if (index === -1) {
  yamlName = "admin";
} else {
  yamlName = arr[index + 1] ?? "admin";
}
// console.log(yamlName);
let als_yaml_url = `/ui/admin/${yamlName}.yaml`;
if (window.location.href.includes(":3000") && !window.location.href.includes('load=')) {
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

const DeleteConf = (conf_name: any) => {
  console.log("conf_name: ", conf_name);
  if (!window.confirm(`Delete configuration "${conf_name}" ?`)) {
    return;
  }

  try {
    let configs = JSON.parse(localStorage.getItem("raconfigs") || "{}");
    delete configs[conf_name];
    localStorage.setItem("raconfigs", JSON.stringify(configs));
    window.location.reload();
  } catch (e) {
    alert("Localstorage error");
  }
};

const addConf = (conf: any) => {
  console.log("conf: ", conf);
  const configs = JSON.parse(localStorage.getItem("raconfigs") || "{}");
  if (!conf.api_root) {
    console.warn("Config has no api_root", conf);
    return false;
  }
  configs[conf.api_root] = conf;
  localStorage.setItem("raconf", JSON.stringify(conf));
  localStorage.setItem("raconfigs", JSON.stringify(configs));
  window.location.reload();
  return true;
};

export const LoadYaml = (config_url: any, notify: any) => {
  if (config_url == null) {
    config_url = als_yaml_url;
  }

  const saveConf = (conf_str: any) => {
    // first try to parse as json, if this doesn't work, try yaml
    try {
      const conf = JSON.parse(conf_str);
      if (typeof conf !== "object") {
        saveYaml(conf_str);
        return;
      }
      if (!addConf(conf) && notify) {
        notify("Failed to load config", "warning");
      }
    } catch (e) {
      saveYaml(conf_str);
    }
  };

  const saveYaml = (ystr: any) => {
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

  alert(config_url)
  
  fetch(config_url, { cache: "no-store" })
    .then((response) => response.text())
    .then((conf_str) => {
      localStorage.setItem("conf_cache1", conf_str);
      saveConf(conf_str);
      notify("Loaded configuration");
    })
    .catch((err) => {
      if (notify) {
        notify("Failed to load yaml", { type: "warning" });
      }
      console.error(`Failed to load yaml from ${config_url}: ${err}`);
    });
};

const ManageModal = () => {
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
  const textFieldRef = React.createRef<HTMLInputElement>();
  const notify = useNotify();
  return [
    <Button
      className={classes.widget}
      onClick={() => handleOpen()}
      color="primary"
    >
      Manage
    </Button>,
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
            onClick={(evt) => LoadYaml(textFieldRef?.current?.value, notify)}
            color="primary"
          >
            Load
          </Button>
        </Typography>
      </Box>
    </Modal>,
  ];
};

const ExternalConf = () => {

  const qpStr = window.location.hash.substr(window.location.hash.indexOf('?'))
  const queryParams = new URLSearchParams(qpStr);
  const loadURI = queryParams.get('load')
  const [open, setOpen] = useState(loadURI ? true : false)
  const handleDialogClose = () => setOpen(false)
  const notify = useNotify()
  const handleConfirm = () => {
    setOpen(false)
    LoadYaml(loadURI, notify, false)
    const conf_str = localStorage.getItem('conf_cache1')
    saveConfig(conf_str)
    console.log(document.location)
    console.log('nl', document.location.substr(document.location.indexOf('#')))
  }
  return <Confirm isOpen={open} label={''} content={`Do you want to load the external configuration from ${loadURI}`} 
          onConfirm={handleConfirm}
          onClose={handleDialogClose}
          title={'Load external configuration'}
          />
}

const ConfSelect = () => {
  let configs = [];

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
    localStorage.setItem("raconf", JSON.stringify(new_conf));
    window.location.reload();
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      <ExternalConf/>
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

const saveConfig = (conf) => {
  /*
    Save the current config in raconf to raconfigs
    */
  let current_conf = JSON.parse(localStorage.getItem("raconf") || "");
  const api_root = current_conf.api_root;
  if (!api_root) {
    alert("Can't save: no 'api_root' set in config");
    //console.log(current_conf)
    return;
  }
  let configs = JSON.parse(localStorage.getItem("raconfigs") || "{}");
  if (!configs) {
    configs = {};
  }
  configs[api_root] = current_conf;
  localStorage.setItem("raconfigs", JSON.stringify(configs));
  window.location.reload();
};

export const resetConf = (notify: any) => {
  interface DefConf {
    api_root: string;
    // other properties...
  }

  interface Configs {
    [key: string]: DefConf;
  }
  const configs: Configs = {};
  let defconf: DefConf =
    default_configs.length > 0 ? default_configs[0] : { api_root: "" };

  for (defconf of default_configs) {
    localStorage.setItem("raconf", JSON.stringify(defconf));
    configs[defconf.api_root] = defconf;
  }
  localStorage.setItem("raconf", JSON.stringify({}));
  localStorage.setItem("raconfigs", JSON.stringify(configs));
  LoadYaml(als_yaml_url, notify, true);
  return defconf;
};

const ConfigurationUI = (props: any) => {
  // console.log("cuip", props);
  const [value, setValue] = React.useState(0);

  const classes = useStyles();
  const notify = useNotify();

  const saveYaml = (ystr: any, ev: any) => {
    try {
      const jj = yaml.load(ystr);
      saveEdit(JSON.stringify(jj));
      setBgColor("black");
    } catch (e) {
      console.warn(`Failed to process`, ystr);
      //notify(`${e}`, { type: "warning"})
      setBgColor("red");
    }
  };

  const saveEdit = (text: any) => {
    try {
      if (text) {
        const parsed_conf = JSON.parse(text);
        setApiroot(parsed_conf.api_root);
      }
      setBgColor("#ddeedd");
      //localStorage.setItem("raconf", JSON.stringify(text, null, 4));
      localStorage.setItem("raconf", text);
      if (!taConf) {
        window.location.reload();
      }
    } catch (e) {
      //setBgColor("#eedddd");
      setBgColor("red");
    }
    setTaConf(text);
  };

  fetch(als_yaml_url, { cache: "no-store" })
    .then((response) => response.text())
    .then((conf_str) => {
      if (localStorage.getItem("conf_cache1") !== conf_str) {
        resetConf(() => {});
      }
    })
    .catch((err) => {
      console.log(err);
    });

  let conf =
    localStorage.getItem("raconf") || JSON.stringify(resetConf(() => {}));
  const [taConf, setTaConf] = useState(
    conf ? JSON.stringify(JSON.parse(conf), null, 4) : ""
  );
  const [bgColor, setBgColor] = useState("black");
  const [autosave, setAutosave] = useState(true);
  const [, setApiroot] = useState(JSON.parse(conf)?.api_root);

  const handleAutoSaveChange = (event: any) => {
    setAutosave(event.target.checked);
  };

  const Editor = useMemo(
    () => React.lazy(() => import("@uiw/react-monacoeditor")),
    []
  );
  const TabPanel = (props: any) => {
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

  function a11yProps(index: any) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }
  const handleChange = (event: any, newValue: any) => {
    setValue(newValue);
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
          onClick={() => saveConfig()}
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
                onChange={(ystr, ev) => saveYaml(ystr, ev)}
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