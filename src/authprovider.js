import { showNotification } from 'react-admin';
import { connect } from 'react-redux';
import {get_Conf} from './Config'

const conf = get_Conf()

const authProvider = {
    login: ({ username, password }) =>  {
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
            .then(response => response.json())
            .then(data =>{
                localStorage.setItem('auth_token',data.auth_token)
                localStorage.setItem('username', username)}
            )
            .catch((err)=>{
                console.warn(`Authentication Failed: ${err}`)
                localStorage.setItem('auth_token','dummy auth')
            })
    },
    logout: () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('username');
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
        const has_token = localStorage.getItem('auth_token')
        //localStorage.removeItem('auth_token');
        //localStorage.removeItem('username');
        //has_token && window.location.reload()
        return Promise.resolve();

    },
    checkAuth: () => {
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
            console.warn(exc)
            //localStorage.removeItem('auth_token');
        }
        return localStorage.getItem('auth_token')
            ? Promise.resolve()
            : Promise.reject();
    },
    getPermissions: () => Promise.resolve(),

}

export default authProvider;