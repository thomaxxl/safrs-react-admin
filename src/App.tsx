import * as React from "react";
import { gen_DynResourceCreate } from "./DynResource";
import {
  AdminContext,
  AdminUI,
  Loading,
  Resource,
  TranslationMessages,
  useDataProvider,
  AuthProvider,
  defaultTheme,
  houseLightTheme,
  radiantLightTheme,
  nanoLightTheme,
  defaultLightTheme,
} from "react-admin";
import { useNotify } from "react-admin";
import englishMessages from "ra-language-english";
import polyglotI18nProvider from "ra-i18n-polyglot";
import { jsonapiClient } from "./rav4-jsonapi-client/ra-jsonapi-client";
import { useConf, loadHomeConf } from "./Config";
import ConfigurationUI from "./components/ConfigurationUI";
import { Layout } from "./components/Layout";
import Home from "./components/Home";
import HomeIcon from "@mui/icons-material/Home";
import SettingsIcon from "@mui/icons-material/Settings";
import { authProvider as sraAuthPorvider } from "./authprovider";
import { QueryClient } from "react-query";
import LoginPage from "./pages/LoginPage";
import gen_DynResourceList from "./components/DynList";
import { gen_DynResourceShow } from "./components/DynInstance";
import { gen_DynResourceEdit } from "./components/DynResourceEdit";
import { SraProvider } from "./SraToggleContext";
import Keycloak, {
  KeycloakConfig,
  KeycloakTokenParsed,
  KeycloakInitOptions,
} from "keycloak-js";
import { keycloakAuthProvider } from "ra-keycloak";
import { PaletteMode } from "@mui/material";
import { ThemeColorContext } from "./ThemeProvider";
import { ApiFabApp } from './ApiFabApp';
//import { WebGenieApp } from "./WebGenieApp";
import { Web } from "@mui/icons-material";

const useDetectNewWindowOrTab = () => {
  React.useEffect(() => {
    const hasReloaded = sessionStorage.getItem('hasReloaded');

    if (!hasReloaded) {
      localStorage.setItem("autoReload","true")
      sessionStorage.setItem('hasReloaded', 'true');
      // Reload the page to refresh the application
      window.location.reload();
    }
  }, []);
};

const initOptions: KeycloakInitOptions = {
  onLoad: "login-required",
  checkLoginIframe: true
};

const getPermissions = (decoded: KeycloakTokenParsed) => {
  const roles = decoded?.realm_access?.roles;
  if (!roles) {
    return false;
  }
  if (roles.includes("admin")) return "admin";
  if (roles.includes("user")) return "user";
  return "admin";
};

const raKeycloakOptions = {
  onPermissions: getPermissions,
};

const messages: { [key: string]: TranslationMessages } = {
  en: englishMessages,
};
const i18nProvider = polyglotI18nProvider((locale) => messages[locale]);

const AsyncResources: React.FC = (keycloak: Keycloak) => {
  const [resources, setResources] = React.useState<any[]>([]);

  const conf = useConf();
  const notify = useNotify();

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

  if (
    resources.length === 0 ||
    (conf.authentication?.keycloak && keycloak === undefined)
  ) {
    if (!window.location.href.includes("load")) {
      if (localStorage.getItem("raconf") === "{}") {
        //return <div>Failed to Load Yaml </div>;
      }
    }
    //return <div>Loading...</div>;
  }

  if (typeof conf.api_root !== "string" && conf.api_root) {
    if (window.location.href.includes("load")) {
      localStorage.removeItem("raconf");
      window.location.href = window.location.href;
    }
    notify("api_root must be string", { type: "error" });
  }

  const adminUIProps =
    conf.authentication?.keycloak !== undefined ? {} : { loginPage: LoginPage };

  return <>
    <AdminUI
      ready={() => (
        <Loading loadingPrimary="Loading..." loadingSecondary="Please wait" />
      )}
      layout={Layout}
      disableTelemetry
      {...adminUIProps}
    >
      <Resource
        name="Home"
        show={Home}
        list={Home}
        options={{ label: "Home" }}
        icon={HomeIcon}
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
      
      {<Resource
        name="Configuration"
        show={ConfigurationUI}
        list={ConfigurationUI}
        options={{ label: "Configuration" }}
        icon={SettingsIcon}
      />}

    </AdminUI>
    
    </>
};

