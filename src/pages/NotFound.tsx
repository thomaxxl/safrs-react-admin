import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { Title } from "react-admin";
import * as React from "react";

const myFun = () => (
  <Card>
    <Title title="Not Found" />
    <CardContent>
      <h1>404: Page not found</h1>
    </CardContent>
  </Card>
);
export default myFun;
