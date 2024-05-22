import { Layout as RALayout } from "react-admin";
import { Menu, CustomAppBar } from "./Menu";

export const Layout = (props: any) => (
  <RALayout {...props} menu={Menu} appBar={CustomAppBar} />
);
