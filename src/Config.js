import config from './Config.json'

const get_Conf = () => {

    const ls_conf = JSON.parse(localStorage.getItem("raconf"))
    let result = ls_conf ? ls_conf : config
    //result.api_root = result.api_root ? result.api_root : 'http://192.168.109.131:5000' // 'https://apilogicserver.pythonanywhere.com/'
    result.api_root = result.api_root ? result.api_root : 'https://apilogicserver.pythonanywhere.com/'
    result.api_root = 'https://apilogicserver.pythonanywhere.com/'
    
    for(let [resource_name, resource] of Object.entries(result)){
        
        // link relationship to FK column
        if(!(resource.columns instanceof Array || resource.relationships instanceof Array)){
            continue
        }

        resource.search = []
        result[resource_name].name = resource_name

        for(let col of resource.columns){
            for(let rel of resource.relationships){
                for(let fk of rel.fks || []){
                    if(col.name == fk){
                        col.relationship = rel;
                        col.relationship.target_resource = result[col.relationship.target]
                    }
                }
            }
            if(col.search){
                resource.search.push(col);
            }
        }
    }
    return result
}

export default get_Conf()