const DefaultApp: React.FC = () => {

  React.useEffect(() => {
    let test_raconf = localStorage.getItem("raconf")
    if (test_raconf === "{}") {
      localStorage.removeItem("raconf");
      window.location.reload();
    }
  },[]);

  useDetectNewWindowOrTab();
  let { themeColor } = React.useContext(ThemeColorContext);
  const [loading, setLoading] = React.useState(false);
  const ThemeColor = localStorage.getItem("ThemeColor");
  let theme;

  if (themeColor === "nanoLightTheme") {
    theme = nanoLightTheme;
  } else if (themeColor === "radiantLightTheme") {
    theme = radiantLightTheme;
  } else if (themeColor === "houseLightTheme") {
    theme = houseLightTheme;
  } else if (themeColor === null) {
    localStorage.setItem("ThemeColor", "defalut");
    theme = defaultLightTheme;
  }

  ConfigurationUI({});
  const conf = useConf();
  const darkTheme = {
    ...defaultTheme,
    palette: { mode: "dark" as PaletteMode },
  };

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
    let result;
    if (document.location.href.includes("admin-app")) {
      result = document.location.origin + "/admin-app/";
    } else {
      result = document.location.origin + "/";
    }

    result += `index.html${document.location.hash || "#/"}`;
    if (!result.endsWith("?")) {
      result += "?";
    }
    return result;
  };

  const authProvider = React.useRef<AuthProvider>(undefined);

  const initKeyCloakClient = async () => {
    const kcConfig: KeycloakConfig = conf.authentication?.keycloak;
    const keycloakClient = new Keycloak(kcConfig);
    initOptions.redirectUri = redirURL(); // kc redirect url

    const refreshTokenInterval = 900 * 1000;  // refresh token every 900 seconds
    await keycloakClient.init(initOptions).then( authenticated => {
      setInterval(() => {
        const keycloakClient = new Keycloak(kcConfig);
        keycloakClient.updateToken(30).then(refreshed => {
            if (refreshed) {
            } else {
                console.warn('Token not refreshed');
            }
        }).catch((e) => {
            console.error('Failed to refresh token',keycloakClient, e);
        });
    }, refreshTokenInterval);
    })

    authProvider.current = keycloakAuthProvider(
      keycloakClient,
      raKeycloakOptions
    );
    dataProvider.current = jsonapiClient(
      conf.api_root,
      { conf: {} },
      keycloakClient
    );
    setKeycloak(keycloakClient);
  };
  
  /*if (document.location.hash.includes("Home")) {
  } else */
  if (conf.authentication?.keycloak && !keycloak) {
    setLoading(true);
    initKeyCloakClient().finally(() => setLoading(false));
  } else if (conf.authentication?.endpoint) {
    dataProvider.current = jsonapiClient(conf.api_root, { conf: {} }, null);
    authProvider.current = sraAuthPorvider;
  }

  if(loading){
    return <Loading loadingPrimary="Loading..." loadingSecondary="Please wait" />;
  }

  return (
    <SraProvider>
      <AdminContext
        theme={theme}
        /*darkTheme={darkTheme}*/
        defaultTheme={"light"}
        dataProvider={dataProvider}
        authProvider={conf.authentication ? authProvider.current : undefined}
        queryClient={queryClient}
        // locale="en"
        i18nProvider={i18nProvider}
      >
        <AsyncResources />
      </AdminContext>
    </SraProvider>
  );
};

const App: React.FC = () => {
  const [loading, setLoading] = React.useState(true);
  const [conf, setConf] = React.useState<any>({});
  
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setConf(await loadHomeConf())
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <Loading loadingPrimary="Loading..." loadingSecondary="Please wait" />;
  }  
  console.log("AppConf: ", conf);
  if(['https://apifabric.ai','http://localhost:3000'].includes(document.location.origin)){
    if(localStorage.getItem("infoswitch") !== "false"){
      sessionStorage.setItem("infoswitch", "true")
    }
  }
  if(document.location.href.startsWith('https://apifabric.ai/01') || document.location.pathname.startsWith('/01')){
    sessionStorage.setItem('sidebarOpen','true');
  }
  
  if(conf.settings?.Home === "WebGenie"){
    // webgenie container home page
    console.log('loading ApiFabApp/WebGenie 0')
    //return <WebGenieApp />
  }

  if(conf.settings?.Home === "ApiFab"){
    // apifabric.ai home page
    console.log('loading ApiFabApp/WebGenie 1')
    return <ApiFabApp />
  }
  
  return <><DefaultApp /></>
}
export default App;
