import config from './Config.json'
import als_config from './Config.als.json'

const init_Conf = () => {
    if(! "raconf" in localStorage){
        console.log("Init Configuration")
        localStorage.setItem("raconf",JSON.stringify(config))
        window.location.reload()
    }
}

const getBrowserLocales = (options = {}) => {
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
    return browserLocales.map(locale => {
      const trimmedLocale = locale.trim();
      return opt.languageCodeOnly
        ? trimmedLocale.split(/-|_/)[0]
        : trimmedLocale;
    });
  }

export const get_Conf = () => {

    init_Conf();

    let ls_conf = null
    let result = {}
    const lsc_str = localStorage.getItem("raconf")
    try{
        ls_conf = JSON.parse(lsc_str)
        result = ls_conf ? ls_conf : JSON.parse(JSON.stringify(config)) || {};
        Object.entries(result.resources)
    }
    catch(e){
        console.warn(`Failed to parse config ${lsc_str}`)
        localStorage.setItem("raconf", JSON.stringify(config))
    }

    if(!result.resources){
        result.resources = {}
    }
    const resources = result.resources

    for(let [resource_name, resource] of Object.entries(resources||{})){
        resource.relationships = resource.relationships || []
        if(resource.tab_groups instanceof Array){
            for(let tg of resource.tab_groups){
                tg.target = tg.resource
            }
            resource.relationships = resource.relationships.concat(resource.tab_groups)
        }
        else {
            // dict: deprecated soon
            for(let [tab_group_name, tab_group] of Object.entries(resource.tab_groups || {}) ){
                resource.relationships.push(Object.assign(tab_group, {name: tab_group_name, target: tab_group.resource}))
            }
        }
        // link relationship to FK column
        if(!(resource.attributes instanceof Array || resource.relationships instanceof Array)){
            continue
        }

        if(!resource.type){
            resource.type = resource_name
        }

        resource.search_cols = []
        resource.sort_attr_names = []
        result.resources[resource_name].name = resource_name
        let attributes = resource.attributes || []

        for(let attr of attributes){
            if(!(attr.constructor == Object)){
                console.warn(`Invalid attribute ${attr}`)
                continue
            }
            for(let rel of resource.relationships || []){
                for(let fk of rel.fks || []){
                    if(attr.name == fk){
                        attr.relationship = rel;
                        attr.relationship.target_resource = result.resources[attr.relationship.target]
                    }
                }
            }
            if(attr.search){
                resource.search_cols.push(attr);
            }
            if(attr.sort){
                resource.sort_attr_names.push(attr.name)
                resource.sort = resource.sort_attr_names.join(',')
            }
            if(!attr.label){
                attr.label = attr.name?.replace(/([A-Z])/g, " $1") // split camelcase
            }
        }
        
        resource.max_list_columns = resource.max_list_columns || result.settings?.max_list_columns || 8
        console.debug(`Loaded config resource ${resource_name}`, resource)
    }
    
    if(result.settings){
        result.settings.locale = result.settings.locale || getBrowserLocales()[0] || "fr-FR"
    }
    return result || reset_Conf()
}

export const reset_Conf = (reload) => {
    const configs = {}
    console.log("Resetting conf", config)
    localStorage.setItem("raconf", JSON.stringify(config));
    //configs[config.api_root] = config
    //configs[als_config.api_root] = als_config
    
    localStorage.setItem("raconfigs", JSON.stringify(configs));

    if(reload){
        window.location.reload()
    }
    return config
}

export const default_configs = [als_config, config];

export const conf = get_Conf()

export default conf