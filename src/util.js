import { get_Conf } from "./Config";
import {Pagination }  from 'react-admin'
import loadable from '@loadable/component'

const conf = get_Conf();

export const type2resource = (type) => {
    for(let [resource_name, resource] of Object.entries(conf?.resources)){
        if(resource.type === type){
            return resource_name
        }
    }
    console.warn(`No resource for type "${type}`)
    return conf[type]
};


export const DynPagination = (props) => {
    return <Pagination rowsPerPageOptions={[10, 25, 50, 100]}
                perPage={props.perPage || 25 }
                {...props} />
}


export const load_custom_component = (component_name, item) => {

    try{
        const LabelComponent = loadable(() => import(`./components/Custom.js`), {
            resolveComponent: (components) => components[`${component_name}`],
        })
        return <LabelComponent instance={item} />
    }
    catch(e){
        alert("Custom component error")
        console.error("Custom component error", e)
    }
    return null
}


