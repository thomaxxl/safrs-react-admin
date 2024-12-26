/*
  Configuration UI
  Edit & Reset Configuration from UI
  Automatically load configuration from URL (admin.yaml)
  We support different use cases for loading configuration:
  - load= url parameter (load from external URL)
  - load from local storage
  - load from default admin.yaml
  - load from default admin.yaml (g.apifabric.ai: https://g.apifabric.ai/01J5DG24M932DPB2SK2CN6QFPR/admin.yaml)

  Configs are saved in local storage (raconf) and can be managed from the UI
*/
import * as React from "react";
import { Suspense, useEffect, useMemo } from "react";
import { useRef } from "react";
import { TextareaAutosize, TextField } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import { useState } from "react";
import ClearIcon from "@mui/icons-material/Clear";
import FormControlLabel from "@mui/material/FormControlLabel";
import { getConfigs, setConfigs, getCurrentConf, setCurrentConf, compareConf, isSpa } from "../Config";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import { useNotify } from "react-admin";
import { Loading } from "react-admin";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { Confirm } from "react-admin";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  SvgIcon,
} from "@mui/material";
import { ThemeColorContext } from "../ThemeProvider";

const URL = require("url-parse");
const yaml = require("js-yaml");
const arr = window.location.href.split("/").filter(item => item !== "");
const index = arr.findIndex((e) => e === 'admin');
let yamlName;

if (index === -1) {
  yamlName = "admin";
} else {
  yamlName = arr[index + 1] ?? "admin";
}
const yarm = yamlName.split(".");

let als_yaml_url = `/ui/admin/${yarm[0]}.yaml`;
als_yaml_url = window.location.href.replace(/\/admin-app\/.*$/, '/ui/admin/admin.yaml');

if (
  window.location.href.includes(":3000") &&
  !window.location.href.includes("load=")
) {
  // only for dev purposes
  als_yaml_url = `http://localhost:8282/ui/admin/${yamlName}.yaml`;
  // console.log('als_yaml_urlals_yaml_url',als_yaml_url);  
}
// if(window.location.origin === 'https://g.apifabric.ai'){

// }


const getRawConf = () => {
  let conf = getCurrentConf(true); // get current config without parsing
  return conf
}

const DeleteConf = (conf_name: any) => {
  if (!window.confirm(`Delete configuration "${conf_name}" ?`)) {
    return;
  }
  try {
    let configs = getConfigs();
    delete configs[conf_name];
    setConfigs(configs);

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
  const configs = getConfigs();
  if (!conf.api_root) {
    console.warn("Config has no api_root", conf);
    return false;
  }

  if (!conf.ui) {
    conf.ui = {
      theme: {
        name: "default",
        palette: {
          primary: "indigo",
        },
      },
    };
  }

  const url = new URL(window.location.href);
  const hashParams = new URLSearchParams(url.hash.split("?")[1]);
  let loadUrl = hashParams.get("load") ?? als_yaml_url

  if (!conf.conf_source) {
    const encodedLoadUrl = btoa(loadUrl);
    conf.conf_source = encodedLoadUrl;
  }
  configs[conf.api_root] = conf;
  setCurrentConf(conf);
  setConfigs(configs);
  return true;
};

export const loadYaml = (
  config_url: any,
  notify: any,
  state: any,
  handleLoader: any = () => {}
) => {
  
  console.log("loadYaml config_url", config_url);
  
  if (state) {
    if (!config_url?.includes("http") && !config_url?.includes(".yaml")) {
      if (config_url !== undefined) config_url = atob(config_url);
    }
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
      
      try {
        const conf = yaml.load(ystr);
        const encodedLoadUrl = btoa(config_url);
        if (!conf.conf_source) {
          conf.conf_source = encodedLoadUrl;
        }
        if (!addConf(conf) && notify) {
          notify("Failed to load config", "warning");
        }
       
      } catch (e) {
        console.warn(`Failed to load yaml`, ystr);
        notify("Failed to load config", "warning");
        //window.location.href = "/#/Configuration";
        console.error(e);
      }
    };
    
    notify("Loading configuration", { type: "info" });
    
    const oldConf = getRawConf();
    fetch(config_url, { cache: "no-store" })
      .then((response) => {
        return response.text();
      })
      .then((conf_str) => {
        if (conf_str.includes("api_root")) {
          localStorage.setItem("conf_cache1", conf_str);
          saveConf(conf_str);
          handleLoader();
          if(! compareConf(oldConf, getRawConf())){
            setTimeout(() => {
              console.log('reloading; new Conf (timeout)', oldConf, getRawConf());
              window.location.href = document.location.href.split('#')[0]
            }, 100);  
          }
        } else {
          notify(`Failed to load yaml from ${config_url}`, { type: "warning" });
          console.error(`Failed to load yaml (0) from ${config_url}`);
        }
      })
      .catch((err) => {
        if (notify) {
          notify("Failed to load yaml", { type: "warning" });
        }
        console.error(`Failed to load yaml from ${config_url}: ${err}`);
      })
  }
};

