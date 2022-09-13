

const yaml = require('js-yaml')
const str = window.location.href
const arr=str.split("/")
const index = arr.findIndex(e=>e==="admin")
const yamlName = arr[index+1]??"admin"

let als_yaml_url = `/ui/admin/${yamlName}.yaml`
if(window.location.href.includes(":3000")){
    als_yaml_url = `http://localhost:5656/ui/admin/${yamlName}.yaml`
}
 


const addConf = (conf) => {
    console.log(conf)
    const configs = JSON.parse(localStorage.getItem("raconfigs"));
    if(!conf.api_root){
        console.warn("Config has no api_root", conf);
        return false
    }
    configs[conf.api_root] = conf
    localStorage.setItem("raconf", JSON.stringify(conf));
    localStorage.setItem("raconfigs", JSON.stringify(configs));
    window.location.reload();
    return true
}


 const LoadYaml = (config_url, notify) => {
    
    if(config_url == null){
        config_url = als_yaml_url
    }
    
    const saveConf = (conf_str) => {
        // first try to parse as json, if this doesn't work, try yaml
        try{
            const conf = JSON.parse(conf_str)
            if(typeof r !== 'object'){
                saveYaml(conf_str)
                return
            }
            if( ! addConf(conf) && notify){
                notify('Failed to load config', 'warning')
            }
        }
        catch(e){
            saveYaml(conf_str)
        }
    }

    const saveYaml = (ystr) => {
        
        try{
            const conf = yaml.load(ystr)
            if( ! addConf(conf) && notify){
                notify('Failed to load config', 'warning')
            }
        }
        catch(e){
            console.warn(`Failed to load yaml`, ystr)
            console.error(e)
        }
    }

    fetch(config_url, {cache: "no-store"})
        .then((response) => response.text())
        .then((conf_str) => {
            saveConf(conf_str)
            notify("Loaded configuration")
        })
        .catch((err)=>{
                if(notify){
                        notify("Failed to load yaml", { type : 'warning' })
                }
                console.error(`Failed to load yaml from ${config_url}: ${err}`)
        })
    
}

export default LoadYaml

