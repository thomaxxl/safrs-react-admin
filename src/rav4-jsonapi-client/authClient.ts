import { fetchUtils, HttpError } from 'react-admin';
import Keycloak from 'keycloak-js';

export const getKeycloakHeaders = (
  keycloak: Keycloak,
  options: fetchUtils.Options | undefined
): Headers => {
  const headers = ((options && options.headers) ||
      new Headers({
          Accept: 'application/json',
      })) as Headers;
  if(keycloak?.isTokenExpired()){
      keycloak.updateToken(30);
  }
  if (keycloak.token) {
      headers.set('Authorization', `Bearer ${keycloak.token}`);
  }
  return headers;
};

export const httpAuthClient = (url: string, options: any) => {
  if (!options.headers) {
      options.headers = new Headers({ Accept: 'application/json' });
  }
  const token: string = localStorage.getItem('auth_token') || "";
  if(token){
    options.headers.set('Authorization', `Bearer ${token}`);
  }
  return fetchUtils.fetchJson(url, options)
    .catch((e: HttpError) => {
      const msg = e.body?.msg || "Unknown Error.";
      console.warn('httpAuthClient httperror', e, e.status, e.body, msg);
      if(e.body?.message?.startsWith('Booting project')){
        // Custom error handling for booting, todo!!
        console.log('WGserver_response: booting', e, e.status, e.body);
        setTimeout(() => document.location.reload(), 3000);
        throw new HttpError(e, e.status, 
          {title: "Booting", 
          detail:"Booting project, please wait", 
          message:"Booting project, please wait",
          code:e.status});
      }
      throw new HttpError(e, e.status, e.body);
    });
};

export const createKCHttpAuthClient = (keycloak: Keycloak) => (
  url: any,
  options: fetchUtils.Options | undefined
) => {
  if(!keycloak){
    console.error("No keycloak");
    return;
  }
  if(keycloak.token){
    localStorage.setItem('auth_token', keycloak.token);
  }
  const requestHeaders = getKeycloakHeaders(keycloak, options);
  return fetchUtils.fetchJson(url, {
      ...options,
      headers: requestHeaders,
  })
  .catch(e => {
    console.warn('KC httpAuthClient httperror', e, e.body);
    if(e.body?.message?.startsWith('Booting project')){
      // Custom error handling for booting, todo!!
      console.log('WGserver_response: booting', e, e.status, e.body);
      setTimeout(() => document.location.reload(), 3000);
      throw new HttpError(e, e.status, 
        {title: "Booting", 
         detail:"Booting project, please wait", 
         message:"Booting project, please wait",
         code:e.status});
    }
    throw new HttpError(e, e.status, e.statusText);
  });
};