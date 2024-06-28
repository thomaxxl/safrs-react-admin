import { Card, CardContent, CardHeader } from "@mui/material";
import { useConf } from "../Config";
import * as React from "react";

const Dashboard = () => {
  const config = useConf();

  return (
    <Card>
      <CardHeader title="Dashboard"></CardHeader>
      <CardContent>
        <ul>
          <li>
            <a href={JSON.stringify(config.api_root)}> API </a>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
