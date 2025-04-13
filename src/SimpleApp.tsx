import { Admin, Resource, ListGuesser, EditGuesser, ShowGuesser } from 'react-admin';
import { jsonapiClient } from "./rav4-jsonapi-client/ra-jsonapi-client";
import { useConf, loadHomeConf } from "./Config";
import { SimpleList } from "./components/DynList";
import gen_DynResourceList from "./components/DynList";

export const App = () => {
    const conf = useConf();
    const dataProvider = jsonapiClient(conf.api_root, { conf: {} }, null);
    if(!conf.resources){
      return <div>Loading...</div>
    }
    return <Admin dataProvider={dataProvider}>
      <Resource name="Project" list={gen_DynResourceList(conf.resources['Project'])} />
    </Admin>
}

export default App;