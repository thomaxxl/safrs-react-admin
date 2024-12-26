import {IJSONAPIResource, IRelationship, IJSONAPIResponse} from './interfaces';



/**
 * A map-like class that maps resource linkage objects {id: 1, type: "user"} to concrete resources with attributes and
 * relationships
 */
export default class ResourceLookup {
  lookup: Map<any, any>;
  includes: string[];

  /**
   * Constructs a new lookup map
   * @param {IJSONAPIResponse} response A JSON API response
   */
  constructor(apiResponse: IJSONAPIResponse) {
      this.lookup = new Map();
      this.includes = [];

      // If the response wasn't a JSON dictionary, we can't and don't need to build a lookup
      if (typeof apiResponse !== 'object') return;

      let resources = apiResponse.data;
      if (Object.prototype.hasOwnProperty.call(apiResponse, 'included')) {
          resources = [...apiResponse.data, ...apiResponse.included];
      }

      // Iterate over each resource returned and put each in the lookup
      for (const entry of resources) {
          const key = this.getKey(entry);
          this.lookup.set(key, entry);
      }
  }

  /**
   * Calculates a hashable key for JSON API resources
   * @param resource A resource linkage object
   * @returns {string}
   */
  getKey(resource: any) {
      return `${resource.type}:${resource.id}`;
  }

  /**
   * Looks up a resource
   * @param resource A resource linkage object
   * @returns {Object}
   */
  get(resource: any) {
      // If we don't have included data for this resource, just return the Resource Linkage object, since that's still
      // useful
      if (this.has(resource)) {
            return this.lookup.get(this.getKey(resource));
      } else {
            console.warn('resourceLookup.get failed for', resource);
            return structuredClone(resource);
      }
  }

  /**
   * Returns true if the resource is in the lookup
   * @param resource
   * @returns {boolean}
   */
  has(resource: any) {
      return this.lookup.has(this.getKey(resource));
  }

  /**
   * Converts a JSON API data object (with id, type, and attributes fields) into a flattened object
   * @param {Object} jsonApiResource A JSON API data object
   */
  unwrapData(jsonApiResource: IJSONAPIResource) {
      // The base resource object
      const result = Object.assign(
          {
              id: jsonApiResource?.id,
              ja_type: jsonApiResource?.type,
              attributes: jsonApiResource.attributes || {},
          },
          jsonApiResource.attributes
      );

      // Deal with relationships
      if (Object.prototype.hasOwnProperty.call(jsonApiResource, 'relationships') ) {
          result.relationships = jsonApiResource.relationships;
          for (const [relationshipName, relationship] of Object.entries(jsonApiResource.relationships)) {
              if ((relationship as IRelationship).data === null) {
                  result[relationshipName] = null;
              }
              if (!(relationship as IRelationship).data) {
                  continue;
              } else if (Array.isArray((relationship as IRelationship).data && (relationship as IRelationship).data)) {
                    /*
                        relationship is a tomany relationship, so we need to map over the data array and get the actual resource
                    */
                    result[relationshipName] = (relationship as IRelationship).data?.map((linkage:any) => {  
                        const resource = this.get(linkage);
                        const lresult = structuredClone(this.unwrapData(resource))
                        return lresult;
                  });
              } else if ((relationship as IRelationship).data?.id) {
                    /* 
                        relationship is a to-one relationship
                    */
                    const resource = this.get((relationship as IRelationship).data);
                    result[relationshipName] = this.unwrapData(resource);
              }
          }
      }
      
      try {
        JSON.stringify(structuredClone(result));
      }
      catch(e){
        return null;
      }
      return structuredClone(result);
  }
}

function lowerFirstLetter(s: string): string {
  return s;
  return s[0].toLowerCase() + s.slice(1);
}