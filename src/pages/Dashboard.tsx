import { Card, CardContent, CardHeader } from "@material-ui/core";
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
