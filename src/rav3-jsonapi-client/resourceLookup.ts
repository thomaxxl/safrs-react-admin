/**
 * A map-like class that maps resource linkage objects {id: 1, type: "user"} to concrete resources with attributes and
 * relationships
 */
export default class ResourceLookup {
  lookup: Map<any, any>;
  includes: string[];
  /**
   * Constructs a new lookup map
   * @param {Object} response A JSON API response, in JSON format
   */
  constructor(response: any) {
    this.lookup = new Map();
    this.includes = [];

    // If the response wasn't a JSON dictionary, we can't and don't need to build a lookup
    if (typeof response !== 'object') return;

    let resources;
    // if (response.hasOwnProperty('included')) {
    if (Object.prototype.hasOwnProperty.call(response, 'included')) {
      resources = [...response.data, ...response.included];
    } else {
      resources = response.data;
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
      return resource;
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
   * @param {Object} response A JSON API data object
   */
  unwrapData(response: any, includes: string[]) {
    // The base resource object
    const ret = Object.assign(
      {
        id: response.id
      },
      response.attributes
    );
    if (includes.length === 0) {
      // shortcut, no includes: scip relationships
      return ret;
    }
    // Deal with relationships
    // if (response.hasOwnProperty('relationships')) {
    if (Object.prototype.hasOwnProperty.call(response, 'relationships')) {
      // ret.relationships = {};
      for (const relationName of Object.keys(response.relationships)) {
        if (!includes.includes(relationName)) {
          continue; // if we do not have includes for rlationships, we skip
        }
        if (includes && relationName in includes) {
          continue;
        }
        const relation = response.relationships[relationName].data;
        if (Array.isArray(relation)) {
          ret[relationName] = relation.map((resource) => {
            const includedRelation = this.get(resource);
            const relationshipData = Object.assign(
              {
                id: includedRelation.id
              },
              includedRelation.attributes
            );
            return relationshipData; // this.unwrapData(this.get(resource));
          });
        } else if (relation == null) {
          continue; // empty many to one relanships return a null value in jsaonaopi spec , == instead of ===: doing nothing also in case of undefined
        } else {
          const includedResource = this.get(relation);
          const relationshipData = Object.assign(
            {
              id: includedResource.id
            },
            includedResource.attributes
          );
          ret[lowerFirstLetter(relation.type)] = relationshipData; // this.unwrapData(this.get(relation)); // ret.relationships[relationName] =
        }
      }
    }

    return ret;
  }
}

function lowerFirstLetter(s: string): string {
  return s[0].toLowerCase() + s.slice(1);
}
