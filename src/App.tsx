import * as React from "react";
import { gen_DynResourceCreate } from "./DynResource";
import {
  AdminContext,
  AdminUI,
  Loading,
  Resource,
  TranslationMessages,
  useDataProvider,
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

const messages: { [key: string]: TranslationMessages } = {
  en: englishMessages,
};
const i18nProvider = polyglotI18nProvider((locale) => messages[locale]);

const AsyncResources: React.FC = () => {
  const [resources, setResources] = React.useState<any[]>([]);
  const dataProvider = useDataProvider();
  const conf = useConf();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const admin_yaml = queryParams.get("admin_yaml");
  const loginPage = conf.authentication?.sso ? SSOLogin : LoginPage;

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

  if (resources.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <AdminUI
      ready={Loading}
      layout={Layout}
      // loginPage={loginPage}
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
  const dataProvider = jsonapiClient(conf.api_root, { conf: {} });
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  });

  if (document.location.href.includes("login_required=")) {
    // console.log(document.location.href);
    window.location.href = "/#/login?r=";
  }
  if (document.location.href.includes("session_state=")) {
    // console.log(document.location.href);
    window.location.href = "/#/Home";
  }
  return (
    <InfoToggleProvider>
      <AdminContext
        dataProvider={dataProvider}
        authProvider={conf.authentication ? authProvider : undefined}
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
