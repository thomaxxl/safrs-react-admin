import { Layout as RALayout } from "react-admin";
import { Menu, CustomAppBar } from "./Menu";

export const Layout = (props: any) => {
  return <RALayout {...props} menu={Menu} appBar={CustomAppBar} />;
};
