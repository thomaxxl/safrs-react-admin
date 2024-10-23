import { styled } from "@mui/material/styles";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import MuiAccordion from "@mui/material/Accordion";
import MuiAccordionSummary from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import { AccordionProps as MuiAccordionProps, AccordionSummaryProps as MuiAccordionSummaryProps, Box } from "@mui/material";

const Accordion = styled(({ ...props }: MuiAccordionProps) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  "&:not(:last-child)": {
    borderBottom: 0,
  },
  "&:before": {
    display: "none",
  },
}));

const AccordionSummary = styled(({ ...props }: MuiAccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: "0.9rem" }} />}
    sx={{ '& .MuiTypography-root': { fontSize: '0.9em', fontStyle: 'bold' } }}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, .05)"
      : "rgba(0, 0, 0, .03)",
  flexDirection: "row-reverse",
  "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
    transform: "rotate(90deg)",
  },
  "& .MuiAccordionSummary-content": {
    marginLeft: theme.spacing(1),
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: "1px solid rgba(0, 0, 0, .125)",
}));



export const CollapsAccordion = ({ title, children, sx = {}, defaultExpanded = false }: { title: string, children: any, sx?: any, defaultExpanded: boolean}) => {
    return (
      <Accordion defaultExpanded={defaultExpanded} >
        <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: "0.9rem" }} />} sx={sx}>
          <Typography>{title}</Typography>
        </MuiAccordionSummary>
        <AccordionDetails>
          {children}
        </AccordionDetails>
      </Accordion>
    );
  };


export const UnthemedCollapsAccordion = ({ title, children, sx = {}, defaultExpanded = false}: { title: string, children: any, sx?: any, defaultExpanded: boolean }) => {
    return (
      <MuiAccordion disableGutters elevation={0} square defaultExpanded={defaultExpanded} >
        <AccordionSummary sx={{padding: "0px", backgroundColor: "transparent", ...sx}}>
          <Typography>{title}</Typography>
        </AccordionSummary>
        
        <MuiAccordionDetails>
          {children}
        </MuiAccordionDetails>
      </MuiAccordion>
    );
  };
  