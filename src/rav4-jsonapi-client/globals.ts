import { LocalStorage } from 'node-localstorage';

declare global {
  namespace NodeJS {
    interface Global {
      sessionStorage: Storage;
      localStorage: Storage;
      window: any;
    }
  }
}


global.sessionStorage = new LocalStorage('./sessionStorage');
global.localStorage = new LocalStorage('./localStorage');
global.window = {
  sessionStorage: global.sessionStorage,
  localStorage: global.localStorage,
}