import { useState, useEffect, Fragment } from "react";
import { Typography, Button, Link } from "@mui/material";
import { useTranslate } from 'react-admin';

const logStyle = {
  fontSize: "0.9em",
  fontFamily: "monospace",
  color: "black",
};

const ProjectLog = ({ project }: { project: any }) => {
  const translate = useTranslate();
  const [showAll, setShowAll] = useState(false);
  const logLines = project.log.split("\n");
  const initialLines = logLines.slice(0, 12).join("\n");
  const remainingLines = logLines.slice(12).join("\n");

  const handleShowMore = () => {
    setShowAll(true);
  };

  return <>
        <Typography variant="body2" color="textSecondary" component="p">
            {translate("wg.show.log_summary")}
        </Typography>
        <Typography variant="body2" color="textSecondary" component="div">
        <pre style={logStyle}>
            {showAll ? project.log : initialLines}
            {!showAll && logLines.length > 12 && (
            <span>
                {"\n"}...<Button onClick={handleShowMore} size="small">Show More</Button>
            </span>
            )}
        </pre>
        </Typography>
        <Link href={`${document.location.origin}/${project.id}/logs/`} component="a" variant="body2">
        {translate("wg.show.log_files")}
        </Link>
    </>
};

export default ProjectLog;