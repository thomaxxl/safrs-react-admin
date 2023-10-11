import {getConf} from './Config'
import {resetConf} from "./components/ConfigurationUI";

const authProvider = {
    login: ({ username, password }) =>  {
        const conf = getConf()
        
        console.log(conf.authentication)
        /*if(! conf.api_root?.includes("/admin/api")){
            //dummy_auth()
            return Promise.resolve()
        }*/
        //const login_url = `${conf.api_root}/Users/login_user`
        const login_url = `${conf.authentication?.endpoint}`
        
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: username ? JSON.stringify({username: username, password: password}) : "{}"
        };
        if(!username){
            requestOptions.headers["Authorization"] = `Bearer ${localStorage.getItem('auth_token')}`
        }
        
        return fetch(login_url, requestOptions)
            .then(response => {
                if(response.status === 403){
                    console.log("403 - Not logged in - redirect")
                    if (conf.authentication.redirect){
                        window.location.href = conf.authentication.redirect
                    }
                }
                else if(response.status !== 200){
                    return Promise.reject();
                }
                return response.json()
            })
            .then(data =>{
                localStorage.setItem('auth_token',data.access_token)
                localStorage.setItem('username', username)}
            )
            .catch((err)=>{
                console.warn(`Authentication Failed: ${err}`)
                return Promise.reject();
                //dummy_auth()
            })
    },
    logout: () => {
        localStorage.removeItem('auth_token');
        return Promise.resolve();
    },
    checkAuth: () =>
        localStorage.getItem('auth_token') ? Promise.resolve() : Promise.reject(),
    checkError:  (error) => {
        const status = error.status;
        if (status === 401 || status === 403) {
            localStorage.removeItem('username');
            localStorage.removeItem('auth_token');
            return Promise.reject();
        }
        // other error code (404, 500, etc): no need to log out
        return Promise.resolve();
    },
    getIdentity: () =>
        Promise.resolve({
            id: 'user',
            fullName:  localStorage.getItem('username'),
        }),
    getPermissions: () => Promise.resolve(''),
};

export default authProvider;