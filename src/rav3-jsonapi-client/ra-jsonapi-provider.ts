import { stringify } from 'query-string';
import { fetchUtils, DataProvider, HttpError } from 'react-admin';
import merge from 'deepmerge';
import { defaultSettings } from './default-settings';
import ResourceLookup from './resourceLookup';

/**
 * https://github.com/marmelab/react-admin/blob/master/packages/ra-data-simple-rest/src/index.ts
 * Latest commit 44a1d8f on 6 Dec 2020
 * 44a1d8f569db23a7fc826c1a9094e4e041cc51da
 * https://github.com/marmelab/react-admin/tree/44a1d8f569db23a7fc826c1a9094e4e041cc51da
 *
 * Maps react-admin queries to a simple REST API
 *
 * This REST dialect is similar to the one of FakeRest
 *
 * @see https://github.com/marmelab/FakeRest
 *
 * @example
 *
 * getList     => GET http://my.api.url/posts?sort=['title','ASC']&range=[0, 24]
 * getOne      => GET http://my.api.url/posts/123
 * getMany     => GET http://my.api.url/posts?filter={id:[123,456,789]}
 * update      => PUT http://my.api.url/posts/123
 * create      => POST http://my.api.url/posts
 * delete      => DELETE http://my.api.url/posts/123
 *
 * @example
 *
 * import * as React from "react";
 * import { Admin, Resource } from 'react-admin';
 * import simpleRestProvider from 'ra-data-simple-rest';
 *
 * import { PostList } from './posts';
 *
 * const App = () => (
 *     <Admin dataProvider={simpleRestProvider('http://path.to.my.api/')}>
 *         <Resource name="posts" list={PostList} />
 *     </Admin>
 * );
 *
 * export default App;
 * export default (apiUrl, userSettings = {}) => (type, resource, params) => {
  let url = '';
  const settings = merge(defaultSettings, userSettings);

  const options = {
    headers: settings.headers,
  };
 */
export const jsonapiClient = (
  apiUrl: string,
  userSettings = {},
  httpClient = fetchUtils.fetchJson,
  countHeader: string = 'Content-Range'
): DataProvider => {
  const settings = merge(defaultSettings, userSettings);
  let conf : any = {"resources" : {}};
  try{
    conf = JSON.parse(localStorage.getItem('raconf')||"");
  }
  catch(e){
    console.warn("Failed to parse config");
  }
  
  return {
    getList: (resource, params) => {
      /*todo: rename resource to resource_name*/

      const { page, perPage } = params.pagination;
      console.log(page, perPage);

      // Create query with pagination params.
      const query : {[k: string]: any} = {
        'page[number]': page,
        'page[size]': perPage,
        'page[offset]': (page - 1) * perPage,
        'page[limit]': perPage,
        sort: ' '
      };

      // Add all filter params to query.
      if(params.filter?.q){
        // search is requested by react-admin
        const resource_conf : any = conf.resources[resource]        ;
        const search_cols = resource_conf.columns.filter((col : any) => col.search == true).map((col :any) => col.name);
        console.log(search_cols);
        query['filter'] = JSON.stringify(search_cols.map((col_name: string) => {return { 
                              "name":col_name,
                              "op":"like",
                              "val":`${params.filter.q}%`};}) // => startswith operator in sql
            )
        console.log(query['filter'])
      }
      else{
        Object.keys(params.filter || {}).forEach((key) => {
          query[`filter[${key}]`] = params.filter[key];
        });
      }

      // Add sort parameter
      if (params.sort && params.sort.field) {
        const prefix = params.sort.order === 'ASC' ? '' : '-';
        query.sort = `${prefix}${params.sort.field}`;
      }
      const includes: string[] = [];

      const includeRelations: includeRelations[] = settings.includeRelations;

      for (const ir of includeRelations) {
        if (resource === ir.resource) {
          query['include'] = ir.includes.join(',');
          for (const include of ir.includes) {
            includes.push(include);
          }
          break;
        }
      }

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
          total = total || json.data.length; //  { id: any; attributes: any; }
          const lookup = new ResourceLookup(json);
          const jsonData = json.data.map((resource: any) =>
            lookup.unwrapData(resource, includes)
          );
          /* const jsonData = json.data.map((value: any) => {
          const relAttributeKey = Object.keys(value)[0];
          return Object.assign(
            { id: value.id },
            value.attributes,
            value[relAttributeKey]
          );
        }); */

          return {
            data: jsonData,
            total: total
          };
        })
        .catch((err: HttpError) => {
          console.log('catch Error', err.body);
          const errorHandler = settings.errorHandler;
          return Promise.reject(errorHandler(err));
        });
    },

    /* getOne: (resource, params) =>
      httpClient(`${apiUrl}/${resource}/${params.id}`).then(({ json }) => ({
        data: json.data
      })), */

    getOne: (resource: any, params: { id: any }) => {
      const url = `${apiUrl}/${resource}/${params.id}?include=%2Ball&page[limit]=50`;
      return httpClient(url).then(({ json }) => {
        const { id, attributes, relationships } = json.data;
        //const included = json.included;
        Object.assign(attributes, relationships);
        return {
          data: {
            id,
            ...attributes
          }
        };
      });
    },

    getMany: (resource, params) => {
      resource = capitalize(resource);
      /* const query = {
        filter: JSON.stringify({ id: params.ids })
      }; */
      const query = 'filter[id]=' + JSON.stringify(params.ids);
      // const url = `${apiUrl}/${resource}?${stringify(query)}`;
      const url = `${apiUrl}/${resource}?${query}`;
      return httpClient(url).then(({ json }) => {
        // When meta data and the 'total' setting is provided try
        // to get the total count.
        let total = 0;
        if (json.meta && settings.total) {
          total = json.meta[settings.total];
        }
        // Use the length of the data array as a fallback.
        total = total || json.data.length; //  { id: any; attributes: any; }
        const jsonData = json.data.map((value: any) =>
          Object.assign({ id: value.id }, value.attributes)
        );

        return {
          data: jsonData,
          total: total
        };
      });
    },

    getManyReference: (resource, params) => {
      const { page, perPage } = params.pagination;
      const { field, order } = params.sort;

      const query: {[k: string]: any} = {
        sort: JSON.stringify([field, order]),
        range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
        filter_: JSON.stringify({
          ...params.filter
        })
      };
      query[`filter[${params.target}]`] = params.id
      const url = `${apiUrl}/${resource}?${stringify(query)}`;
      const options = {};
      
      return httpClient(url, options).then(({ headers, json }) => {
        if (!headers.has(countHeader)) {
          console.debug(
            `The ${countHeader} header is missing in the HTTP Response. The simple REST data provider expects responses for lists of resources to contain this header with the total number of results to build the pagination. If you are using CORS, did you declare ${countHeader} in the Access-Control-Expose-Headers header?`
          );
        }
        return {
          data: json.data,
          total: 100
          /*  countHeader === 'Content-Range'
              ? parseInt(
                  headers.get('content-range') ?? ''.split('/').pop() ?? '10',
                  10
                )
              : parseInt(headers.get(countHeader.toLowerCase()) ?? '0')
        }; */
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
  return s[0].toUpperCase() + s.slice(1);
}
export interface includeRelations {
  resource: string;
  includes: string[];
}
