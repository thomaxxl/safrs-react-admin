import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "75%",
  bgcolor: "background.paper",
  BorderRadius: "4px",
  boxShadow: 24,
  p: 4,
  textAlign: "left",
};

export default function JoinModal({
  label,
  content,
  resource_name,
}: {
  label: any;
  content: any;
  resource_name: any;
}) {
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
    <span>
      <span
        onClick={handleOpen}
        style={{ cursor: "pointer", color: "#3f51b5" }}
        title={`${resource_name} Relationship`}
      >
        {label}{" "}
      </span>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} style={{ borderRadius: "4px" }}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {label}
          </Typography>
          <Typography id="modal-modal-description" style={{ margin: "2 rem" }}>
            {content}
          </Typography>
        </Box>
      </Modal>
    </span>
  );
}
