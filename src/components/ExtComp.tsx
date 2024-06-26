import * as React from "react";
import {
  createRequires,
  createUseRemoteComponent,
} from "@paciolan/remote-component";
import { resolve } from "./remote-component.config";

import { useConf } from "../Config";

const requires = createRequires(resolve);
export const useRemoteComponent = createUseRemoteComponent({ requires });

const ext_comp_url = useConf().ext_comp_url; //"https://raw.githubusercontent.com/Paciolan/remote-component/master/examples/remote-components/HelloWorld.js";

export const ExtComp = (props: any) => {
  const [loading, err, Component] = useRemoteComponent(ext_comp_url);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (err != null) {
    return <div>Unknown Error: {err.toString()}</div>;
  }

  return <Component {...props} tmp="hhh" />;
};

// Call:<ExtComp name="Remote" {...props}/>
