import { fetchUtils, DataProvider, HttpError } from 'react-admin';


function fetchJson(url: string, options: any): Promise<any> {
    return fetchUtils.fetchJson(url, options);
}

console.log('Hello, world!');
fetchJson('http://localhost:5656/api/Customer', { method: 'GET' }).then((response) => {
    console.log('Response:', response);
}).catch((error) => {
    console.error('Error:', error);
})