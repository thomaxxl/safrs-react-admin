import {getConf} from './Config'
import {resetConf} from "./components/ConfigurationUI";

const dummy_auth = () => {
    localStorage.setItem('auth_token','xxxx')
    localStorage.setItem('username','admin')
}



const authProvider = {

    login: ({ username, password }) =>  {
        const conf = getConf()
        if(! conf.api_root?.includes("/admin/api")){
            dummy_auth()
            return Promise.resolve()
        }
        const login_url = `${conf.api_root}/Users/login_user`
        
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
                    document.location.href = "/#/login"
                }
                else if(response.status !== 200){
                    alert(`Unknown Status '${response.statusText}'`)
                }
                return response.json()
            })
            .then(data =>{
                localStorage.setItem('auth_token',data.auth_token)
                localStorage.setItem('username', username)}
            )
            .catch((err)=>{
                console.warn(`Authentication Failed: ${err}`)
                dummy_auth()
            })
    },
    logout: () => {
        dummy_auth()
        const cookies = document.cookie.split(";");
        for (const cookie of cookies) {
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
        return Promise.resolve();
    },
    checkError: (error) => {
        console.warn(`Auth error ${error}`)
        authProvider.login(0,0)
        return Promise.resolve();

    },
    checkAuth: () => {
        const conf = getConf()
        if(!conf.auth_url){
            return Promise.resolve()
        }
        const token = localStorage.getItem('auth_token')
        try{
            const iat = JSON.parse(atob(token.split('.')[0])).iat
            const token_age = Date.now() / 1000 - iat
            if(token_age > 5*60){
                // refresh tokens older than 5 min
                authProvider.login(0,0)
            }
        }
        catch(exc){
            console.warn('checkAuth')
            console.debug(exc)
            authProvider.login(0,0)
            //localStorage.removeItem('auth_token');
        }
        
        return localStorage.getItem('auth_token')
            ? Promise.resolve()
            : Promise.reject();
    },
    getPermissions: () => Promise.resolve(),

}


if(!localStorage.getItem('username')){
    console.log('Dummy Authentication - Demo')
    dummy_auth()
    resetConf()
}

export default authProvider;