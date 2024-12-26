import React, { forwardRef, useContext } from "react";
import {
  useSidebarState,
  Menu as RAMenu,
  MenuItemLink,
  useLogout,
  useResourceDefinitions,
  Link,
  
} from "react-admin";
import { AppBar, UserMenu, LoadingIndicator, useCreatePath  } from "react-admin";
import DefaultIcon from "@mui/icons-material/ViewList";
import SettingsIcon from "@mui/icons-material/Settings";
import AccountCircle from "@mui/icons-material/AccountCircle";
import InfoIcon from "@mui/icons-material/Info";
import { Typography } from "@mui/material";
import Button from '@mui/material/Button';
import preval from "preval.macro";
import { MenuItem, Modal } from "@mui/material";
import ExitIcon from "@mui/icons-material/PowerSettingsNew";
import Switch from "@mui/material/Switch";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { Box } from "@mui/system";
import { useInfoToggle } from "../SraToggleContext";
import { useConf } from "../Config";
import { WGConversation } from "../components/apifab/WGconversation";
import "../style/HeaderStyle.css";
import { useGetIdentity } from 'react-admin';
import { UserMenu as ApiFabUserMenu } from "./apifab/ApiFabUser";
import { SlackIcon } from "../components/apifab/ApiFabComponents"; 




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

const ConfigurationMenuLink = forwardRef<any, any>((props, ref) => {
  return (
    <MenuItemLink
      ref={ref}
      to="/Configuration"
      primaryText="UI Settings"
      leftIcon={<SettingsIcon />}
      onClick={props.onClick}
      title="UI Settings"
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

const UserMenuLink = forwardRef<any, any>((props, ref) => {
  
  const { identity, isLoading } = useGetIdentity();
  const createPath = useCreatePath();

  const id = identity?.id || "";
  const username = identity?.fullName || "";

  if (isLoading) return <LoadingIndicator/>;
  
  return (
    <MenuItemLink
      ref={ref}
      to={createPath({ resource: 'User', type: 'show', id: id })}
      primaryText="User Settings"
      leftIcon={<AccountCircle />}
      onClick={props.onClick}
      title="UI Settings"
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
            sessionStorage.setItem("infoswitch", e?.target?.checked.toString());
            props.setInfoToggle(e.target.checked);
          }}
          checked={props.infoToggle}
        ></Switch>
      </MenuItem>
      <ConfigurationMenuLink />
      <UserMenuLink />

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

const SraToolbar = () => {

  // Todo: loadingindicator keeps spinning, check react-query isFetching/isMutating

  // const locales = useLocales();
  // const { darkTheme } = useThemesContext();
  return (
      <>
      <SlackIcon sx={{color: 'white'}}/>
          {/*locales && locales.length > 1 ? <LocalesMenuButton /> : null*/}
          {/*darkTheme && <ToggleThemeButton />*/}
          {/*<LoadingIndicator />*/}
      </>
  );
};


export const CustomAppBar = (props: any) => {
  const [infoToggle, setInfoToggle] = useInfoToggle();
  const apiFabLink = null;//<UserMenu/>// document.location.href.endsWith("/Project") ? null : <a href="https://apifabric.ai" className="apifabheaderlink">apifabric.ai</a>
  
  return (
    <AppBar
      sx={{backGroundColor: 'red'}}
      {...props}
      elevation={1}
      toolbar={<SraToolbar/>}
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
     <span style={{ flex: "1" }} > &nbsp;{apiFabLink}</span>
     
     <WGConversation/>
     
    </AppBar>
  );
};

const onMenuClick = (evt: any) => {
  //console.log(`Menu Click`, evt);
};


const SRAMenuItemLink = ({resource, conf}) => {
  return <>
          <MenuItemLink
            key={resource.name}
            to={`/${resource.name}`}
            primaryText={
              (resource.options && resource.options.label) || resource.name
            }
            leftIcon={resource.icon ? <resource.icon /> : <DefaultIcon />}
            onClick={onMenuClick}
            sx={conf.resources![resource.name].sx || {}}
          />
          
      </>
}

export const Menu = (props: any) => {
  const conf = useConf();
  const resourcesDefinitions = useResourceDefinitions();
  const resources = Object.keys(resourcesDefinitions).map(
    (name) => resourcesDefinitions[name]
  )
  const handlePointerLeave = () => {
    console.log("Pointer leave");
  };

  if(!conf.resources){
    return
  }
  // Additional RA resources, not in the config
  conf.resources['Home'] = {name: 'Home', icon: DefaultIcon}
  conf.resources['Configuration'] = {name: 'Home', icon: DefaultIcon, sx: {display: 'none'}}

  return (
    <>
      <RAMenu {...props}>
        {resources.map((resource) => (
          conf.resources![resource.name] && !conf.resources![resource.name].hidden &&
          <SRAMenuItemLink resource={resource} key={resource.name} conf={conf}/>
        ))}
      </RAMenu>
    </>
  );
};
