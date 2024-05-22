import config from "./Config.json";

interface Config {
  api_root: object;
  authentication?: {
    kc_url: string;
    endpoint: string;
    redirect: any;
    sso: any;
  };
  resources?: Record<string, any>;
  settings?: {
    locale?: string;
    max_list_columns?: number;
    HomeJS?: string;
    Home?: string;
  };
  ext_comp_url: any;
}

const init_Conf = (): void => {
  if (!("raconf" in localStorage)) {
    // console.log("Init Configuration");
    localStorage.setItem("raconf", JSON.stringify(config));
    window.location.reload();
  }
};

const getBrowserLocales = (
  options: { languageCodeOnly?: boolean } = {}
): string[] | undefined => {
  const defaultOptions = {
    languageCodeOnly: false,
  };
  const opt = {
    ...defaultOptions,
    ...options,
  };
  const browserLocales =
    navigator.languages === undefined
      ? [navigator.language]
      : navigator.languages;
  if (!browserLocales) {
    return undefined;
  }
  return browserLocales.map((locale) => {
    const trimmedLocale = locale.trim();
    return opt.languageCodeOnly ? trimmedLocale.split(/-|_/)[0] : trimmedLocale;
  });
};

export const getLSConf = (): Config => {
  let result: Config = JSON.parse(JSON.stringify(config));
  const lsc_str = localStorage.getItem("raconf");
  let ls_conf: Config | null = null;
  try {
    ls_conf = JSON.parse(lsc_str || "");
    result = ls_conf ? ls_conf : result;
  } catch (e) {
    console.warn(`Failed to parse config ${lsc_str}`);
    localStorage.setItem("raconf", JSON.stringify(config));
  }
  return result;
};

const json2Conf = (conf: Config) => {
  let result = conf;
  if (!result.resources) {
    result.resources = {};
  }
  if (!result.settings) {
    result.settings = {};
  }
  const resources = result.resources;

  for (let [resource_name, resource] of Object.entries(resources || {})) {
    resource.relationships = resource.relationships || [];
    if (resource.tab_groups instanceof Array) {
      for (let tg of resource.tab_groups) {
        if (!tg.direction) {
          continue;
        }
        tg.target = tg.resource;
        resource.relationships.push(tg);
      }
      //resource.relationships = resource.relationships.concat(resource.tab_groups)
    } else {
      // dict: deprecated soon
      for (let [tab_group_name, tab_group] of Object.entries(
        resource.tab_groups || {}
      )) {
        resource.relationships.push(
          Object.assign({}, tab_group as any, {
            name: tab_group_name,
            target: (tab_group as any).resource,
          })
        );
      }
    }
    // link relationship to FK column
    if (
      !(
        resource.attributes instanceof Array ||
        resource.relationships instanceof Array
      )
    ) {
      continue;
    }

    if (!resource.type) {
      resource.type = resource_name;
    }

    resource.search_cols = [];
    resource.sort_attr_names = [];
    result.resources[resource_name].name = resource_name;
    let attributes = resource.attributes || [];

    for (let attr of attributes) {
      if (!(attr.constructor === Object)) {
        console.warn(`Invalid attribute ${attr}`);
        continue;
      }
      for (let rel of resource.relationships || []) {
        for (let fk of rel.fks || []) {
          if (attr.name === fk) {
            attr.relationship = rel;
            attr.relationship.target_resource =
              result.resources[attr.relationship.target] ||
              result.resources[attr.relationship.resource];
          }
        }
      }
      if (attr.search) {
        resource.search_cols.push(attr);
      }
      if (attr.sort) {
        if (attr.sort === "DESC") {
          resource.sort_attr_names.push("-" + attr.name);
        } else {
          resource.sort_attr_names.push(attr.name);
        }
        resource.sort = resource.sort_attr_names.join(",");
      }
      if (!attr.label) {
        attr.label =
          attr.relationship?.resource ||
          attr.name?.replace(/([A-Z])/g, " $1").replace(/(_)/g, " "); // split camelcase/snakecase
      }
      attr.resource = resource;
    }
    if (resource.search_cols.length === 0) {
      resource.search_cols = attributes.filter(
        (col: any) =>
          col.name !== false &&
          (col.name === "id" ||
            col.name === resource.user_key ||
            col.name === "name")
      );
    }
    resource.max_list_columns =
      resource.max_list_columns || result.settings?.max_list_columns || 8;
    //resource.label = resource.name?.replace(/([A-Z])/g, " $1").replace(/(_)/g, " ") // split camelcase/snakecase
    //console.debug(`Loaded config resource ${resource_name}`, resource)
  }

  if (result.settings) {
    result.settings.locale =
      result.settings.locale || getBrowserLocales()?.[0] || "fr-FR";
  }
  return result || reset_Conf(true); // Add the argument 'true' to the reset_Conf() function call
};

export const useConf = (): Config => {
  let conf = getLSConf();
  return json2Conf(conf);
};

export const getConf = (): Config => {
  init_Conf();
  return json2Conf(getLSConf());
};

export const reset_Conf = (reload: boolean) => {
  const configs: any = {};
  // console.log("Resetting conf", config);
  localStorage.setItem("raconf", JSON.stringify(config));
  configs[config.api_root] = config;
  //configs[als_config.api_root] = als_config

  localStorage.setItem("raconfigs", JSON.stringify(configs));

  if (reload) {
    window.location.reload();
  }
  return config;
};

export const default_configs = [config];

export const getKcUrl = (): string | undefined => {
  const conf: any = localStorage.getItem("raconf");
  let authentication;
  try {
    authentication = JSON.parse(conf).authentication;
  } catch (e) {
    console.warn("conf.authentication error");
  }
  if (!authentication?.kc_url) {
    // console.log("No authentication.kc_url in config");
    return undefined;
  }
  return authentication?.kc_url;
};
