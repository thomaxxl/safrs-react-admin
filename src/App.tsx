import * as React from "react";
import { gen_DynResourceCreate } from "./DynResource";
import {
  AdminContext,
  AdminUI,
  Loading,
  Resource,
  TranslationMessages,
  useDataProvider,
  AuthProvider
} from "react-admin";
import englishMessages from "ra-language-english";
import polyglotI18nProvider from "ra-i18n-polyglot";
import { jsonapiClient } from "./rav4-jsonapi-client/ra-jsonapi-client";
import { useConf } from "./Config";
import ConfigurationUI from "./components/ConfigurationUI";
import { Layout } from "./components/Layout";
import Home from "./components/Home";
import HomeIcon from "@material-ui/icons/Home";
import SettingsIcon from "@material-ui/icons/Settings";
import authProvider from "./authprovider";
import { QueryClient } from "react-query";
import LoginPage from "./pages/LoginPage";
import SSOLogin from "./pages/SSOLogin";
import gen_DynResourceList from "./components/DynList";
import { gen_DynResourceShow } from "./components/DynInstance";
import { gen_DynResourceEdit } from "./components/DynResourceEdit";
import { InfoToggleProvider } from "./InfoToggleContext";
import { ApiShow } from "./components/ApiAdmin";
import { useLocation } from "react-router-dom";
import Keycloak, {
  KeycloakConfig,
  KeycloakTokenParsed,
  KeycloakInitOptions,
} from 'keycloak-js';
import { keycloakAuthProvider } from 'ra-keycloak';

const initOptions: KeycloakInitOptions = { onLoad: 'login-required', checkLoginIframe: false };

const getPermissions = (decoded: KeycloakTokenParsed) => {
  const roles = decoded?.realm_access?.roles;
  console.log(roles)
  if (!roles) {
      return false;
  }
  if (roles.includes('admin')) return 'admin';
  if (roles.includes('user')) return 'user';
  return 'admin';
};

const raKeycloakOptions = {
  onPermissions: getPermissions
};

const messages: { [key: string]: TranslationMessages } = {
  en: englishMessages,
};
const i18nProvider = polyglotI18nProvider((locale) => messages[locale]);

const AsyncResources: React.FC = (keycloak: Keycloak) => {

  const [resources, setResources] = React.useState<any[]>([]);
  const conf = useConf();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const admin_yaml = queryParams.get("admin_yaml");
  //const loginPage = conf.authentication?.sso ? SSOLogin : <LoginPage keycloak={keycloak}/>;
  const dataProvider = useDataProvider();
  React.useEffect(() => {
    dataProvider
      .getResources()
      .then((response: any) => {
        let res = Object.keys(response.data.resources).map((resource_name) => {
          return { name: resource_name };
        });
        setResources(res);
      })
      .catch((err: any) => {
        console.warn(err);
        setResources([]);
      });
  }, [dataProvider]);


  if (resources.length === 0 || keycloak === undefined){
    return <div>Loading...</div>;
  }

  return (
    <AdminUI
      ready={Loading}
      layout={Layout}
      //loginPage={loginPage}
      disableTelemetry
    >
      <Resource
        name="Home"
        show={Home}
        list={Home}
        options={{ label: "Home" }}
        icon={HomeIcon}
      />
      <Resource
        name="Configuration"
        show={ConfigurationUI}
        list={ConfigurationUI}
        options={{ label: "Configuration" }}
        icon={SettingsIcon}
      />

      {resources.map((resource: any) =>
        conf.resources && conf.resources[resource.name] ? (
          <Resource
            options={{
              label: (() => {
                if (
                  conf.resources[resource.name]?.label &&
                  conf.resources[resource.name].label !==
                    conf.resources[resource.name].name
                ) {
                  return conf.resources[resource.name].label;
                } else {
                  return resource.name;
                }
              })(),
            }}
            key={resource.name}
            list={gen_DynResourceList(conf.resources[resource.name])}
            create={gen_DynResourceCreate(conf.resources[resource.name])}
            edit={gen_DynResourceEdit(conf.resources[resource.name])}
            show={gen_DynResourceShow(conf.resources[resource.name])}
            name={encodeURI(resource.name)}
          />
        ) : null
      )}
    </AdminUI>
  );
};

const App: React.FC = () => {

  ConfigurationUI({});
  const conf = useConf();
  if (typeof conf.api_root !== "string") {
    throw new Error("api_root must be a string");
  }
  const [keycloak, setKeycloak] = React.useState<Keycloak>(undefined);
  const dataProvider = jsonapiClient(conf.api_root, { conf: {} }, keycloak);
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  });

  
  const redirURL = (): string => {

    let result = document.location.href.split('?')[0]
    if(! result.includes('#')){
      result+= '/#/'
    }
    result += '?'
    console.log('redirurl', result)
    return result
  }
  
  const authProvider = React.useRef<AuthProvider>(undefined);
  
  React.useEffect(() => {
      const initKeyCloakClient = async () => {
          const kcConfig: KeycloakConfig = conf.authentication?.keycloak
          const keycloakClient = new Keycloak(kcConfig);
          initOptions.redirectUri = redirURL()
          await keycloakClient.init(initOptions);
          authProvider.current = keycloakAuthProvider(
            keycloakClient,
            raKeycloakOptions
          );
          dataProvider.current = jsonapiClient(conf.api_root, { conf: {} }, keycloakClient);
          setKeycloak(keycloakClient);
      };
      if (conf.authentication?.keycloak && !keycloak) {
          initKeyCloakClient();
      }
  }, [keycloak]);

  
  return (
    <InfoToggleProvider>
      <AdminContext
        dataProvider={dataProvider}
        authProvider={conf.authentication ? authProvider.current : undefined}
        queryClient={queryClient}
        // locale="en"
        i18nProvider={i18nProvider}
      >
        <AsyncResources />
      </AdminContext>
    </InfoToggleProvider>
  );
};

export default App;
