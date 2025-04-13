import { stringify } from 'query-string';
import { fetchUtils, DataProvider, HttpError } from 'react-admin';
import merge from 'deepmerge';
import { defaultSettings } from './default-settings';
import ResourceLookup from './resourceLookup';
import Keycloak from 'keycloak-js';
import {getConf} from '../Config'
import {GetOneParams, GetListParams, GetManyParams, UpdateParams, UpdateManyParams} from 'react-admin';
import {IJSONAPIResource} from './interfaces';
import { httpAuthClient, createKCHttpAuthClient } from './authClient';
export { httpAuthClient } from './authClient';

if(typeof window?.location === 'undefined'){
    // cli testing
    require('../globals');
}

const conf : { [ key: string] : any } = getConf();
const duration = 3000;

const prepareListQuery = (resource_name: string, params: GetListParams) => {
    /*
        Prepare the query for the list request.
        using the resource configuration and the react-admin params
    */
    const { page, perPage } = params.pagination || { page: 1, perPage: 10 };
    const resource_conf : any = conf.resources[resource_name];
    const sort : string = resource_conf.sort
    // Create query with pagination params.
    const query : {[k: string]: any} = {
        'page[number]': page,
        'page[size]': perPage,
        'page[offset]': (page - 1) * perPage,
        'page[limit]': perPage
    };

    // Add all filter params to query.
    if(params.filter?.q && resource_conf){
        /*
            Search is requested
            Construct a jsonapi filter from the search_cols
        */
        const search_cols = resource_conf.search_cols
        const filter = search_cols?.map((col: any) => {
                            return { 
                                "name":col.name,
                                "op": col.op? col.op : "ilike",
                                "val": col.val ? col.val.format(params.filter.q) : `%${params.filter.q}%`
                            };}) || ""
        if(filter){
            query['filter'] = JSON.stringify(filter)
        }
    }
    else{
        Object.keys(params.filter || {}).forEach((key) => {
            query[`filter[${key}]`] = params.filter[key];
        });
    }

    /*
        Add sort parameter, first check the default configured sorting, then the customized sort
        default sort, from the resource configuration, or "id" if not provided
    */
    query.sort = sort ? sort : "id"
    if (params.sort && params.sort.field) {
        // sort provided by the caller
        const prefix = params.sort.order?.toLowerCase() === 'desc' ? '-' : ''; // <> ASC
        query.sort = `${prefix}${params.sort.field}`;
    }
    
    const rel_conf = conf.resources[resource_name].relationships || []
    // we only need "toone" rels in order to display the join/user key
    const includes: string[] = rel_conf.filter((rel : any) => rel.direction !== 'tomany').map((rel : any) => rel.name);
    if(params.meta?.include?.length){
        includes.push(...params.meta.include)
    }
    query['include'] = includes.join(',');
    return query
}

const prepareQueryFilter = (query: any, ids : any, fks : any) => {
  if(ids.length === fks.length){
    for(let i = 0; i<fks.length; i++){
      let fk = fks[i]
      let id = ids[i]
      query[`filter[${fk}]`] = id
    }
  }
  else{
    // fk probably contains an underscore
    // todo: how to fix???
    console.warn("Wrong FK length.. ", ids, fks)
    query[`filter[${fks[0]}]`] = ids && ids.length ? ids[0] : ""
  }
}

const collectionResponse2Data = (json: any, settings: any) => {
    /*
        Convert a jsonapi collection response to a react-admin data response
    */

    // When meta data and the 'total' setting is returned then set the total count.
    let total = 0;
    if (json.meta && settings.total) {
        total = json.meta[settings.total];
    }
    // Use the length of the data array as a fallback.
    total = total || json.data.length;
    const lookup = new ResourceLookup(json);
    const jsonData = json.data.map((item: IJSONAPIResource) =>{
        return lookup.unwrapData(item)
        }
    );
    // tanstack cache validUntil
    const validUntil = new Date();
    validUntil.setTime(validUntil.getTime() + duration);
    
    return {
        data: jsonData,
        included: json.included,
        validUntil : validUntil,
        total: total
    };
}

