export interface IJSONAPIResource {
    id: string;
    type: string;
    attributes: {
        [key: string]: any;
    };
    relationships?: {
        [key: string]: {
            data: { type: string; id: string } | { type: string; id: string }[];
            links?: {
                self: string;
                related: string;
            };
            meta?: {
                [key: string]: any;
            };
        };
    };
    links?: {
        self: string;
    };
    meta?: {
        [key: string]: any;
    };
}

export interface IRelationship {
    data: null | { id: string; type: string } | Array<{ id: string; type: string }>;
    relationships?: { [key: string]: IRelationship };
}

export interface IJSONAPIResponse {
    data: IJSONAPIResource | IJSONAPIResource[];
    included?: IJSONAPIResource[];
    links?: {
        self: string;
        related: string;
    };
    meta?: {
        [key: string]: any;
    };
}

export interface includeRelations {
    resource: string;
    includes: string[];
  }
  