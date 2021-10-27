import config from './Config.json'

export const get_Conf = () => {

    let ls_conf = null
    const lsc_str = localStorage.getItem("raconf")
    try{
        ls_conf = JSON.parse(lsc_str)
    }
    catch(e){
        console.warn(`Failed to parse config ${lsc_str}`)
        localStorage.setItem("raconf", JSON.stringify(config))
    }

    let result = ls_conf ? ls_conf : JSON.parse(JSON.stringify(config)) || {};
    
    result.api_root = result?.api_root ? result.api_root : 'https://apilogicserver.pythonanywhere.com/'

    const resources = result.resources

    for(let [resource_name, resource] of Object.entries(resources||{})){
        
        // link relationship to FK column
        if(!(resource.columns instanceof Array || resource.relationships instanceof Array)){
            continue
        }

        resource.search = []
        result.resources[resource_name].name = resource_name

        for(let col of resource.columns){
            for(let rel of resource.relationships){
                for(let fk of rel.fks || []){
                    if(col.name == fk){
                        col.relationship = rel;
                        col.relationship.target_resource = result.resources[col.relationship.target]
                    }
                }
            }
            if(col.search){
                resource.search.push(col);
            }
        }
    }
    
    return result || reset_Conf()
}

export const reset_Conf = (reload) => {
    console.log("Resetting conf", config)
    localStorage.setItem("raconf", JSON.stringify(config));
    if(reload){
        window.location.reload()
    }
    return config
}

export const conf = get_Conf()

export default conf