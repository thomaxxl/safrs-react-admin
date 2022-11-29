import React, {forwardRef} from 'react'
import { makeStyles } from '@material-ui/core/styles';
import { Menu as RAMenu, MenuItemLink, useLogout, useResourceDefinitions } from 'react-admin';
import { AppBar, UserMenu} from 'react-admin';
import DefaultIcon from '@material-ui/icons/ViewList';
import SettingsIcon from '@material-ui/icons/Settings';
import InfoIcon from '@material-ui/icons/Info';
import { Typography } from '@material-ui/core';
import preval from 'preval.macro'
import { MenuItem, Modal } from '@mui/material';
import ExitIcon from '@mui/icons-material/PowerSettingsNew';
import Switch from '@mui/material/Switch';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { Box } from '@mui/system';
import {useInfoToggle} from '../InfoToggleContext'


const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: "75%",
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    textAlign: "left"
} 

const useStyles = makeStyles({
    title: {},
    spacer: { flex: 1 },
    info_modal: style,
    icon: {
        
        color: '#ccc',
        '&:hover': { color: '#3f51b5' }
    },
});
const InfoMenuModal = () => {
    const [open, setOpen] = React.useState(false);
    const handleOpen = (e) => {
        setOpen(true);
        e.stopPropagation(); 
    }
    const handleClose = (e) => {e.stopPropagation();setOpen(false);}
    const classes = useStyles()
    const label = <HelpOutlineIcon className={classes.icon}/>
 
    return  <>
        <span onClick={handleOpen} title={`Info`}>{label}</span>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style} className={classes.info_modal}>
            <Typography id="modal-modal-description"  sx={{ mt: 3 }}>
                <div style={{display:"flex",alignItems:"center", justifyContent:"center"}}>Toggle to On/Off to Enable/Disable application tour info.</div>
            </Typography>
          </Box>
        </Modal>
      </>
}

const MyLogoutButton = forwardRef((props, ref) => {
    const logout = useLogout();
    const handleClick = () => logout();
    return (
        <MenuItem
            onClick={handleClick}
            ref={ref}
        >
            <ExitIcon /> Logout
        </MenuItem>
    );
});


const ConfigurationMenu = forwardRef((props, ref) => {
    return (
        <MenuItemLink
            ref={ref}
            to="/configuration"
            primaryText={'Settings'}
            leftIcon={<SettingsIcon />}
            onClick={props.onClick}
            sidebarIsOpen
        />
    );
});


const CustomUserMenu = (props) => (
  <UserMenu {...props}>
    <MenuItem>
      <InfoMenuModal />
      <Switch
        onChange={(e) => {
          localStorage.setItem("infoswitch", e.target.checked);
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
);

export const CustomAppBar = (props) => {
    const [infoToggle,setInfoToggle] = useInfoToggle()
    const classes = useStyles();
    
    return (
        <AppBar {...props} elevation={1} userMenu={<CustomUserMenu className={classes.menu} infoToggle={infoToggle} setInfoToggle={setInfoToggle} />}>
            <Typography
                variant="h6"
                color="inherit"
                className={classes.title}
                id="react-admin-title"
            />
            <span className={classes.spacer} />
        </AppBar>
    );
};

const onMenuClick = (evt) => {
    //console.log(`Menu Click`, evt);
}

export const Menu = (props) => {
    const resourcesDefinitions = useResourceDefinitions();
    const resources = Object.keys(resourcesDefinitions).map(name => resourcesDefinitions[name]);    
    // const open = true;
    return (
        <RAMenu {...props}>
            {resources.map(resource => 
                <MenuItemLink
                    key={resource.name}
                    to={`/${resource.name}`}
                    primaryText={
                        (resource.options && resource.options.label) ||
                        resource.name
                    }
                    leftIcon={
                        resource.icon ? <resource.icon /> : <DefaultIcon />
                    }
                    onClick={onMenuClick}
                    sidebarIsOpen={true}
                />
            )}
        </RAMenu>
    );
};