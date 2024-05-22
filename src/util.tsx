import React from "react";
import { Typography } from "@material-ui/core";
import { Pagination } from "react-admin";
import loadable from "@loadable/component";
import Popover from "@material-ui/core/Popover";

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
