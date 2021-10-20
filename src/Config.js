import config from './Config.json'

const ls_conf = JSON.parse(localStorage.getItem("raconf"))
const result = ls_conf ? ls_conf : config
result.api_root = result.api_root ? result.api_root : 'http://192.168.109.131:5000' // 'https://apilogicserver.pythonanywhere.com/'


export default result