const prepareAttributes = (attributes : any, resource_en : any) => {
    /*
        convert all numbers to string to allow FK lookups (jsonapi ids are strings, while FKs may be numbers :/)
    */
    const resource = decodeURI(resource_en)
    const resource_attr_rels = conf.resources[resource].attributes?.map( (attr : any) => attr.relationship ? attr.name : null)    
    const m_attrs = Object.assign({}, attributes)
    for(let [k, v] of Object.entries(attributes)){
      m_attrs[k] = v
      if(typeof v === 'number' && resource_attr_rels.find((n: string) => n === k)){
        m_attrs[k] = v.toString();
      }
    }
    return m_attrs
}


/**
 * Based on
 * 
 * https://github.com/marmelab/react-admin/blob/master/packages/ra-data-simple-rest/src/index.ts
 * @see https://github.com/marmelab/FakeRest
 * 
 */
export const jsonapiClient = (
        apiUrl: string,
        userSettings = {conf : {}},
        keycloak: Keycloak| null = null,
        httpClient = httpAuthClient,//fetchUtils.fetchJson,
        countHeader: string = 'Content-Range',
    ): DataProvider => {
    if(keycloak?.isTokenExpired()){
        keycloak.login();
    }
    if(keycloak){
        httpClient = createKCHttpAuthClient(keycloak)
    }
    const settings = merge(defaultSettings, userSettings);

    return {

    /*******************************************************************************************
    * getOne : get a single resource from the jsonapi endpoint (GET /resource/id)
    ********************************************************************************************/
    getOne: (resource: string, params: GetOneParams) => {
        if(params.id === null || params.id === undefined){
            console.warn(`Invalid params.id: '${params.id}'`)
            return new Promise(()=>{return {data: {}}})
        }
        const resource_name = decodeURI(resource)
        const resource_conf = conf["resources"][resource_name];
        const query : {[k: string]: any} = {
            'include' : [],
            'page[limit]': 2
        };
        if(!resource_conf){
            console.warn(`Invalid resource ${resource_name}`)
            return new Promise(()=>{});
        }
        
        const rel_conf = resource_conf?.relationships || [];
        const includes: string[] = rel_conf.map((rel : any) => rel.name)
        if(params.meta?.include?.length){
            includes.push(...params.meta.include)
        }
        query['include'] = includes.join(',');

        const url = `${apiUrl}/${resource_name}/${params.id}?${stringify(query)}`; // we only need 1 include at most, use useGetManyReference for more
        
        return httpClient(url, {}).then(({ json }) => {

            let { id, attributes, relationships, type } = json.data;
            if(id === undefined){
                return {data:{}}
            }
            Object.assign(attributes, relationships, {type: type}, {relationships: relationships}, {attributes: {...attributes} });
            attributes = prepareAttributes(attributes, resource_name)
            const validUntil = new Date();
            validUntil.setTime(validUntil.getTime() + duration);
            return {
            data: {
                id,
                validUntil : validUntil,
                ...attributes
            }
            };
        });
    },

    /*******************************************************************************************
     * getList: get a collection of resources from the jsonapi endpoint (GET /resource?...)
     *******************************************************************************************/
    getList: (resource: string, params: GetListParams) => {
        
        const resource_name = decodeURI(resource);
        const query = prepareListQuery(resource, params);
        const url = new URL(`${apiUrl}/${resource_name}`);
        
        url.search = stringify(query);
        
        return httpClient(url.toString(), {})
            .then(({ json }) => {
                const response = collectionResponse2Data(json, settings)
                return response
            })
            .catch((err: HttpError) => {
                console.warn('getList Error', err, err.body, err.status);
                const errorHandler = settings.errorHandler;
                return Promise.reject(errorHandler(err));
            });
    },
    
    /*******************************************************************************************
    * getMany: get a collection of resources specified by their ids (GET /resource?filter[id]=...)
    ********************************************************************************************/
    getMany: (resource: string, params: GetManyParams) => {
     
        const resource_name = decodeURI(resource);
        const query = prepareListQuery(resource, params);
        const url = new URL(`${apiUrl}/${resource_name}`);
        
        query['filter[id]'] = params.ids instanceof Array ? params.ids.join(',') : params.ids
        url.search = stringify(query);
        
        return httpClient(url.toString(), {})
            .then(({ json }) => {
                const response = collectionResponse2Data(json, settings)
                return response
            })
            .catch((err: HttpError) => {
                console.warn('getMany Error', err, err.body, err.status);
                const errorHandler = settings.errorHandler;
                return Promise.reject(errorHandler(err));
            });
    },

    /*******************************************************************************************
      getManyReference
    ********************************************************************************************/
    getManyReference: (resource, params : any) => {
        console.log('getManyReference', resource, params)
        const resource_name = decodeURI(resource)
        const resource_conf = conf["resources"][resource_name];
        const { page, perPage } = params.pagination;
        const { field, order } = params.sort;
        const query: {[k: string]: any} = { };
        
        if (field) {
            const prefix = order === 'DESC' ? '-' : ''; // <> ASC
            query.sort = `${prefix}${field}`;
        }

        if(!params.target || ! params.id){
            console.warn('No target provided')
            return new Promise(()=>{return {data: []}})
        }
        
        const pk_delimiter = resource_conf.pk_delimiter || '_'
        let fks = params.target.split(pk_delimiter)
        let ids = params.id.split(pk_delimiter)

        if(ids.length !== fks.length){
            if(fks.length > 1){
                console.warn("Wrong FK length, check your pk_delimiter", ids, fks) // todo
            }
            fks = [params.target]
            ids = [params.id]
        }

        prepareQueryFilter(query, ids, fks);
        
        query[`page[limit]`] = perPage
        query[`page[offset]`] = (page - 1) * perPage

        Object.keys(params.filter || {}).forEach((key) => {
            query[`filter[${key}]`] = params.filter[key];
        });
        
        const options = {};
        const rel_conf = resource_conf?.relationships || [];
        const includes: string[] = rel_conf.map((rel : any) => rel.name).join(",")
        const url = `${apiUrl}/${resource_name}?${stringify(query)}&include=${includes}`
        return httpClient(url, options).then(({ headers, json }) => {
            let total = json.meta?.total;
            if (json.meta && settings.total) {
            total = json.meta[settings.total];
            }
            // Use the length of the data array as a fallback.
            total = total || json.data.length;
            const lookup = new ResourceLookup(json);
            const jsonData = json.data.map((item: IJSONAPIResource) =>{
                return lookup.unwrapData(item)
            }
            );

            return {
            data: jsonData,
            total: total
            };
        });
    },

    /*******************************************************************************************
      update: update a resource on the jsonapi endpoint (PATCH /resource/id)
    ********************************************************************************************/
    update: async(resource : string, params: UpdateParams) => {
      
        const resource_name = decodeURI(resource)
        let type = conf["resources"][resource_name].type || resource_name;
        
        const previousDataFiltered = Object.keys(params.previousData)
            .filter(key => !(key in params.data))
            .reduce((obj: any, key: string) => {
                obj[key] = params.previousData[key];
                return obj;
            },
        {});

        let attributes = { ...previousDataFiltered, ...params.data };
        const data = {
            data: {
                id:  params.id,
                type: type,
                attributes: attributes
            }
        };

        return httpClient(`${apiUrl}/${resource_name}/${params.id}`, {
            method: settings.updateMethod,
            body: JSON.stringify(data)
            })
            .then(({ json }) => {
                const { id, attributes } = json.data;
                return {
                data: {
                    id,
                    ...attributes
                }
                };
            })
            .catch((err: HttpError) => {
                console.log('catch Error', err.body);
                const errorHandler = settings.errorHandler;
                return Promise.reject(errorHandler(err));
            });
      },
    
    /*******************************************************************************************
     * updateMany: update multiple resources on the jsonapi endpoint (PATCH /resource/id)
     *******************************************************************************************/
    updateMany: (resource: string, params: UpdateManyParams) =>
        Promise.all(
            params.ids.map((id) => {
            const data = {
                data: {
                attributes: params.data
                }
            };
            return httpClient(`${apiUrl}/${decodeURI(resource)}/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(params.data)
            })
            })
        )
        .then((responses) => ({ data: responses.map(({ json }) => json.id) })),

    /*******************************************************************************************
     * create: create a resource on the jsonapi endpoint (POST /resource)
     *******************************************************************************************/
    create: (resource : string, params: any) => {
        const conf : { [ key: string] : any } = getConf();
        const resource_name = decodeURI(resource)
        let type = conf["resources"][resource_name].type || resource_name;
        const attributes = params.data?.current?.data || params.data;
        console.debug('creating resource with params', attributes)
        
        const data = {
            data: {
            type: type,
            attributes: attributes
            }
        };
        return httpClient(`${apiUrl}/${resource_name}`, {
            method: 'POST',
            body: JSON.stringify(data)
        })
            .then(({ json }) => {
            const { id, attributes } = json.data;
            return {
                data: {
                id,
                ...attributes
                }
            };
            })
            .catch((err: HttpError) => {
            console.log('catch Error', err.body);
            const errorHandler = settings.errorHandler;
            return Promise.reject(errorHandler(err));
            })
        },

    /*******************************************************************************************
     * delete: delete a resource on the jsonapi endpoint (DELETE /resource/id)
     *******************************************************************************************/
    delete: (resource, params) =>
        httpClient(`${apiUrl}/${decodeURI(resource)}/${params.id}`, {
            method: 'DELETE',
            headers: new Headers({'Content-Type': 'text/plain'})
        }).then(({ json }) => ({ data: json })),

    /*******************************************************************************************
     * deleteMany: delete multiple resources on the jsonapi endpoint (DELETE /resource/id)
     *******************************************************************************************/
    deleteMany: (resource, params) =>
        Promise.all(params.ids.map((id) =>
            httpClient(`${apiUrl}/${decodeURI(resource)}/${id}`, {
                method: 'DELETE',
                headers: new Headers({'Content-Type': 'text/plain'})
            })
        )
        ).then((responses) => ({
            data: responses.map(({ json }) => json)
        })),

    /*******************************************************************************************
     * execute: execute a rpc command on the jsonapi endpoint (POST /resource/id/command)
     *******************************************************************************************/
    execute: (resource_name_en: string, command: string, data: {  id: string|undefined, data?: any, args?: any }) => {
        const conf = getConf();
        const resource_name = decodeURI(resource_name_en)
        console.log(`execute rpc on resource ${resource_name} with params`, data)
        const id = data?.id || ""
        if(!command){
            console.warn('No command provided')
            return new Promise(()=>{})
        }
        const endpoint = id ? `${apiUrl}/${resource_name}/${id}/${command}` : `${apiUrl}/${resource_name}/${command}`
        return httpClient(endpoint, {
            method: 'POST',
            body: JSON.stringify(data?.args || {})
        })
        .then(({json}) => {
            return { data: json };
        })
      },

    /*******************************************************************************************
     * getResources
     *******************************************************************************************/
    getResources: () => {

        return Promise.resolve({data: conf});

    },
  };
};

/*
Call safrs jsonapi rpc endpoints
*/
export const jaRpc = async (endpoint: string, data?: any, options?: RequestInit) => {
  
  const url = `${conf.api_root}/${endpoint}`;
  
  const defaultOptions: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
    },
    body: JSON.stringify(data || {}),
  };
  const requestOptions = { ...defaultOptions, ...options };
  const response = await fetch(url, requestOptions);
  return response.json();
};

