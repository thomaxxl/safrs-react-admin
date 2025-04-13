import React, { useState, useEffect } from 'react';
import { useDataProvider } from 'react-admin';


const prompt1_conf_description = `
Backend JSONAPI endpoint metadata is described in the following <resources> section , each key is a resource collection endpoint name.
The tab_groups attribute describes the resource relationships, with fks being the foreign keys of the related resource.
user_key tells which attribute should be shown when referencing the resource. for example, if the user_key is "name", the resource will be shown by its "name" in the UI.
<resources>
`
const prompt1_conf_description_end = `</resources> 

ignore SPAPage and SPASection resources.

`

const prompt2_jsonapi_description = `
This JSONAPI is fetched using the react-admin dataProvider (useDataprovider hook).
All resources have a "type" and "id" attributes (according to the JSONAPI specification).

Besides the regular parameters, the dataProvider is extended to interpret the "include" meta parameter to retrieve included relationships.

<javascriptCode>
dataProvider.getList(resourceName, {
            pagination: { page: 1, perPage: 10 },
            meta: { include: ["relationship_name"]}
})
</javascriptCode>

attributes are inlined in the instance: 
for example, if the resource is "some_resource" and the attribute is "name", then 'some_resource.name' will be the attribute value.

included relationships are inlined in the instance:
for example, if the resource is "some_resource" and the relationship is "relationship_name", the included data will be in the instance "relationship_name" key (some_resource.relationship_name).
So:
some_resource.relationship_name.id will be the id of the included (toone) relationship.
some_resource.relationship_name will be an array of included (tomany) relationships.


Decide which resource is the most important to display first on the landing page for this organisation.
Then create a single page of mui react code to render a list of that resource data. (the list can be a card or a table, decide which is more aesthetic for this case)

When clicking on an item in the list, it should open a modal dialog with relevant details of the item, including relevant details of related resources 
(don't display items that are useless to a person).

Make the title variant h6, and the body variant body1.
Only use the imports provided by the '@mui/material' and 'react-admin' libraries.

`


const PromptBuilder = () => {

    const conf = JSON.parse(sessionStorage.getItem("raconf") || "{}");
    const resources = conf.resources;
    const prompt = prompt1_conf_description + JSON.stringify(resources, null, 4) + prompt1_conf_description_end + prompt1_conf_description_end  + prompt2_jsonapi_description

    return <>
        
        <pre>
            {prompt}
        </pre>
    </>
}

export default PromptBuilder;