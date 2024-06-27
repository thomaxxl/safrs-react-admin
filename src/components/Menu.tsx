import React, { forwardRef, useContext } from "react";
import {
  Menu as RAMenu,
  MenuItemLink,
  useLogout,
  useResourceDefinitions,
} from "react-admin";
import { AppBar, UserMenu } from "react-admin";
import DefaultIcon from "@mui/icons-material/ViewList";
import SettingsIcon from "@mui/icons-material/Settings";
import InfoIcon from "@mui/icons-material/Info";
import { Select, Typography } from "@mui/material";
import preval from "preval.macro";
import { MenuItem, Modal, SvgIcon } from "@mui/material";
import ExitIcon from "@mui/icons-material/PowerSettingsNew";
import Switch from "@mui/material/Switch";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { Box } from "@mui/system";
import { useInfoToggle } from "../InfoToggleContext";
import { ThemeColorContext } from "../ThemeProvider";
import colorpalette from "../images/colorpalette.png";

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

  return (
    <>
      <span onClick={handleOpen} title={`Info`} style={{ cursor: "pointer" }}>
        <HelpOutlineIcon
          sx={{ color: "#ccc", "&:hover": { color: "#3f51b5" } }}
        />
      </span>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
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
          }}
        >
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
  </div>
);

export const CustomAppBar = (props: any) => {
  const [infoToggle, setInfoToggle] = useInfoToggle();

  return (
    <AppBar
      {...props}
      elevation={1}
      userMenu={
        <div>
          <CustomUserMenu
            infoToggle={infoToggle}
            setInfoToggle={setInfoToggle}
          />
        </div>
      }
    >
      <Typography variant="h6" color="inherit" id="react-admin-title" />

      <span style={{ flex: "1" }} />
    </AppBar>
  );
};

const onMenuClick = (evt: any) => {
  console.log(`Menu Click`, evt);
};

export const Menu = (props: any) => {
  const resourcesDefinitions = useResourceDefinitions();
  const resources = Object.keys(resourcesDefinitions).map(
    (name) => resourcesDefinitions[name]
  );
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
