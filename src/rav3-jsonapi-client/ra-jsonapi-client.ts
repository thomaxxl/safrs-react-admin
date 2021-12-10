import { stringify } from 'query-string';
import { fetchUtils, DataProvider, HttpError } from 'react-admin';
import merge from 'deepmerge';
import { defaultSettings } from './default-settings';
import ResourceLookup from './resourceLookup';
import {get_Conf} from '../Config'

const conf : { [ key: string] : any } = get_Conf();
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
  httpClient = fetchUtils.fetchJson,
  countHeader: string = 'Content-Range'
): DataProvider => {
  const settings = merge(defaultSettings, userSettings);
  const conf__ = userSettings.conf;

  
  return {
    /*******************************************************************************************
     * getList
     *******************************************************************************************/
    getList: (resource, params) => {
      /*todo: rename resource to resource_name*/
      const resource_name = resource;
      const { page, perPage } = params.pagination;
      
      const resource_conf : any = conf.resources[resource_name];
      const sort : string = resource_conf.sort
      // Create query with pagination params.
      const query : {[k: string]: any} = {
        'page[number]': page,
        'page[size]': perPage,
        'page[offset]': (page - 1) * perPage,
        'page[limit]': perPage,
        sort: sort ? sort : ''
      };


      console.log(params)
      // Add all filter params to query.
      if(params.filter?.q && "resources" in conf){
        // search is requested by react-admin
        const search_cols = resource_conf.attributes.filter((col : any) => col.search == true).map((col :any) => col.name);
        const sort = resource_conf.sort
        const filter = search_cols.map((col_name: string) => {return { 
                              "name":col_name,
                              "op":"like",
                              "val":`${params.filter.q}%`};})
        console.log(filter)
        query['filter'] = JSON.stringify(filter) // => startswith operator in sql
          
      }
      else{
        Object.keys(params.filter || {}).forEach((key) => {
          query[`filter[${key}]`] = params.filter[key];
        });
      }

      // Add sort parameter, first check the default configured sorting, then the customized sort
      if (params.sort && params.sort.field) {
        const prefix = params.sort.order === 'ASC' ? '' : '-';
        query.sort = `${prefix}${params.sort.field}`;
      }
      const rel_conf = conf.resources[resource_name].relationships || []
      const includes: string[] = rel_conf.map((rel : any) => rel.name);
      query['include'] = includes.join(',');

      const url = `${apiUrl}/${resource}?${stringify(query)}`;

      return httpClient(url)
        .then(({ json }) => {
          // const lookup = new ResourceLookup(json.data);
          // When meta data and the 'total' setting is provided try
          // to get the total count.
          let total = 0;
          if (json.meta && settings.total) {
            total = json.meta[settings.total];
          }
          // Use the length of the data array as a fallback.
          total = total || json.data.length;
          const lookup = new ResourceLookup(json);
          const jsonData = json.data.map((resource: any) =>{
              return lookup.unwrapData(resource, includes)
            }
          );
          return {
            data: jsonData,
            included: json.included,
            //included: json.included.map((item: any) => lookup.unwrapData(item, [])),
            total: total
          };
        })
        .catch((err: HttpError) => {
          console.log('catch Error', err.body);
          const errorHandler = settings.errorHandler;
          return Promise.reject(errorHandler(err));
        });
    },

    /*******************************************************************************************
      getOne
    ********************************************************************************************/
    getOne: (resource: any, params: { id: any }) => {
      //const url = `${apiUrl}/${resource}/${params.id}?include=%2Ball&page[limit]=50`;
      const resource_conf = conf["resources"][resource];
      if(!resource_conf){
        console.warn(`Invalid resource ${resource}`)
        return new Promise(()=>{});
      }
      const rel_conf = resource_conf?.relationships || [];
      const includes: string[] = rel_conf.map((rel : any) => rel.name).join(",")
      
      const url = `${apiUrl}/${resource}/${params.id}?include=${includes}`;
      
      return httpClient(url).then(({ json }) => {

        const { id, attributes, relationships, type } = json.data;
        //const included = json.included;
        Object.assign(attributes, relationships, {type: type}, {relationships: relationships}, {attributes: {...attributes} });
        return {
          data: {
            id,
            ...attributes
          }
        };
      });
    },

    /*******************************************************************************************
      getMany
    ********************************************************************************************/
    getMany: (resource, params) => {
      resource = capitalize(resource);
      /* const query = {
        filter: JSON.stringify({ id: params.ids })
      }; */
      const query = 'filter[id]=' + JSON.stringify(params.ids);
      // const url = `${apiUrl}/${resource}?${stringify(query)}`;
      const url = `${apiUrl}/${resource}?${query}`;
      return httpClient(url).then(({ json }) => {
        console.log('gtMany', json);
        // When meta data and the 'total' setting is provided try
        // to get the total count.
        let total = 0;
        if (json.meta && settings.total) {
          total = json.meta[settings.total];
        }
        // Use the length of the data array as a fallback.
        total = total || json.data.length; //  { id: any; attributes: any; }
        const jsonData = json.data.map((value: any) =>
          Object.assign({ id: value.id, type: value.type }, value.attributes)
        );

        return {
          data: jsonData,
          total: total
        };
      });
    },

    /*******************************************************************************************
      getManyReference
    ********************************************************************************************/
    getManyReference: (resource, params : any) => {
      console.log('GMR', params)
      console.log(resource, params.target)
      const fk = params.target
      
      const { page, perPage } = params.pagination;
      const { field, order } = params.sort;

      const query: {[k: string]: any} = {
        sort: JSON.stringify([field, order]),
      };
      query[`filter[${fk}]`] = params.id
      query[`page[limit]`] = perPage
      query[`page[offset]`] = (page - 1) * perPage
     
      const options = {};
      const resource_conf = conf["resources"][resource];
      const rel_conf = resource_conf?.relationships || [];
      const includes: string[] = rel_conf.map((rel : any) => rel.name).join(",")
      const url = `${apiUrl}/${resource}?${stringify(query)}&include=${includes}`
      
      return httpClient(url, options).then(({ headers, json }) => {
        if (!headers.has(countHeader)) {
          console.debug(
            `The ${countHeader} header is missing in the HTTP Response. The simple REST data provider expects responses for lists of resources to contain this header with the total number of results to build the pagination. If you are using CORS, did you declare ${countHeader} in the Access-Control-Expose-Headers header?`
          );
        }
        let total = json.meta?.total;
        if (json.meta && settings.total) {
          total = json.meta[settings.total];
        }
        console.log(json)
        // Use the length of the data array as a fallback.
        total = total || json.data.length;
        const lookup = new ResourceLookup(json);
        const jsonData = json.data.map((resource: any) =>{
          return lookup.unwrapData(resource, includes)
          }
        );

        return {
          data: jsonData,
          total: total
        };
      });
    },

    update: (resource, params) => {
      let type = conf["resources"][resource].type;
      const arr = settings.endpointToTypeStripLastLetters;
      for (const i in arr) {
        if (resource.endsWith(arr[i])) {
          type = resource.slice(0, arr[i].length * -1);
          break; // quit after first hit
        }
      }
      const data = {
        data: {
          id: params.id,
          type: type,
          attributes: params.data
        }
      };

      return httpClient(`${apiUrl}/${resource}/${params.id}`, {
        method: settings.updateMethod,
        body: JSON.stringify(data)
      })
        .then(({ json }) => {
          const { id, attributes } = json.data;
          /* const attributes = json.data;
           delete attributes.id;
          const updateData: any = {
            any too keep compiler happy 
           data: {
              id: params.id,
              type: resource,
              attributes: attributes
            }
          }; */
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

    // simple-rest doesn't handle provide an updateMany route, so we fallback to calling update n times instead
    updateMany: (resource, params) =>
      Promise.all(
        params.ids.map((id) =>
          httpClient(`${apiUrl}/${resource}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(params.data)
          })
        )
      ).then((responses) => ({ data: responses.map(({ json }) => json.id) })),

    /* create_old: (resource, params) =>
      httpClient(`${apiUrl}/${resource}`, {
        method: 'POST',
        body: JSON.stringify(params.data)
      }).then(({ json }) => ({
        data: { ...params.data, id: json.id }
      })), */

    create: (resource, params) => {
      let type = resource;
      const arr = settings.endpointToTypeStripLastLetters;
      for (const i in arr) {
        if (resource.endsWith(arr[i])) {
          type = resource.slice(0, arr[i].length * -1);
          break; // quit after first hit
        }
      }
      const data = {
        data: {
          type: type,
          attributes: params.data
        }
      };
      return httpClient(`${apiUrl}/${resource}`, {
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
        });
    },

    delete: (resource, params) =>
      httpClient(`${apiUrl}/${resource}/${params.id}`, {
        method: 'DELETE',
        headers: new Headers({
          'Content-Type': 'text/plain'
        })
      }).then(({ json }) => ({ data: json })),

    // simple-rest doesn't handle filters on DELETE route, so we fallback to calling DELETE n times instead
    deleteMany: (resource, params) =>
      Promise.all(
        params.ids.map((id) =>
          httpClient(`${apiUrl}/${resource}/${id}`, {
            method: 'DELETE',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          })
        )
      ).then((responses) => ({
        data: responses.map(({ json }) => json.id)
      })),

    getResources: () => {
        
        if(conf){
            return Promise.resolve({data: conf});
        };
        return httpClient(`${apiUrl}/schema`, {
            method: 'GET'
        }).then(({json}) => {
            localStorage.setItem('raconf', JSON.stringify(json));
            return { data: json };
        })
        .catch(()=> {return {data : {}} })
      }
    
  };
};

function capitalize(s: string): string {
  return s;
  return s[0].toUpperCase() + s.slice(1);
}
export interface includeRelations {
  resource: string;
  includes: string[];
}
