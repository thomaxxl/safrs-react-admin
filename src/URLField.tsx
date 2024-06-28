import { useRecordContext } from "react-admin";
import LaunchIcon from "@mui/icons-material/Launch";
import * as React from "react";


function MyURLField({ source }: any) {
  const record = useRecordContext();

  return record ? (
    <a href={"//" + record[source]} style={{ textDecoration: "none" }}>
    {record[source]}
    <LaunchIcon style={{ width: "0.5em", height: "0.5em", paddingLeft: 2 }}></LaunchIcon>
  </a>
  ) : null;
}

export default MyURLField;
