import React, { useState, useEffect } from "react";
import { Typography } from "@mui/material";
import { Pagination } from "react-admin";
import loadable from "@loadable/component";
import Popover from "@mui/material/Popover";

export const type2resource = (type: any, conf: any) => {
  for (let [resource_name, resource] of Object.entries<any>(conf?.resources)) {
    if (resource.type === type) {
      return resource_name;
    }
  }
  console.warn(`No resource for type "${type}`);
  return conf[type];
};

export const DynPagination = (props: any) => {
  return (
    <Pagination
      rowsPerPageOptions={[10, 25, 50, 100]}
      perPage={props.perPage || 25}
      {...props}
    />
  );
};

export type ExtraComponentProps = {
  instance: any;
  show?: boolean;
  list?: JSX.Element;
  attr?: any;
};

export const load_custom_component = (component_name: any, item: any) => {
  try {
    const LabelComponent: React.ComponentType<ExtraComponentProps> = loadable(
      () => import(`./components/Custom`),
      {
        resolveComponent: (components: { [key: string]: any }) =>
          components[`${component_name}`],
      }
    );
    return <LabelComponent instance={item} />;
  } catch (e) {
    alert("Custom component error");
    console.error("Custom component error", e);
  }
  return null;
};

export const InfoPopover = ({ label, content }: any) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const showInfo = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  if (!content) {
    return label;
  }
  return (
    <div>
      <span onClick={handleClick} onMouseOver={showInfo}>
        {label}
      </span>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <Typography component="span">{content}</Typography>
      </Popover>
    </div>
  );
};


export const deletePrefixedEntries = (prefix: string) => {
  // Get the number of entries in localStorage
  const totalEntries = localStorage.length;

  // Create an array to store keys to remove
  const keysToRemove = [];

  // Loop through each entry in localStorage
  for (let i = 0; i < totalEntries; i++) {
    // Get the key at the current index
    const key = localStorage.key(i);

    // Check if the key starts with the desired prefix
    if (key?.startsWith(prefix)) {
      // Add the key to the list of keys to remove
      keysToRemove.push(key);
    }
  }

  // Loop through the list of keys to remove and delete each one
  for (const key of keysToRemove) {
    localStorage.removeItem(key);
  }
}


export const useHash = () => {
  const [hash, setHash] = useState(() => window.location.hash);

  useEffect(() => {
      const onHashChange = () => {
          setHash(window.location.hash);
      };

      window.addEventListener('hashchange', onHashChange);

      return () => {
          window.removeEventListener('hashchange', onHashChange);
      };
  }, []);

  return hash;
};



export const parseJwt = (token: string) => {
  try{
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.warn("Error parsing JWT", token, e);
    return {};
  }
}
