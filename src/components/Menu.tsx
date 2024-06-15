import React, { forwardRef, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Menu as RAMenu,
  MenuItemLink,
  useLogout,
  useResourceDefinitions,
} from "react-admin";
import { AppBar, UserMenu } from "react-admin";
import DefaultIcon from "@material-ui/icons/ViewList";
import SettingsIcon from "@material-ui/icons/Settings";
import InfoIcon from "@material-ui/icons/Info";
import { Select, Typography } from "@material-ui/core";
import preval from "preval.macro";
import { MenuItem, Modal, SvgIcon } from "@mui/material";
import ExitIcon from "@mui/icons-material/PowerSettingsNew";
import Switch from "@mui/material/Switch";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { Box } from "@mui/system";
import { useInfoToggle } from "../InfoToggleContext";
import { CSSProperties } from "@material-ui/core/styles/withStyles";
import { ThemeColorContext } from "../ThemeProvider";
import colorpalette from "../images/colorpalette.png";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "75%",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: "0px 3px 5px 2px rgba(0, 0, 0, 0.3)",
  p: 4,
  textAlign: "left",
};

const useStyles = makeStyles({
  title: {},
  spacer: { flex: 1 },
  info_modal: style as CSSProperties,
  icon: {
    color: "#ccc",
    "&:hover": { color: "#3f51b5" },
  },
  menu: {},
  palletteStyle: {
    color: "#fff",
  },
  mySelectStyle: {
    padding: "0 8px",
    "&.MuiInput-underline:before, &.MuiInput-underline:after": {
      display: "none",
    },
    "& .MuiSelect-root": {
      position: "absolute",
      background: "transparent",
    },
  },
});
const InfoMenuModal = () => {
  const [open, setOpen] = React.useState(false);
  const handleOpen = (e: any) => {
    setOpen(true);
    e.stopPropagation();
  };
  const handleClose = (e: any) => {
    e.stopPropagation();
    setOpen(false);
  };
  const classes = useStyles();
  const label = <HelpOutlineIcon className={classes.icon} />;

  return (
    <>
      <span onClick={handleOpen} title={`Info`}>
        {label}
      </span>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className={classes.info_modal}>
          <Typography
            id="modal-modal-description"
            style={{ marginTop: "3 rem" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Toggle to On/Off to Enable/Disable application tour info.
            </div>
          </Typography>
        </Box>
      </Modal>
    </>
  );
};

const MyLogoutButton = forwardRef<HTMLLIElement, {}>((props, ref) => {
  const logout = useLogout();
  const handleClick = () => {
    logout();
    console.log("logout");
  };
  return (
    <MenuItem onClick={handleClick} ref={ref}>
      <ExitIcon /> Logout
    </MenuItem>
  );
});

const ConfigurationMenu = forwardRef<any, any>((props, ref) => {
  return (
    <MenuItemLink
      ref={ref}
      to="/configuration"
      primaryText="Settings"
      leftIcon={<SettingsIcon />}
      onClick={props.onClick}
      sidebarIsOpen
      title="Settings"
      color="default"
      translate="yes"
      hidden={false}
      style={{}}
      dense={false}
      disabled={false}
      className=""
      classes={{}}
      slot=""
      defaultChecked={false}
    />
  );
});

const handlePointerLeave = () => {
  console.log("Pointer leave");
};

const CustomUserMenu = (props: any) => (
  <div style={{ display: "flex", justifyContent: "space-between" }}>
    <UserMenu {...props}>
      <MenuItem>
        <InfoMenuModal />
        <Switch
          onChange={(e) => {
            localStorage.setItem("infoswitch", e?.target?.checked.toString());
            props.setInfoToggle(e.target.checked);
          }}
          checked={props.infoToggle}
        ></Switch>
      </MenuItem>
      <ConfigurationMenu />

      <MenuItemLink
        primaryText={preval`module.exports = new Date().toString().split(' ').slice(1,3).join('');`}
        to="/#/info"
        leftIcon={<InfoIcon />}
      />

      <MyLogoutButton />
    </UserMenu>
    {/*  */}
  </div>
);

export const CustomAppBar = (props: any) => {
  const [infoToggle, setInfoToggle] = useInfoToggle();
  const classes = useStyles();

  return (
    <AppBar
      {...props}
      elevation={1}
      userMenu={
        <div>
          <CustomUserMenu
            className={classes.menu}
            infoToggle={infoToggle}
            setInfoToggle={setInfoToggle}
          />
        </div>
      }
    >
      <Typography
        variant="h6"
        color="inherit"
        className={classes.title}
        id="react-admin-title"
      />
      <span className={classes.spacer} />
      <MyAppBar {...props} />
    </AppBar>
  );
};

const onMenuClick = (evt: any) => {
  //console.log(`Menu Click`, evt);
};

export const MyAppBar = () => {
  const { themeColor, setThemeColor } = useContext(ThemeColorContext);

  const style = useStyles();

  const value: any = localStorage.getItem("ThemeColor");
  console.log("value: ", value);
  const handleColorChange = (event) => {
    localStorage.setItem("ThemeColor", event.target.value);
    setThemeColor(event.target.value);
  };

  return (
    <>
      <Select
        value={""}
        className={style.mySelectStyle}
        onChange={handleColorChange}
        disableUnderline={false}
        IconComponent={() => (
          <>
            <SvgIcon
              className={style.palletteStyle}
              style={{
                color:
                  value === "radiantLightTheme"
                    ? "black"
                    : value === "houseLightTheme"
                    ? "white"
                    : value === "nanoLightTheme"
                    ? "black"
                    : value === "default"
                    ? "white"
                    : "white",
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
            {/* <img src={colorpalette} style={{ width: "20px" }} /> */}
          </>
        )}
      >
        <MenuItem value="nanoLightTheme">nanoLightTheme</MenuItem>
        <MenuItem value="radiantLightTheme">radiantLightTheme</MenuItem>
        <MenuItem value="houseLightTheme">houseLightTheme</MenuItem>
        <MenuItem value="default">default</MenuItem>
      </Select>
    </>
  );
};

export const Menu = (props: any) => {
  const resourcesDefinitions = useResourceDefinitions();
  const resources = Object.keys(resourcesDefinitions).map(
    (name) => resourcesDefinitions[name]
  );
  const handlePointerLeave = () => {
    console.log("Pointer leave");
  };
  // const open = true;
  return (
    <>
      <RAMenu {...props}>
        {resources.map((resource) => (
          <MenuItemLink
            key={resource.name}
            to={`/${resource.name}`}
            primaryText={
              (resource.options && resource.options.label) || resource.name
            }
            leftIcon={resource.icon ? <resource.icon /> : <DefaultIcon />}
            onClick={onMenuClick}
            sidebarIsOpen={true}
          />
        ))}
      </RAMenu>
    </>
  );
};
