import * as React from "react";
import { gen_DynResourceCreate } from "./DynResource";
import {
  AdminContext,
  AdminUI,
  Loading,
  Resource,
  Title,
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
import { useConf } from "./Config";
import ConfigurationUI from "./components/ConfigurationUI";
import { Layout } from "./components/Layout";
import Home from "./components/Home";
import HomeIcon from "@material-ui/icons/Home";
import SettingsIcon from "@material-ui/icons/Settings";
import { authProvider as sraAuthPorvider } from "./authprovider";
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
} from "keycloak-js";
import { keycloakAuthProvider } from "ra-keycloak";
import { PaletteMode, createTheme, useMediaQuery } from "@mui/material";
import { IconButton, Tooltip, ThemeProvider } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { Menu, MyAppBar } from "./components/Menu";
import { ThemeColorContext, ThemeColorProvider } from "./ThemeProvider";

const initOptions: KeycloakInitOptions = {
  onLoad: "login-required",
  checkLoginIframe: false,
};

const getPermissions = (decoded: KeycloakTokenParsed) => {
  const roles = decoded?.realm_access?.roles;
  console.log(roles);
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
  console.log("AsyncResources conf: ", conf);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const admin_yaml = queryParams.get("admin_yaml");
  // const loginPage = conf.authentication?.sso ? SSOLogin : <LoginPage keycloak={keycloak}/>
  const dataProvider = useDataProvider();
  React.useEffect(() => {
    dataProvider
      .getResources()
      .then((response: any) => {
        console.log("response: ", response);
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

  if (resources.length === 0 || keycloak === undefined) {
    if (!window.location.href.includes("load")) {
      if (localStorage.getItem("raconf") === "{}") {
        return <div>Failed to Load Yaml </div>;
      }
    }

    return <div>Loading...</div>;
  }

  if (typeof conf.api_root !== "string" && conf.api_root) {
    if (window.location.href.includes("load")) {
      localStorage.removeItem("raconf");
      window.location.href = window.location.href;
    }
    notify("api_root must be string", { type: "error" });
    console.log("window.location.href: ", window.location.href);
    // let value = window.location.href.split("/");
    // if (!window.location.href.includes("load")) {
    //   window.location.reload();
    // }
  }

  return (
    <AdminUI
      ready={() => (
        <Loading loadingPrimary="Loading..." loadingSecondary="Please wait" />
      )}
      layout={Layout}
      // loginPage={LoginPage}
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
  const { themeColor } = React.useContext(ThemeColorContext);
  const [loading, setLoading] = React.useState(false);

  const ThemeColor = localStorage.getItem("ThemeColor");
  console.log("themeColor: ", themeColor);
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
  console.log("queryClient: ", queryClient);

  const redirURL = (): string => {
    let result = document.location.href.split("?")[0];
    if (!result.includes("#")) {
      result += "/#/";
    }
    result += "?";
    console.log("redirurl", result);
    return result;
  };

  const authProvider = React.useRef<AuthProvider>(undefined);

  const initKeyCloakClient = async () => {
    const kcConfig: KeycloakConfig = conf.authentication?.keycloak;
    const keycloakClient = new Keycloak(kcConfig);
    initOptions.redirectUri = redirURL();
    await keycloakClient.init(initOptions);

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

  React.useEffect(() => {
   
    if (conf.authentication?.keycloak && !keycloak) {
      initKeyCloakClient();
    } else if (conf.authentication?.endpoint) {
      authProvider.current = sraAuthPorvider;
    }
  }, []);

  return (
    <InfoToggleProvider>
      <AdminContext
        theme={theme}
        darkTheme={darkTheme}
        defaultTheme={"light"}
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
