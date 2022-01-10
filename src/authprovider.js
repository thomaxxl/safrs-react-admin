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
            body: JSON.stringify({username: username, password: password})
        };
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
    checkError: ({error}) => {
        return Promise.resolve();

    },
    checkAuth: () => {
        return localStorage.getItem('auth_token')
            ? Promise.resolve()
            : Promise.reject();
    },
    getPermissions: () => Promise.resolve(),

}

export default authProvider;