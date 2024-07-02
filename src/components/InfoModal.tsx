import React from "react";
import { Typography, Modal, Box, Button } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { Property } from "csstype";

const style = {
  position: "absolute" as Property.Position,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "75%",
  backgroundColor: "white",
  // border: "2px solid #000",
  boxShadow: "0px 0px 24px rgba(0, 0, 0, 0.2)",
  padding: 4,
  textAlign: "left" as Property.TextAlign,
};
const iconStyle = {
  color: "#ccc",
  "&:hover": { color: "#3f51b5" },
};

const InfoModal = ({ resource, mode }: { resource: any; mode: any }) => {
  const [open, setOpen] = React.useState(false);
  const handleOpen = (e: any) => {
    setOpen(true);
    e.stopPropagation();
    /*ReactDom.render(
        <ReactMarkdown children={"markdown"} remarkPlugins={[]} />,
        document.getElementById("info_content"))*/
  };
  const handleClose = (e: any) => {
    e.stopPropagation();
    setOpen(false);
  };
  const label = (
    <Button style={iconStyle}>
      <HelpOutlineIcon />
    </Button>
  );
  const content = resource[`info_${mode}`]; // modes: "show", "list", "edit"

  return content ? (
    <>
      <span onClick={handleOpen} title={`${resource.name} Info`}>
        {label}{" "}
      </span>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
           sx={{ ...style, borderRadius: "4px" }}
        >
          <Typography
            id="modal-modal-description"
            sx={{ marginTop: "2rem" }}
          >
            <div
              id="info_content"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </Typography>
        </Box>
      </Modal>
    </>
  ) : null;
};

export default InfoModal;
