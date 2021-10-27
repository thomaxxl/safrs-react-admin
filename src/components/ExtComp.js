import {
    createRequires,
    createUseRemoteComponent
  } from "@paciolan/remote-component";
import { resolve } from "./remote-component.config.js";
import {get_Conf} from '../Config.js'

const requires = createRequires(resolve);
export const useRemoteComponent = createUseRemoteComponent({ requires });

const ext_comp_url = get_Conf().ext_comp_url//"https://raw.githubusercontent.com/Paciolan/remote-component/master/examples/remote-components/HelloWorld.js";

export const ExtComp = props => {
    const [loading, err, Component] = useRemoteComponent(ext_comp_url);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (err != null) {
        return <div>Unknown Error: {err.toString()}</div>;
    }

    return <Component {...props} tmp="hhh"/>;
};

// Call:<ExtComp name="Remote" {...props}/>
