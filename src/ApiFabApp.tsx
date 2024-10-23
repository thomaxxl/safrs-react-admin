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
  CustomRoutes,
  useNotify
} from "react-admin";
import englishMessages from "ra-language-english";
import polyglotI18nProvider from "ra-i18n-polyglot";
import { jsonapiClient } from "./rav4-jsonapi-client/ra-jsonapi-client";
import { useConf, getProjectId } from "./Config";
import ConfigurationUI from "./components/ConfigurationUI";
import { Layout } from "./components/Layout";
import Home from "./components/Home";
import HomeIcon from "@mui/icons-material/Home";
import SettingsIcon from "@mui/icons-material/Settings";
import { authProvider as sraAuthProvider } from "./authprovider";
import { QueryClient } from "react-query";
import LoginPage from "./pages/LoginPage";
import gen_DynResourceList from "./components/DynList";
import { gen_DynResourceShow } from "./components/DynInstance";
import { gen_DynResourceEdit } from "./components/DynResourceEdit";
import { SraProvider } from "./SraToggleContext";
import Keycloak, { KeycloakConfig, KeycloakTokenParsed, KeycloakInitOptions } from "keycloak-js";
import { keycloakAuthProvider } from "ra-keycloak";
import { PaletteMode } from "@mui/material";
import { ThemeColorContext } from "./ThemeProvider";
import { deletePrefixedEntries } from './util';
import { Container, CircularProgress } from '@mui/material';
import { Route } from 'react-router-dom';
import { IterateProjectWGAI } from "./components/apifab/WebGenIterate";
import { ApiFabricLightTheme } from "./themes/ApiFabricTheme";

// Hook to detect new window or tab and reload the page
const useDetectNewWindowOrTab = () => {
  React.useEffect(() => {
    const hasReloaded = sessionStorage.getItem('hasReloaded');
    if (!hasReloaded) {
      localStorage.setItem("autoReload", "true");
      sessionStorage.setItem('hasReloaded', 'true');
      window.location.reload();
    }
  }, []);
};

const initOptions: KeycloakInitOptions = {
  onLoad: "login-required",
  checkLoginIframe: false,
};

// Function to get permissions from Keycloak token
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
const i18nProvider = polyglotI18nProvider((locale) => messages[locale], "en", { allowMissing: true });

// Loader component
const Loader = () => (
  <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </Container>
);

// Component to handle async resources
const AsyncResources = (keycloak: Keycloak) => { // todo: : React.FC 
  const [resources, setResources] = React.useState<any[]>([]);
  const conf = useConf();
  const notify = useNotify();
  const dataProvider = useDataProvider();

  React.useEffect(() => {
    dataProvider.getResources()
      .then((response: any) => {
        const res = Object.keys(response.data.resources).map((resource_name) => ({ name: resource_name }));
        setResources(res);
      })
      .catch((err: any) => {
        console.warn(err);
        setResources([]);
      });
  }, [dataProvider]);

  // if (resources.length === 0 || (conf.authentication?.keycloak && keycloak === undefined)) {
  //   if (!window.location.href.includes("load=") && localStorage.getItem("raconf") === "{}") {
  //     //return <div>Failed to Load Yaml </div>;
  //   }
  //   //return <div>Loading...</div>;
  // }

  if (typeof conf.api_root !== "string" && conf.api_root) {
    // if (window.location.href.includes("load=")) {
    //   console.log('rm raconf')
    //   localStorage.removeItem("raconf");
    //   window.location.href = `${window.location.origin}${window.location.pathname}`;
    // }
    notify("api_root must be string", { type: "error" });
  }
  
  const adminUIProps = conf.authentication?.keycloak !== undefined ? {} : { loginPage: LoginPage };

  return (
    <AdminUI
      ready={() => <Loading loadingPrimary="Loading..." loadingSecondary="Please wait" />}
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
              label: conf.resources[resource.name]?.label || resource.name,
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
      
      <Resource
        name="Configuration"
        show={ConfigurationUI}
        list={ConfigurationUI}
        options={{ label: "Configuration" }}
        icon={SettingsIcon}
      />
       <CustomRoutes>
      <Route path="/Iterate" element={<IterateProjectWGAI />} />
    </CustomRoutes>
    </AdminUI>
  );
};

