import { useState } from "react";
import Drawer from "@mui/material/Drawer";
import { useConf } from "../Config";
// import IconImageEye from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import IconKeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import { Button, SimpleShowLayout, TextField, useGetOne } from "react-admin";
import * as React from "react";

const QuickPreviewButton = ({
  resource_name,
  id,
}: {
  resource_name: any;
  id: any;
}) => {
  const [showPanel, setShowPanel] = useState(false);
  const { data } = useGetOne(resource_name, id);
  const conf = useConf();

  const handleClick = () => {
    setShowPanel(true);
  };

  const handleCloseClick = () => {
    setShowPanel(false);
  };

  const attr_show = conf?.resources?.[resource_name].attributes.map(
    (attr: any) => <TextField source={attr.name} />
  );
  return (
    <>
      <Button onClick={handleClick} label="ra.action.show">
        <VisibilityIcon />
      </Button>
      <Drawer anchor="right" open={showPanel} onClose={handleCloseClick}>
        <div>
          <Button label="Close" onClick={handleCloseClick}>
            <IconKeyboardArrowRight />
          </Button>
        </div>
        <SimpleShowLayout record={data}>{attr_show}</SimpleShowLayout>
      </Drawer>
    </>
  );
};

export default QuickPreviewButton;