const ManageModal = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const [open, setOpen] = React.useState(false);
  const handleOpen = (e?: any) => {
    setOpen(true);
  };
  const handleClose = (e: any) => {
    setOpen(false);
  };

  let configs = [];

  const handleClick = () => {
    setOpen(false);
    try {
      let newURL = new URL(textFieldRef?.current?.value);
      navigate(
        `?load=${encodeURIComponent(textFieldRef?.current?.value || "")}`
      );
    } catch (error) {
      notify("Invalid URL", { type: "warning" });
    }
  };

  configs = getConfigs();
  
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

  return (
    <>
      <Button
        style={{
          border: "1px solid #3f51b5",
          marginRight: "1em",
          marginTop: "1em",
          marginBottom: "1em",
        }}
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
              style={{
                border: "1px solid #3f51b5",
                marginRight: "1em",
                marginTop: "1em",
                marginBottom: "1em",
              }}
              onClick={(evt) => handleClick()}
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

export const ExternalConf = () => {
  const notify = useNotify();
  const qpStr = window.location.hash.substr(window.location.hash.indexOf("?"));
  const queryParams = new URLSearchParams(qpStr);
  let loadURI: any = queryParams?.get("load");
  if (loadURI !== null) {
    try {
      let newURl = new URL(loadURI);
    } catch (error) {
      notify("Enter a valid URL", { type: "warning" });
      window.location.href = "/#/Configuration";
    }
  }

  const [open, setOpen] = useState(false);
  const [loader, setLoader] = useState(false);

  React.useEffect(() => {
    if (window.location.href.includes("load")) {
      setOpen(true);
    }
  }, [window.location.href]);

  const handleDialogClose = () => {
    setOpen(false);
    // LoadYaml("/ui/admin/admin.yaml", notify);
  };

  const handleConfirm = () => {
    // for security purposes (xss) we require a confirmation dialog
    setLoader(true);
    setOpen(false);
    console.log("reloadC");
    loadYaml(loadURI, notify, true, handleLoader);
    const conf_str = localStorage.getItem("conf_cache1");
    console.debug("conf_str: ", conf_str);
    saveConfig(conf_str);
  };

  const handleLoader = () => {
    setLoader(false);
  };

  let requireConfirm = true;
  
  if(document.location.origin === 'https://g.apifabric.ai'){
    let loadURI2 = loadURI
    if(document.location.pathname.split('/').length > 1 && document.location.pathname.split('/')[1] !== 'admin-app'){
      // for g.apifab, we need to load the admin.yaml from the correct path which is the first part of the path
      loadURI2 = `https://g.apifabric.ai/${document.location.pathname.split('/')[1]}/admin.yaml`;
    }
    requireConfirm = false;
    const oldConf = getRawConf()
    loadYaml(loadURI2, notify, true, handleLoader);
    const conf_str = localStorage.getItem("conf_cache1");
    saveConfig(conf_str);
    const newConf = getRawConf()
    if (oldConf !== newConf) {
      console.log('reloading; new Conf:', newConf); 
      window.location.href = document.location.href.replace("#Configuration","#Home");
    }
  }
  
  const confirm = requireConfirm ? (
    <Confirm
      isOpen={open}
      content={`Do you want to load the external configuration from ${loadURI}`}
      onConfirm={handleConfirm}
      onClose={handleDialogClose}
      title={"Load external configuration"}
    />
  ) : null;

  return (
    <>
      {confirm}
      <div>
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
    </>
  );
};

const ConfSelect = () => {
  const notify = useNotify();
  const configs = getConfigs();
    
  const current_conf = getRawConf();
  const [current, setCurrent] = React.useState(current_conf.api_root);

  const handleChange = (event: any) => {
    setCurrent(event.target.value);
    const new_conf = configs[event?.target?.value];
    if (!new_conf) {
      return;
    }
    setCurrentConf(new_conf);
    window.location.reload();
    console.log("handleChange Reload");
    window.location.href = "/";
  };

  return (
    <Box sx={{ minWidth: 120, width: "100%" }}>
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
  console.log("saveConfig", conf);
  let current_conf = getRawConf();
  const api_root = current_conf.api_root;
  if (window.location.origin !== "https://g.apifabric.ai" && !api_root && !window.location.href.includes("load")) {
    alert("Can't save: no 'api_root' set in config");
    return;
  }
  if (!api_root && window.location.href.includes("load")) {
    return;
  }
  let configs = getConfigs();
  if (!configs) {
    configs = {};
  }
  configs[api_root] = current_conf;
  setConfigs(configs);
};

export const resetConf = (notify: any, reload: any = false) => {
  let raConfObj = getRawConf();
  if (raConfObj.conf_source) {
    let confSource = raConfObj.conf_source;
    let decodedConfSource = atob(confSource);
    als_yaml_url = decodedConfSource;
  }

  const configs: any = {};
  // let defconf: any =
  //   default_configs.length > 0 ? default_configs[0] : { api_root: "" };

  // for (defconf of default_configs) {
  //   setCurrentConf(defconf);
  //   configs[defconf.api_root] = defconf;
  // }
  //setCurrentConf({})
  setConfigs(configs);
  let check_load = window.location.href.includes("load");
  console.log("reload", check_load, reload);
  if (check_load) {
    loadYaml(als_yaml_url, notify, false);
  } else {
    loadYaml(als_yaml_url, notify, true);
  }
  return defconf;
};

export const ThemeSelector = () => {
  const { themeColor, setThemeColor } = React.useContext(ThemeColorContext);

  const value: any = localStorage.getItem("ThemeColor");
  const conf = getRawConf();
  if (!conf.ui) {
    conf.ui = {
      theme: {
        name: "default",
        palette: {
          primary: "indigo",
        },
      },
    };
    localStorage.setItem("ThemeColor", "default");
  }
  if (conf.ui) {
    localStorage.setItem("ThemeColor", conf.ui.theme.name);
  }

  const handleColorChange = (event) => {
    localStorage.setItem("ThemeColor", event.target.value);
    conf.ui = {
      theme: {
        name: `${event.target.value}`,
        palette: {
          primary: event.target.value,
        },
      },
    };
    setThemeColor(event.target.value);
    setCurrentConf(conf);
    localStorage.setItem("autoReload", "false");
    window.location.reload();
  };

  return (
    <>
      <Select
        value={value}
        sx={{
          "&.MuiInputBase-root": {
            padding: "0 8px",
            position: "relative",
            height: "37px",
            border: "1px solid #3f51b5",
            borderRadius: "4px",
            float: "right",
            margin: "auto 0 auto auto",
            "& div.MuiSelect-select": {
              position: "absolute",
              background: "transparent",
              left: 0,
              padding: 0,
            },
          },
          "&.MuiInput-underline:before, &.MuiInput-underline:after": {
            display: "none",
          },
        }}
        onChange={handleColorChange}
        disableUnderline={false}
        renderValue={() => ""}
        IconComponent={() => (
          <>
            <SvgIcon
              style={{
                color:
                  value === "radiantLightTheme"
                    ? "#3f51b5"
                    : value === "houseLightTheme"
                    ? "#3f51b5"
                    : value === "nanoLightTheme"
                    ? "#3f51b5"
                    : value === "default"
                    ? "#3f51b5"
                    : "#3f51b5",
              }}
            >
              <svg height="20px" width="20px" viewBox="0 0 36 36">
                <g>
                  <path
                    d="M32.23,14.89c-2.1-.56-4.93,1.8-6.34.3-1.71-1.82,2.27-5.53,1.86-8.92-.33-2.78-3.51-4.08-6.66-4.1A18.5,18.5,0,0,0,7.74,7.59c-6.64,6.59-8.07,16-1.37,22.48,6.21,6,16.61,4.23,22.67-1.4a17.73,17.73,0,0,0,4.22-6.54C34.34,19.23,34.44,15.49,32.23,14.89ZM9.4,10.57a2.23,2.23,0,0,1,2.87,1.21,2.22,2.22,0,0,1-1.81,2.53A2.22,2.22,0,0,1,7.59,13.1,2.23,2.23,0,0,1,9.4,10.57ZM5.07,20.82a2.22,2.22,0,0,1,1.82-2.53A2.22,2.22,0,0,1,9.75,19.5,2.23,2.23,0,0,1,7.94,22,2.24,2.24,0,0,1,5.07,20.82Zm7,8.33a2.22,2.22,0,0,1-2.87-1.21A2.23,2.23,0,0,1,11,25.41a2.23,2.23,0,0,1,2.87,1.21A2.22,2.22,0,0,1,12,29.15ZM15,8.26a2.23,2.23,0,0,1,1.81-2.53,2.24,2.24,0,0,1,2.87,1.21,2.22,2.22,0,0,1-1.82,2.53A2.21,2.21,0,0,1,15,8.26Zm5.82,22.19a2.22,2.22,0,0,1-2.87-1.21,2.23,2.23,0,0,1,1.81-2.53,2.24,2.24,0,0,1,2.87,1.21A2.22,2.22,0,0,1,20.78,30.45Zm5-10.46a3.2,3.2,0,0,1-1.69,1.76,3.53,3.53,0,0,1-1.4.3,2.78,2.78,0,0,1-2.56-1.5,2.49,2.49,0,0,1-.07-2,3.2,3.2,0,0,1,1.69-1.76,3,3,0,0,1,4,1.2A2.54,2.54,0,0,1,25.79,20Z"
                    fill="currentColor"
                  />
                </g>
              </svg>
            </SvgIcon>
          </>
        )}
      >
        <MenuItem value="nanoLightTheme">Nano Light</MenuItem>
        <MenuItem value="radiantLightTheme">Radiant Light</MenuItem>
        <MenuItem value="houseLightTheme">House Light</MenuItem>
        <MenuItem value="default">default</MenuItem>
      </Select>
    </>
  );
};



const ConfigurationUI = (props) => {
  const [data, setData] = useState(getRawConf());
  const [raconfigsData, setRaconfigsData] = useState(getConfigs());
  const [value, setValue] = useState(0);
  const editorRef = useRef(null);
  const editorJsonRef = useRef(null);
  const notify = useNotify();
  const ref = useRef(true);
  const firstRender = ref.current;
  ref.current = false;

  const saveYaml = (ystr) => {
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
      const parsed_conf = JSON.parse(text);
      if (parsed_conf?.api_root) {
        setApiroot(parsed_conf.api_root);
      }
      setBgColor("#ddeedd");
      setCurrentConf(parsed_conf);
      if (!taConf) {
        window.location.reload();
      }
    } catch (e) {
      setBgColor("red");
    }
    setTaConf(text);
  };

  if (window.location.href.includes("load=")) {
    const qpStr = window.location.hash.substr(window.location.hash.indexOf("?"));
    const queryParams = new URLSearchParams(qpStr);
    const loadURI = queryParams.get("load");
    als_yaml_url = loadURI;
  }

  useEffect(() => {
    if (raconfigsData === null) {
      fetch(als_yaml_url, { cache: "no-store" })
        .then((response) => response.text())
        .then((conf_str) => {
          setData(conf_str);
          if (localStorage.getItem("conf_cache1") !== conf_str) {
            resetConf(() => {}, true);
          }
        })
        .catch(() => {
          notify("Can't Load configuration file");
        });
    }
  }, [data]);

  let conf = getRawConf();
  const [taConf, setTaConf] = useState(conf ? JSON.stringify(conf, null, 4) : "");
  const [bgColor, setBgColor] = useState("black");
  const [autosave, setAutosave] = useState(true);
  const [ showLoader, setShowLoader ] = useState(false);
  const loader = useRef(false);
  const [autoReload, setAutoReload] = useState(() => {
    if (document.location.origin === "https://apifabric.ai" || document.location.origin === "https://g.apifabric.ai") {
      localStorage.setItem("autoReload", "false");
      return false;
    }
    const storedAutoReload = localStorage.getItem("autoReload");
    return storedAutoReload !== null ? JSON.parse(storedAutoReload) : true;
  });
  const [, setApiroot] = useState(conf?.api_root);

  const handleLoader = () => {
    loader.current = false;
    setShowLoader(false);
  };

  useEffect(() => {
    if (autoReload && ! sessionStorage.getItem("autoReloaded")) {
      if (performance.navigation.type === performance.navigation.TYPE_RELOAD) {
        const conf = getRawConf();
        if (conf?.conf_source !== undefined && loader.current === false) {
          console.log("Auto reloading config");
          sessionStorage.setItem("autoReloaded", "true");
          loader.current = true;
          setShowLoader(true)
          loadYaml(conf?.conf_source, notify, true, handleLoader);
          setShowLoader(false)
        }
      }
    }
  }, [autoReload, notify]);

  const handleAutoSaveChange = (event: any) => {
    setAutosave(event.target.checked);
  };

  const handleAutoReloadChange = (event: any) => {
    localStorage.setItem("autoReload", event.target.checked);
    if(event.target.checked === true){
      sessionStorage.removeItem("autoReloaded");
    }
    setAutoReload(event.target.checked);
  };

  const Editor = React.memo(
    React.lazy(() => import("@uiw/react-monacoeditor")),
    (prevProps, nextProps) => prevProps.value === nextProps.value
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
  const [currentYaml, setCurrentYaml] = useState(yaml.dump(getRawConf()));

  const handleEdit = (newtaConf) => {
    editorRef.current = newtaConf;
    setShowButton(true);
  };

  const handleSaveJsonEditor = (newtext) => {
    if (newtext !== undefined) {
      saveEdit(editorJsonRef.current);
      window.location.reload();
    }
  };

  const TextareaAutosizeMemo = React.memo((props) => {
    const [textAreaValue, setTextAreaValue] = useState(JSON.stringify(JSON.parse(props.taConf), null, 4));

    const handleTextAreaChange = (evt) => {
      setTextAreaValue(evt.target.value);
      editorJsonRef.current = evt.target.value;
    };

    return (
      <TextareaAutosize
        minRows={3}
        style={{ width: "80%", backgroundColor: "white" }}
        value={textAreaValue}
        onChange={handleTextAreaChange}
      />
    );
  });

  const handleClickSave = () => {
    saveConfig("");
    if (editorJsonRef.current !== null) {
      localStorage.setItem("autoReload", "false");
      saveEdit(editorJsonRef.current);
      window.location.reload();
    }
    if (currentYaml !== editorRef.current) {
      handleSave(null, null);
    }
  };

  const handleSave = () => {
    if (editorRef.current !== null) {
      localStorage.setItem("autoReload", "false");
      saveYaml(editorRef.current);
      window.location.reload();
    }
  };

  const handleReset = () => {
    let raconfigs = getConfigs()
    if (editorJsonRef.current !== null || editorRef.current !== yaml.dump(raconfigs)) {
      saveYaml(currentYaml, "");
    } else {
      resetConf(notify);
    }
  };

  if (firstRender) {
    //resetConf(notify);
  }

  const raConf = getRawConf();
  if(document.location.origin === 'https://g.apifabric.ai' && !raConf ){
    console.log('document.location.origin redir Config',document.location.origin, raConf);
    if(!document.location.hash.includes("#Configuration")){
      document.location.href = document.location.href.split("#")[0] + "#Configuration";
    }
  }
  
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        <ConfSelect />
        <ManageModal />
        <Button
          style={{ border: "1px solid #3f51b5", marginRight: "1em", marginTop: "1em", marginBottom: "1em" }}
          onClick={() => saveEdit("{}")}
          color="primary"
        >
          Clear
        </Button>
        <Button
          style={{ border: "1px solid #3f51b5", marginRight: "1em", marginTop: "1em", marginBottom: "1em" }}
          onClick={() => resetConf(notify)}
          color="primary"
        >
          Reset
        </Button>
        <Button
          style={{ border: "1px solid #3f51b5", marginRight: "1em", marginTop: "1em", marginBottom: "1em" }}
          onClick={() => handleClickSave()}
          color="primary"
        >
          Apply
        </Button>
        <Button
          style={{ border: "1px solid #3f51b5", marginRight: "1em", marginTop: "1em", marginBottom: "1em" }}
          onClick={() => saveConfig("")}
          color="primary"
        >
          Save
        </Button>
        <FormControlLabel
          control={<Checkbox checked={autosave} onChange={handleAutoSaveChange} color="primary" />}
          label="Auto Save Config"
        />
        <FormControlLabel
          control={<Checkbox checked={autoReload} onChange={handleAutoReloadChange} color="primary" />}
          label="Auto Reload Config"
        />
        <ThemeSelector />
      </div>
      <div>
        <Box sx={{ width: "100%" }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
              <Tab label="yaml" {...a11yProps(0)} />
              <Tab label="json" {...a11yProps(1)} />
            </Tabs>
          </Box>
          <TabPanel value={value} index={0}>
            <Suspense fallback={<Loading />}>
              <Editor
                language="yaml"
                value={yaml.dump(JSON.parse(taConf))}
                options={{ theme: "vs-dark" }}
                height="1000px"
                style={{ borderLeft: `8px solid ${bgColor}` }}
                editorDidMount={(editor) => {
                  const initialValue = editor.getValue();
                }}
                onChange={(taConf) => handleEdit(taConf)}
              />
            </Suspense>
          </TabPanel>
          <TabPanel value={value} index={1}>
            <TextareaAutosizeMemo taConf={taConf} handleSaveJson={handleSaveJsonEditor} />
          </TabPanel>
        </Box>
        {showLoader ? (
          <Dialog
            open={true}
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              color: "white",
              borderRadius: "10px",
            }}
          >
            <Loading />
          </Dialog>
        ): null}
      </div>
    </div>
  );
};

const ConfigurationUIWrapper = (props) => {
  if(isSpa()){
    return (
      <>NoConfigurationUI-SPA</>
    );
  }
  return (
    <ConfigurationUI {...props} />
  );
}

export default ConfigurationUIWrapper;