// Main component
export const ApiFabApp: React.FC = () => {
  localStorage.setItem("minVersion", "0.0.5");
  React.useEffect(() => {
    const test_raconf = localStorage.getItem("raconf");
    if (test_raconf === "{}") {
      console.log('rm raconf')
      localStorage.removeItem("raconf");
      window.location.reload();
    }
  }, []);
  useDetectNewWindowOrTab(); // Hook to detect new window or tab
  const projectId = getProjectId(); // Get project ID
  const sidebarClosed = projectId == "" && document.location.origin.includes('apifabric.ai') && document.location.pathname.startsWith('/admin-app') ? false : true; // Set sidebar open based on project ID
  sessionStorage.setItem('sidebarOpen', sidebarClosed ? 'false' : 'true'); // hide the sidebar for the default app (cfr. Layout.tsx)
  console.log('AFsidebarClosed', sidebarClosed, '-', projectId , '-', document.location.origin.includes('apifabric.ai'), document.location.pathname.startsWith('/admin-app'));
  if(document.location.pathname == '/admin-app/index.html' || document.location.pathname == '/admin-app/index.html') {
    sessionStorage.setItem('sidebarOpen', 'false');
  }
  const { themeColor } = React.useContext(ThemeColorContext);
  const [loading, setLoading] = React.useState(true);
  
  // Memoized theme selection based on themeColor
  const theme = React.useMemo(() => {
    switch (themeColor) {
      case "nanoLightTheme":
        return nanoLightTheme;
      case "radiantLightTheme":
        return radiantLightTheme;
      case "houseLightTheme":
        return houseLightTheme;
      case "apiFabricLightTheme":
        return ApiFabricLightTheme;
      default:
        localStorage.setItem("ThemeColor", "default");
        //return defaultLightTheme;
        return ApiFabricLightTheme;
    }
  }, [themeColor]);

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
  
  // Function to get redirect URL
  const redirURL = (): string => {
    let result = document.location.origin + (document.location.href.includes("admin-app") ? "/admin-app/" : "/");
    result += `index.html${document.location.hash || "#/"}`;
    if (!result.endsWith("?")) {
      result += "?";
    }
    return result;
  };

  const authProvider = React.useRef<AuthProvider>(null);
  
  // Function to initialize Keycloak client
  const initKeyCloakClient = async (kcConfig: KeycloakConfig) => {
    const keycloakClient = keycloak ?? new Keycloak(kcConfig);
    initOptions.redirectUri = redirURL();

    const refreshTokenInterval = 900 * 1000;
    await keycloakClient.init(initOptions).then(authenticated => {
      if (!authenticated) {
        console.log('KC: Not authenticated');
        localStorage.removeItem('auth_token');
        //keycloakClient.login();
      }
      console.log('KC: authenticated');
      setInterval(async () => {
        await keycloakClient.updateToken(30).then(refreshed => {
          if (refreshed) {
            deletePrefixedEntries('kc-callback'); // Clear prefixed entries if token is refreshed
          } else {
            console.warn('Token not refreshed'); // Log warning if token is not refreshed
          }
        }).catch((e) => {
          console.warn('Failed to refresh token', e); // Log warning if token refresh fails
        })
      }, refreshTokenInterval) // Set interval for token refresh
      
    });

    authProvider.current = keycloakAuthProvider(keycloakClient, raKeycloakOptions); // Initialize auth provider with Keycloak
    dataProvider.current = jsonapiClient(conf.api_root, { conf: {} }, keycloakClient); // Initialize data provider with Keycloak
    setKeycloak(keycloakClient); // Set Keycloak client state
  };

  React.useEffect(() => {
    console.log('conf2', conf);
    if (conf.authentication?.keycloak && !keycloak) {
      const kcConfig: KeycloakConfig = conf.authentication?.keycloak!;
      console.log("kcConfig", kcConfig);
      initKeyCloakClient(kcConfig).finally(() => setLoading(false)); // Initialize Keycloak client if config is present
    } else if (conf.authentication?.endpoint) {
      dataProvider.current = jsonapiClient(conf.api_root, { conf: {} }, null); // Initialize data provider without Keycloak
      authProvider.current = sraAuthProvider; // Set custom auth provider
      setLoading(false); // Set loading to false
    } else if (conf.authentication?.endpoint && keycloak === undefined) {
      setLoading(true); // Set loading to true if endpoint is present but Keycloak is undefined
    } else if (conf && Object.keys(conf).length && !conf.authentication) {
      if (document.location.origin !== "https://apifabric.ai") {
        setLoading(false); // Set loading to false if no authentication is required
      }
    }
  }, [conf, keycloak]); // Dependency array for useEffect
  
  if (loading) {
    return <Loader />; // Show loader if loading is true
  }
  
  const authProvider_=conf.authentication ? authProvider.current : undefined
  return (
    <SraProvider>
      <AdminContext
        theme={theme}
        //darkTheme={darkTheme}
        defaultTheme={"light"}
        dataProvider={dataProvider}
        authProvider={authProvider_}
        queryClient={queryClient}
        i18nProvider={i18nProvider}
      >
        <AsyncResources />
      </AdminContext>
    </SraProvider>
  );
};